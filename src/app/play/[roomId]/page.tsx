"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getAllowedBoards,
  type MiniBoardState,
  type Player,
  type UltimateState,
} from "@/components/ultimate-tic-tac-toe/ultimateTicTacToeLogic";

type ServerEvent =
  | {
      type: "snapshot";
      payload: {
        state: UltimateState;
        players: {
          X?: { id: string; name: string };
          O?: { id: string; name: string };
        };
        role: "X" | "O" | "spectator";
        started: boolean;
      };
    }
  | {
      type: "players";
      payload: {
        players: {
          X?: { id: string; name: string };
          O?: { id: string; name: string };
        };
        started: boolean;
      };
    }
  | { type: "state"; payload: { state: UltimateState } }
  | { type: "error"; payload: { message: string } };

const POSITIONS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const INACTIVITY_LIMIT_MS = 40 * 60 * 1000;

function getOrCreateClientId() {
  if (typeof window === "undefined") return "";
  const key = "uttt-client-id";
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function OnlineUTTTPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const search = useSearchParams();

  const [clientId] = useState<string>(() => getOrCreateClientId());
  const [name, setName] = useState<string>("");
  const [inputName, setInputName] = useState<string>("");
  const [hover, setHover] = useState<{ b: number; c: number } | null>(null);

  // Track last interaction (resets countdown)
  const [lastInteractionAt, setLastInteractionAt] = useState<number>(() =>
    Date.now(),
  );
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Pre-fill name from URL (?name=foo) or sessionStorage
  useEffect(() => {
    const qsName = search.get("name");
    const saved =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("uttt-name")
        : null;
    const initial = qsName || saved || "";
    setInputName(initial);
    setName(saved || "");
  }, [search]);

  // Polling snapshot every 2s when joined (name set)
  const { data, isSuccess, isError, isFetching, refetch } = useQuery({
    queryKey: ["uttt-snapshot", roomId, clientId, name || ""],
    enabled: Boolean(roomId && clientId && name),
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<ServerEvent> => {
      const url = new URL(
        `/api/uttt/rooms/${roomId}/events`,
        window.location.origin,
      );
      url.searchParams.set("clientId", clientId);
      url.searchParams.set("name", name || "Convidado");
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Falha ao buscar estado da sala");
      }
      return (await res.json()) as ServerEvent;
    },
  });

  const snapshot = data && data.type === "snapshot" ? data : undefined;
  const role: "X" | "O" | "spectator" = snapshot?.payload.role ?? "spectator";
  const state: UltimateState | null = snapshot?.payload.state ?? null;
  const players =
    snapshot?.payload.players ??
    ({} as {
      X?: { id: string; name: string };
      O?: { id: string; name: string };
    });
  const started = snapshot?.payload.started ?? false;

  // Leave room on unload/unmount
  useEffect(() => {
    if (!roomId || !clientId) return;

    const leave = () => {
      try {
        const url = `/api/uttt/rooms/${roomId}/events`;
        const body = JSON.stringify({ clientId, action: "leave" });
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      } catch {
        // ignore
      }
    };

    window.addEventListener("beforeunload", leave);
    return () => {
      leave();
      window.removeEventListener("beforeunload", leave);
    };
  }, [roomId, clientId]);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin + `/play/${roomId}`
      : "";

  const currentPlayer: Player | null = state ? state.nextPlayer : null;
  const allowedBoards = useMemo(
    () => (state ? getAllowedBoards(state) : []),
    [state],
  );

  async function postAction(action: any) {
    await fetch(`/api/uttt/rooms/${roomId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, ...action }),
    });
    setLastInteractionAt(Date.now());
    await refetch();
  }

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalName = inputName.trim() || "Convidado";
    setName(finalName);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("uttt-name", finalName);
    }
    void postAction({ type: "join", name: finalName });
  }

  async function onCellClick(bi: number, ci: number) {
    if (!state) return;
    if (role !== state.nextPlayer) return;
    await postAction({ type: "move", boardIndex: bi, cellIndex: ci });
    setHover(null);
  }

  async function onReset() {
    await postAction({ type: "reset" });
  }

  async function onSaveName() {
    const newName = inputName.trim() || "Convidado";
    setName(newName);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("uttt-name", newName);
    }
    await postAction({ type: "setName", name: newName });
  }

  const connected = isSuccess && !isError;

  const remainingMs = Math.max(
    0,
    INACTIVITY_LIMIT_MS - (nowTick - lastInteractionAt),
  );
  const countdownLabel = formatDuration(remainingMs);

  if (!state) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center gap-6">
        <div className="w-full max-w-sm self-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            ← Início
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Jogo da Velha 2.0 — Online</h1>
        <form
          onSubmit={handleJoinSubmit}
          className="flex flex-col gap-3 w-full max-w-sm"
        >
          <label className="text-sm font-medium" htmlFor="name">
            Seu nome
          </label>
          <input
            id="name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="border rounded-md px-3 py-2 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            placeholder="Digite seu nome"
          />
          <button
            type="submit"
            className="rounded-md px-3 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Entrar na sala
          </button>
        </form>
        <p className="text-xs text-neutral-500">Sala: {roomId}</p>
      </main>
    );
  }

  const me =
    (role === "X" && players.X?.name) ||
    (role === "O" && players.O?.name) ||
    name ||
    "Você";

  const opponent =
    role === "X"
      ? (players.O?.name ?? "Aguardando…")
      : role === "O"
        ? (players.X?.name ?? "Aguardando…")
        : "";

  const statusText =
    state.overallStatus === "WON_X"
      ? `Vitória: X (${players.X?.name ?? "Jogador X"})`
      : state.overallStatus === "WON_O"
        ? `Vitória: O (${players.O?.name ?? "Jogador O"})`
        : state.overallStatus === "DRAW"
          ? "Empate!"
          : role === state.nextPlayer
            ? `Sua vez (${role})`
            : `Vez do oponente (${state.nextPlayer})`;

  return (
    <main className="min-h-screen p-6 flex flex-col items-center gap-6">
      <div className="w-full max-w-4xl self-start">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          ← Início
        </Link>
      </div>

      {/* Inactivity countdown banner */}
      <div
        className={[
          "w-full max-w-4xl rounded-md px-3 py-2 text-sm",
          "border",
          remainingMs > 5 * 60 * 1000
            ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20"
            : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20",
          "text-neutral-800 dark:text-neutral-200",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        Inatividade: se não houver interação em até 40 minutos, a sala será
        fechada. Tempo restante:{" "}
        <span className="font-mono font-semibold">{countdownLabel}</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">Jogo da Velha 2.0 — Online</h1>
        <div className="text-sm text-neutral-600 dark:text-neutral-300">
          Sala: <span className="font-mono">{roomId}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Compartilhe:</span>
          <input
            readOnly
            value={shareUrl}
            className="w-[320px] border rounded px-2 py-1 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:flex-row flex-col">
        <div className="rounded border px-3 py-2 border-neutral-300 dark:border-neutral-700">
          Você: <span className="font-semibold">{me}</span>{" "}
          {role !== "spectator" ? `(${role})` : "(espectador)"}
        </div>
        <div className="rounded border px-3 py-2 border-neutral-300 dark:border-neutral-700">
          Oponente: <span className="font-semibold">{opponent}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="border rounded-md px-2 py-1 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
          />
        </div>
      </div>

      <div
        className="text-lg font-semibold"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusText}
      </div>

      {/* Tabuleiro geral 3x3 */}
      <div className="grid grid-cols-3 gap-3">
        {POSITIONS.map((mb) => {
          const mini: MiniBoardState = state.boards[mb];
          const isAllowed = allowedBoards.includes(mb);
          const isWonX = mini.status === "WON_X";
          const isWonO = mini.status === "WON_O";
          const isDraw = mini.status === "DRAW";
          const completed = mini.status !== "IN_PROGRESS";

          return (
            <div
              key={`mini-${mb}`}
              className={[
                "rounded-lg p-2",
                "bg-white dark:bg-neutral-900",
                "border",
                isAllowed
                  ? state.nextPlayer === "X"
                    ? "border-emerald-400 dark:border-emerald-500"
                    : "border-sky-400 dark:border-sky-500"
                  : "border-neutral-300 dark:border-neutral-700",
                state.overallWinnerLine?.includes(mb)
                  ? "ring-2 ring-emerald-500"
                  : "",
              ].join(" ")}
              aria-label={`Tabuleiro ${mb + 1}${
                completed
                  ? isWonX
                    ? " conquistado por X"
                    : isWonO
                      ? " conquistado por O"
                      : " empatado"
                  : isAllowed
                    ? " disponível"
                    : " indisponível"
              }`}
            >
              <div className="relative">
                <AnimatePresence>
                  {completed ? (
                    <motion.div
                      key={`overlay-${mb}`}
                      className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80 dark:bg-neutral-900/80"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span
                        className={[
                          "text-[9rem] opacity-[0.5] font-extrabold",
                          isWonX ? "text-emerald-600" : "",
                          isWonO ? "text-sky-600" : "",
                          isDraw ? "text-neutral-500" : "",
                        ].join(" ")}
                        initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 0.5 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 22,
                        }}
                      >
                        {isWonX ? "X" : isWonO ? "O" : "–"}
                      </motion.span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="grid grid-cols-3 gap-1">
                  {POSITIONS.map((ci) => {
                    const cell = mini.cells[ci];
                    const disabled =
                      completed ||
                      state.overallStatus !== "IN_PROGRESS" ||
                      !isAllowed ||
                      cell !== null ||
                      role !== state.nextPlayer ||
                      (role !== "X" && role !== "O");
                    const isGhost =
                      !disabled && !cell && hover?.b === mb && hover?.c === ci;
                    const isWinningCell = !!mini.winnerLine?.includes(ci);

                    return (
                      <button
                        key={`cell-${mb}-${ci}`}
                        type="button"
                        aria-label={`Tabuleiro ${mb + 1}, célula ${ci + 1}, ${
                          cell ?? "vazia"
                        }`}
                        disabled={disabled}
                        onClick={() => onCellClick(mb, ci)}
                        onMouseEnter={() => {
                          if (!disabled) setHover({ b: mb, c: ci });
                        }}
                        onMouseLeave={() => {
                          if (hover?.b === mb && hover?.c === ci)
                            setHover(null);
                        }}
                        className={[
                          "select-none flex items-center justify-center",
                          "sm:h-16 sm:w-16 h-8 w-8 rounded-md border",
                          disabled
                            ? "border-neutral-300 dark:border-neutral-800"
                            : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800",
                          "text-3xl font-bold",
                          "bg-white dark:bg-neutral-900",
                          isWinningCell
                            ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                            : "",
                          disabled && cell === null ? "cursor-not-allowed" : "",
                          !disabled && cell === null ? "cursor-pointer" : "",
                        ].join(" ")}
                      >
                        <AnimatePresence initial={false} mode="popLayout">
                          {cell ? (
                            <motion.span
                              key={`perm-${mb}-${ci}-${cell}`}
                              className={[
                                cell === "X" ? "text-emerald-600" : "",
                                cell === "O" ? "text-sky-600" : "",
                                "will-change-transform",
                              ]
                                .join(" ")
                                .trim()}
                              initial={{ scale: 0, rotate: -90, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              exit={{ scale: 0.9, opacity: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 28,
                              }}
                            >
                              {cell}
                            </motion.span>
                          ) : isGhost ? (
                            <motion.span
                              key={`ghost-${mb}-${ci}-${role}`}
                              className={[
                                role === "X"
                                  ? "text-emerald-600"
                                  : "text-sky-600",
                                "opacity-40",
                              ]
                                .join(" ")
                                .trim()}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 0.4, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                            >
                              {role}
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-md px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          disabled={!started}
        >
          Reiniciar
        </button>
      </div>
    </main>
  );
}
