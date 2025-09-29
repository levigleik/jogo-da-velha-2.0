import {
  applyMove,
  createInitialUltimateState,
  type Player,
  type UltimateState,
} from "@/components/ultimate-tic-tac-toe/ultimateTicTacToeLogic";

export interface PlayerInfo {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  state: UltimateState;
  players: { X?: PlayerInfo; O?: PlayerInfo };
  // Map of clientId to role: "X" | "O" | "spectator"
  roles: Map<string, "X" | "O" | "spectator">;
  // SSE subscribers
  subs: Map<
    string,
    {
      enqueue: (chunk: string) => void;
      close: () => void;
    }
  >;
  started: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __UTTT_ROOMS__: Map<string, Room> | undefined;
}

const ROOMS: Map<string, Room> = globalThis.__UTTT_ROOMS__ ?? new Map();
globalThis.__UTTT_ROOMS__ = ROOMS;

export function getOrCreateRoom(roomId: string): Room {
  let room = ROOMS.get(roomId);
  if (!room) {
    room = {
      id: roomId,
      state: createInitialUltimateState(),
      players: {},
      roles: new Map(),
      subs: new Map(),
      started: false,
    };
    ROOMS.set(roomId, room);
  }
  return room;
}

function assignRole(room: Room, clientId: string): "X" | "O" | "spectator" {
  const existing = room.roles.get(clientId);
  if (existing) return existing;
  if (!room.players.X) {
    room.roles.set(clientId, "X");
    return "X";
  }
  if (!room.players.O) {
    room.roles.set(clientId, "O");
    return "O";
  }
  room.roles.set(clientId, "spectator");
  return "spectator";
}

export function joinRoom(
  roomId: string,
  clientId: string,
  name: string,
): { room: Room; role: "X" | "O" | "spectator" } {
  const room = getOrCreateRoom(roomId);
  const role = assignRole(room, clientId);

  if (role === "X") {
    room.players.X = { id: clientId, name };
  } else if (role === "O") {
    room.players.O = { id: clientId, name };
  }
  room.started = Boolean(room.players.X && room.players.O);
  return { room, role };
}

export function leaveRoom(roomId: string, clientId: string) {
  const room = getOrCreateRoom(roomId);
  const role = room.roles.get(clientId);
  room.roles.delete(clientId);
  room.subs.delete(clientId);
  if (role === "X" && room.players.X?.id === clientId) {
    delete room.players.X;
  } else if (role === "O" && room.players.O?.id === clientId) {
    delete room.players.O;
  }
  room.started = Boolean(room.players.X && room.players.O);
}

export function setName(room: Room, clientId: string, name: string) {
  const role = room.roles.get(clientId);
  if (role === "X" && room.players.X) room.players.X.name = name;
  if (role === "O" && room.players.O) room.players.O.name = name;
}

export function resetRoom(room: Room) {
  room.state = createInitialUltimateState();
}

export type ServerEvent =
  | {
      type: "snapshot";
      payload: {
        state: UltimateState;
        players: { X?: PlayerInfo; O?: PlayerInfo };
        role: "X" | "O" | "spectator";
        started: boolean;
      };
    }
  | {
      type: "players";
      payload: { players: { X?: PlayerInfo; O?: PlayerInfo }; started: boolean };
    }
  | { type: "state"; payload: { state: UltimateState } }
  | { type: "error"; payload: { message: string } };

export function broadcast(room: Room, ev: ServerEvent) {
  const line = `data: ${JSON.stringify(ev)}\n\n`;
  for (const [, sub] of room.subs) {
    try {
      sub.enqueue(line);
    } catch {
      // ignore broken subscriber
    }
  }
}

export function attachSubscriber(
  room: Room,
  clientId: string,
  sink: { enqueue: (chunk: string) => void; close: () => void },
) {
  room.subs.set(clientId, sink);
}

export function handleMove(
  room: Room,
  clientId: string,
  boardIndex: number,
  cellIndex: number,
): { ok: true } | { ok: false; message: string } {
  const role = room.roles.get(clientId);
  if (role !== "X" && role !== "O") {
    return { ok: false, message: "Somente jogadores podem jogar." };
  }
  const expected: Player = room.state.nextPlayer;
  if (role !== expected) {
    return { ok: false, message: "Não é a sua vez." };
  }
  // applyMove will validate availability and legal move
  const prev = room.state;
  const next = applyMove(prev, boardIndex, cellIndex);
  if (next === prev) {
    return { ok: false, message: "Jogada inválida." };
  }
  room.state = next;
  return { ok: true };
}
