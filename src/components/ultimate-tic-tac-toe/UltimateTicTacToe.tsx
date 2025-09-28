/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */
"use client";

import { useMemo, useState } from "react";
import type {
  MiniBoardState,
  Player,
  UltimateState,
} from "./ultimateTicTacToeLogic";
import {
  applyMove,
  createInitialUltimateState,
  getAllowedBoards,
} from "./ultimateTicTacToeLogic";

const POSITIONS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function UltimateTicTacToe() {
  const [state, setState] = useState<UltimateState>(() =>
    createInitialUltimateState(),
  );
  const [hover, setHover] = useState<{ b: number; c: number } | null>(null);

  const allowedBoards = useMemo(() => getAllowedBoards(state), [state]);

  const currentPlayer: Player = state.nextPlayer;

  function onCellClick(bi: number, ci: number) {
    setState((prev) => applyMove(prev, bi, ci));
    setHover(null);
  }

  function onReset() {
    setState(createInitialUltimateState());
    setHover(null);
  }

  const statusText =
    state.overallStatus === "WON_X"
      ? "Vitória: X"
      : state.overallStatus === "WON_O"
        ? "Vitória: O"
        : state.overallStatus === "DRAW"
          ? "Empate!"
          : state.forcedBoard !== null &&
              state.boards[state.forcedBoard]?.status === "IN_PROGRESS"
            ? `Vez de ${currentPlayer} — jogue no tabuleiro ${state.forcedBoard + 1}`
            : `Vez de ${currentPlayer} — jogue em qualquer tabuleiro disponível`;

  return (
    <div className="flex flex-col items-center gap-4">
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
                  ? currentPlayer === "X"
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
                {/* overlay de vitória/empate do mini-tabuleiro */}
                {completed ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80 dark:bg-neutral-900/80">
                    <span
                      className={[
                        "text-[9rem] opacity-[0.5] font-extrabold",
                        isWonX ? "text-emerald-600" : "",
                        isWonO ? "text-sky-600" : "",
                        isDraw ? "text-neutral-500" : "",
                      ].join(" ")}
                    >
                      {isWonX ? "X" : isWonO ? "O" : "–"}
                    </span>
                  </div>
                ) : null}

                {/* grid 3x3 do mini-tabuleiro */}
                <div className="grid grid-cols-3 gap-1">
                  {POSITIONS.map((ci) => {
                    const cell = mini.cells[ci];
                    const disabled =
                      completed ||
                      state.overallStatus !== "IN_PROGRESS" ||
                      !isAllowed ||
                      cell !== null;
                    const isGhost =
                      !disabled && !cell && hover?.b === mb && hover?.c === ci;
                    const display = cell ?? (isGhost ? currentPlayer : "");
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
                        <span
                          className={[
                            display === "X" ? "text-emerald-600" : "",
                            display === "O" ? "text-sky-600" : "",
                            isGhost ? "opacity-40" : "",
                          ]
                            .join(" ")
                            .trim()}
                        >
                          {display}
                        </span>
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
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}
