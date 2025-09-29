import { type NextRequest, NextResponse } from "next/server";
import {
  broadcast,
  getOrCreateRoom,
  handleMove,
  joinRoom,
  resetRoom,
  setName as setPlayerName,
} from "@/lib/realtime/utttRooms";

export const runtime = "edge";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const type = body?.type as "join" | "move" | "reset" | "setName";

  const clientId = (body?.clientId as string) || "";
  if (!clientId) {
    return NextResponse.json(
      { ok: false, message: "clientId é obrigatório" },
      { status: 400 },
    );
  }

  const room = getOrCreateRoom(roomId);

  switch (type) {
    case "join": {
      const name = (body?.name as string) || "Convidado";
      const { role } = joinRoom(roomId, clientId, name);
      broadcast(room, {
        type: "players",
        payload: { players: room.players, started: room.started },
      });
      return NextResponse.json({
        ok: true,
        role,
        players: room.players,
        started: room.started,
      });
    }
    case "setName": {
      const name = (body?.name as string) || "Convidado";
      setPlayerName(room, clientId, name);
      broadcast(room, {
        type: "players",
        payload: { players: room.players, started: room.started },
      });
      return NextResponse.json({ ok: true });
    }
    case "move": {
      const { boardIndex, cellIndex } = body as {
        boardIndex: number;
        cellIndex: number;
      };
      const res = handleMove(room, clientId, boardIndex, cellIndex);
      if (!res.ok) {
        return NextResponse.json(
          { ok: false, message: res.message },
          { status: 400 },
        );
      }
      broadcast(room, { type: "state", payload: { state: room.state } });
      return NextResponse.json({ ok: true });
    }
    case "reset": {
      resetRoom(room);
      broadcast(room, { type: "state", payload: { state: room.state } });
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json(
        { ok: false, message: "tipo inválido" },
        { status: 400 },
      );
  }
}
