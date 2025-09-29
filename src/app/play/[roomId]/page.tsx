"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export default function OnlineUTTTPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const search = useSearchParams();

  const [clientId] = useState<string>(() => getOrCreateClientId());
  const [name, setName] = useState<string>("");
  const [inputName, setInputName] = useState<string>("");
  const [connected, setConnected] = useState(false);

  const [role, setRole] = useState<"X" | "O" | "spectator">("spectator");
  const [state, setState] = useState<UltimateState | null>(null);
  const [players, setPlayers] = useState<{
    X?: { id: string; name: string };
    O?: { id: string; name: string };
  }>({});
  const [started, setStarted] = useState(false);
  const [hover, setHover] = useState<{ b: number; c: number } | null>(null);
  const esRef = useRef<EventSource | null>(null);

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

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.origin + `/play/${roomId}`
      : "";

  const currentPlayer: Player | null = state ? state.nextPlayer : null;
  const allowedBoards = useMemo(
    () => (state ? getAllowedBoards(state) : []),
    [state],
  );

  const connect = useCallback(
    (myName: string) => {
      if (!roomId || !clientId) return;
      // Close previous
      esRef.current?.close();

      // Open SSE with auto-join
      const url = new URL(
        `/api/uttt/rooms/${roomId}/events`,
        window.location.origin,
      );
      url.searchParams.set("clientId", clientId);
      url.searchParams.set("name", myName || "Convidado");
      const es = new EventSource(url.toString());
      esRef.current = es;

      es.onopen = () => setConnected(true);
      es.onerror = () => setConnected(false);
      es.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as ServerEvent;
          if (msg.type === "snapshot") {
            setRole(msg.payload.role);
            setPlayers(msg.payload.players);
            setStarted(msg.payload.started);
            setState(msg.payload.state);
          } else if (msg.type === "players") {
            setPlayers(msg.payload.players);
            setStarted(msg.payload.started);
          } else if (msg.type === "state") {
            setState(msg.payload.state);
          }
        } catch {
          // ignore bad message
        }
      };
    },
    [clientId, roomId],
  );

  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  async function postAction(action: any) {
    await fetch(`/api/uttt/rooms/${roomId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, ...action }),
    });
  }

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalName = inputName.trim() || "Convidado";
    setName(finalName);
    window.sessionStorage.setItem("uttt-name", finalName);
    connect(finalName);
    // also POST join to hurry players update
    postAction({ type: "join", name: finalName });
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
    window.sessionStorage.setItem("uttt-name", newName);
    await postAction({ type: "setName", name: newName });
  }

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

      <div className="flex items-center gap-4">
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
          <button
            type="button"
            onClick={onSaveName}
            className="rounded-md px-3 py-1 text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Salvar nome
          </button>
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
                    const display = cell ?? (isGhost ? role : "");
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
                          "h-16 w-16 rounded-md border",
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
        <span className="text-sm text-neutral-500">
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </div>
    </main>
  );
}
