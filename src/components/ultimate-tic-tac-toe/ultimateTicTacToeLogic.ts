export type Player = "X" | "O";
export type Cell = Player | null;

export type MiniBoardStatus = "IN_PROGRESS" | "WON_X" | "WON_O" | "DRAW";
export type OverallStatus = "IN_PROGRESS" | "WON_X" | "WON_O" | "DRAW";

export interface MiniBoardState {
  cells: Cell[]; // length 9
  status: MiniBoardStatus;
  winnerLine?: number[]; // indexes of winning cells when WON_*
}

export interface UltimateState {
  boards: MiniBoardState[]; // length 9
  overallStatus: OverallStatus;
  overallWinnerLine?: number[]; // indexes of winning mini-boards when WON_*
  nextPlayer: Player;
  forcedBoard: number | null; // 0..8 or null (free move)
}

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

export function createEmptyMiniBoard(): Cell[] {
  return Array<Cell>(9).fill(null);
}

export function createInitialUltimateState(): UltimateState {
  const boards: MiniBoardState[] = Array.from({ length: 9 }, () => ({
    cells: createEmptyMiniBoard(),
    status: "IN_PROGRESS",
  }));
  return {
    boards,
    overallStatus: "IN_PROGRESS",
    nextPlayer: "X",
    forcedBoard: null,
  };
}

export function calculateMiniBoardStatus(
  cells: Cell[],
): { status: MiniBoardStatus; winnerLine?: number[] } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v = cells[a];
    if (v && v === cells[b] && v === cells[c]) {
      return { status: v === "X" ? "WON_X" : "WON_O", winnerLine: line };
    }
  }
  const filled = cells.every((c) => c !== null);
  if (filled) return { status: "DRAW" };
  return { status: "IN_PROGRESS" };
}

export function calculateOverallStatus(
  boards: MiniBoardState[],
): { status: OverallStatus; winnerLine?: number[] } {
  // Build a virtual 9-cell board from mini-board winners
  const virtual: Cell[] = boards.map((b) => {
    if (b.status === "WON_X") return "X";
    if (b.status === "WON_O") return "O";
    return null; // DRAW and IN_PROGRESS are neutral/not owned
  });

  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const v = virtual[a];
    if (v && v === virtual[b] && v === virtual[c]) {
      return { status: v === "X" ? "WON_X" : "WON_O", winnerLine: line };
    }
  }

  const allDone = boards.every((b) => b.status !== "IN_PROGRESS");
  if (allDone) return { status: "DRAW" };

  return { status: "IN_PROGRESS" };
}

export function getAllowedBoards(state: UltimateState): number[] {
  if (state.forcedBoard !== null) {
    const fb = state.forcedBoard;
    if (state.boards[fb]?.status === "IN_PROGRESS") return [fb];
  }
  // Free move: any board still in progress
  return state.boards
    .map((b, i) => (b.status === "IN_PROGRESS" ? i : -1))
    .filter((i) => i !== -1);
}

export function canPlayCell(
  state: UltimateState,
  boardIndex: number,
  cellIndex: number,
): boolean {
  if (state.overallStatus !== "IN_PROGRESS") return false;
  const mini = state.boards[boardIndex];
  if (!mini || mini.status !== "IN_PROGRESS") return false;
  const allowed = getAllowedBoards(state);
  if (!allowed.includes(boardIndex)) return false;
  if (mini.cells[cellIndex] !== null) return false;
  return true;
}

export function applyMove(
  state: UltimateState,
  boardIndex: number,
  cellIndex: number,
): UltimateState {
  if (!canPlayCell(state, boardIndex, cellIndex)) return state;

  const nextBoards: MiniBoardState[] = state.boards.map((b) => ({
    cells: b.cells.slice(),
    status: b.status,
    winnerLine: b.winnerLine ? b.winnerLine.slice() : undefined,
  }));

  // Place mark
  const mini = nextBoards[boardIndex];
  mini.cells[cellIndex] = state.nextPlayer;

  // Update mini-board status
  const miniResult = calculateMiniBoardStatus(mini.cells);
  mini.status = miniResult.status;
  mini.winnerLine = miniResult.winnerLine;

  // Determine next forced board
  let nextForced: number | null = cellIndex; // send opponent to the cellIndex board
  if (
    nextForced === null ||
    nextBoards[nextForced]?.status !== "IN_PROGRESS"
  ) {
    nextForced = null; // free move if the target is unavailable
  }

  // Update overall status
  const overall = calculateOverallStatus(nextBoards);

  return {
    boards: nextBoards,
    overallStatus: overall.status,
    overallWinnerLine: overall.winnerLine,
    nextPlayer: state.nextPlayer === "X" ? "O" : "X",
    forcedBoard: nextForced,
  };
}
