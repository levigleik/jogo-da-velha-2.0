import type { NextRequest } from "next/server";
import type { UltimateState } from "@/components/ultimate-tic-tac-toe/ultimateTicTacToeLogic";
import {
  broadcast,
  joinRoom,
  leaveRoom,
  type ServerEvent,
} from "@/lib/realtime/utttRooms";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") || crypto.randomUUID();
  const name = searchParams.get("name") || "Convidado";

  const { room, role } = joinRoom(roomId, clientId, name);

  const snapshot: ServerEvent = {
    type: "snapshot",
    payload: {
      state: room.state as UltimateState,
      players: room.players,
      role,
      started: room.started,
    },
  };

  return new Response(JSON.stringify(snapshot), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await ctx.params;
  const body = await req.json().catch(() => ({}) as any);
  const clientId = (body && body.clientId) || crypto.randomUUID();
  const name = (body && body.name) || "Convidado";
  const action = (body && body.action) as string | undefined;

  const { room, role } = joinRoom(roomId, clientId, name);

  if (action === "leave") {
    leaveRoom(roomId, clientId);
    // notify others; clients will pick it up on their next poll
    broadcast(room, {
      type: "players",
      payload: { players: room.players, started: room.started },
    });
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const snapshot: ServerEvent = {
    type: "snapshot",
    payload: {
      state: room.state as UltimateState,
      players: room.players,
      role,
      started: room.started,
    },
  };

  return new Response(JSON.stringify(snapshot), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
