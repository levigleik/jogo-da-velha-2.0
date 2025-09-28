export type Player = "X" | "O";
export type Board = (Player | null)[];

/**
 * Create an empty 3x3 board (9 cells).
 */
export const createInitialBoard = (): Board => Array(9).fill(null);

/**
 * All possible winning combinations.
 */
const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Returns the winner (and winning line) or null if there is no winner yet.
 */
export function calculateWinner(board: Board): { winner: Player; line: number[] } | null {
  for (const [a, b, c] of WIN_LINES) {
    const v = board[a];
    if (v && v === board[b] && v === board[c]) {
      return { winner: v, line: [a, b, c] };
    }
  }
  return null;
}

/**
 * Returns true if all cells are filled and there is no winner.
 */
export function isDraw(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Toggle between players.
 */
export function getNextPlayer(current: Player): Player {
  return current === "X" ? "O" : "X";
}
