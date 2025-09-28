"use client";

import { useMemo, useState } from "react";
import type { Board, Player } from "./ticTacToeLogic";
import {
  calculateWinner,
  createInitialBoard,
  getNextPlayer,
  isDraw,
} from "./ticTacToeLogic";

/**
 * A simple, accessible Tic-Tac-Toe board for two local players.
 * Uses a div-based grid and separates pure game logic in ticTacToeLogic.ts.
 */
export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const winnerInfo = useMemo(() => calculateWinner(board), [board]);
  const draw = useMemo(() => !winnerInfo && isDraw(board), [board, winnerInfo]);

  function handleCellClick(index: number) {
    if (winnerInfo || board[index]) return;

    setBoard((prev) => {
      if (prev[index]) return prev;
      const next = prev.slice() as Board;
      next[index] = currentPlayer;
      return next;
    });

    setCurrentPlayer((prev) => getNextPlayer(prev));
  }

  function reset() {
    setBoard(createInitialBoard());
    setCurrentPlayer("X");
  }

  const status = winnerInfo ? `Winner: ${winnerInfo.winner}` : "It's a draw!";

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="text-lg font-semibold"
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </div>

      <div className="grid grid-cols-3 gap-2" style={{ width: 312 }}>
        {board.map((cell, idx) => {
          const isWinning = !!winnerInfo?.line.includes(idx);
          const isGhost = !cell && hoveredIndex === idx && !winnerInfo;
          const display = cell ?? (isGhost ? currentPlayer : "");

          return (
            <div
              key={idx}
              role="button"
              tabIndex={0}
              aria-label={`Cell ${idx + 1}, ${cell ?? "empty"}`}
              onClick={() => handleCellClick(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleCellClick(idx);
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => {
                if (hoveredIndex === idx) setHoveredIndex(null);
              }}
              className={[
                "select-none flex items-center justify-center",
                "h-24 w-24 rounded-md border border-neutral-300 dark:border-neutral-700",
                "text-5xl font-bold",
                "bg-white dark:bg-neutral-900",
                "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                isWinning
                  ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                  : "",
                cell ? "cursor-not-allowed" : "cursor-pointer",
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
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-md px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-white"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
