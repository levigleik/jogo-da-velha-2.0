import { NextRequest } from "next/server";
import {
  attachSubscriber,
  broadcast,
  getOrCreateRoom,
  joinRoom,
  leaveRoom,
  type ServerEvent,
} from "@/lib/realtime/utttRooms";
import { type UltimateState } from "@/components/ultimate-tic-tac-toe/ultimateTicTacToeLogic";

export const runtime = "edge";

export async function GET(req: NextRequest, ctx: { params: { roomId: string } }) {
  const { roomId } = ctx.params;
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") || crypto.randomUUID();
  const name = searchParams.get("name") || "Convidado";

  const { room, role } = joinRoom(roomId, clientId, name);
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const enqueue = (line: string) => controller.enqueue(encoder.encode(line));
      const close = () => controller.close();

      attachSubscriber(room, clientId, { enqueue, close });

      // send initial snapshot
      const snapshot: ServerEvent = {
        type: "snapshot",
        payload: {
          state: room.state as UltimateState,
          players: room.players,
          role,
          started: room.started,
        },
      };
      enqueue(`data: ${JSON.stringify(snapshot)}\n\n`);

      // keep alive
      const interval = setInterval(() => {
        try {
          enqueue(`: keep-alive\n\n`);
        } catch {
          // ignore
        }
      }, 15000);

      const onAbort = () => {
        clearInterval(interval);
        leaveRoom(roomId, clientId);
        // notify others about players change
        broadcast(room, {
          type: "players",
          payload: { players: room.players, started: room.started },
        });
        try {
          controller.close();
        } catch {
          // ignore
        }
      };

      req.signal.addEventListener("abort", onAbort);
    },
    cancel() {
      // handled by abort
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
