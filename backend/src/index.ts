import { Server } from "bun";
import { generateRandomItem } from "../../shared/src/generate-random-item";
import { hashItems } from "../../shared/src/hash";
import { getTick } from "../../shared/src/tick";
import { Item } from "../../shared/src/types/item";
import { Room } from "../../shared/src/types/room";
import { getCookies } from "./get-cookies";
import {
  WebSocketMessage,
  WebSocketMessageType,
} from "../../shared/src/web-socket-message";
import { getAllFrontendFiles } from "./get-all-frontend-files";
import { Player } from "../../shared/src/types/player";
import { handlePlayerPlacedItem } from "./handle-player-placed-items.ts";
import { handleRematch } from "./handle-rematch.ts";

export interface PlayerSession extends Player {
  roomId: string;
}

const FRONTEND_FILES = getAllFrontendFiles();
export const rooms = new Map<string, Room>();

const server = Bun.serve<PlayerSession>({
  fetch: async (req, server) => {
    let url = new URL(req.url);
    if (url.pathname === "/") url.pathname = "/index.html";

    if (url.pathname === "/start" && req.method === "POST") {
      return await postHandleStart(req);
    }
    if (url.pathname === "/create-room" && req.method === "POST") {
      return await postCreateRoom(req);
    }
    if (url.pathname === "/join-room" && req.method === "POST") {
      return await postJoinRoom(req);
    }
    if (url.pathname === "/join-room" && req.method === "GET") {
      return await getJoinRoom(req, server);
    }
    if (FRONTEND_FILES.has(url.pathname) && req.method === "GET") {
      return new Response(Bun.file(`frontend/public${url.pathname}`));
    }

    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    message(ws, message) {
      const webSocketMessage = JSON.parse(
        message as string
      ) as WebSocketMessage;
      const playerSession = ws.data;
      const room = rooms.get(playerSession.roomId);

      if (room === undefined) return;

      if (webSocketMessage.type === WebSocketMessageType.PLAYER_PLACED_ITEM) {
        handlePlayerPlacedItem(playerSession, webSocketMessage, room, server);
      }
      if (webSocketMessage.type === WebSocketMessageType.REMATCH_REQUEST) {
        handleRematch(playerSession, webSocketMessage, server, ws);
      }
    },
    open(ws) {
      const { roomId, name, icon, playerId } = ws.data;
      const room = rooms.get(roomId);

      if (!room || !icon || !roomId || !name || !playerId) {
        return;
      }
      if (!room.players.find((player) => player.playerId === playerId)) {
        return;
      }

      const message: WebSocketMessage = {
        type: WebSocketMessageType.PLAYER_JOINED,
        data: {
          message: `player ${ws.data.name} ${ws.data.icon} joined the room`,
          name,
          icon,
          playerId,
        },
        fromPlayerId: playerId,
        room,
      };

      server.publish(roomId, JSON.stringify(message));
      ws.subscribe(roomId);

      if (room.players.length < 3) return;
      const allPlayersJoinedMessage: WebSocketMessage = {
        type: WebSocketMessageType.ALL_PLAYERS_JOINED,
        data: {
          message: `All players joined`,
        },
        fromPlayerId: "",
        room,
      };
      server.publish(roomId, JSON.stringify(allPlayersJoinedMessage));
    },
    // a socket is closed
    // close(ws, code, message) {},
    // the socket is ready to receive more data
    // drain(ws) {},
  },
});

async function postHandleStart(request: Request): Promise<Response> {
  const stones = await request.json();
  const initialItems: Item[] = [
    ...stones,
    generateRandomItem("✂️"),
    generateRandomItem("✂️"),
    generateRandomItem("✂️"),
    generateRandomItem("📃"),
    generateRandomItem("📃"),
    generateRandomItem("📃"),
  ];

  const { tick, items } = getTick(globalThis.structuredClone(initialItems));
  tick();

  const resultHash = await hashItems(items);

  return new Response(JSON.stringify({ items, initialItems, resultHash }));
}

async function postCreateRoom(request: Request): Promise<Response> {
  const { name, playerId } = await request.json();
  const roomId = crypto.randomUUID();
  const player = { name, icon: "🪨", playerId } as Player;
  const room: Room = {
    roomId,
    items: [],
    players: [player],
  };
  rooms.set(roomId, room);

  const headers = new Headers();
  headers.append("Set-Cookie", `roomId=${roomId}`);
  headers.append("Set-Cookie", `name=${name}`);
  headers.append("Set-Cookie", `icon=${encodeURIComponent("🪨")}`);
  headers.append("Set-Cookie", `playerId=${playerId}`);
  return new Response(JSON.stringify({ room, player }), {
    status: 200,
    headers,
  });
}

async function postJoinRoom(request: Request): Promise<Response> {
  const { roomId, name, playerId } = await request.json();

  const room = rooms.get(roomId);
  if (!room) {
    return new Response("Room not found", { status: 404 });
  }
  if (room.players.length >= 3) {
    return new Response("Room is full", { status: 400 });
  }

  const icon = ["🪨", "📃", "✂️"][room.players.length] as "🪨" | "✂️" | "📃";
  const player = { playerId, name, icon } as Player;
  room.players.push(player);

  const headers = new Headers();
  headers.append("Set-Cookie", `roomId=${roomId}`);
  headers.append("Set-Cookie", `name=${name}`);
  headers.append("Set-Cookie", `icon=${encodeURIComponent(icon)}`);
  headers.append("Set-Cookie", `playerId=${playerId}`);
  return new Response(JSON.stringify({ room, player }), {
    status: 200,
    headers,
  });
}

async function getJoinRoom(
  request: Request,
  server: Server
): Promise<Response> {
  const { icon, roomId, name, playerId } = getCookies(request.headers);
  const room = rooms.get(roomId);

  if (!room || !icon || !roomId || !name || !playerId) {
    return new Response("Bad Request", { status: 400 });
  }

  if (!room.players.find((player) => player.playerId === playerId)) {
    return new Response("Forbidden", { status: 403 });
  }

  const upgraded = server.upgrade(request, {
    data: {
      roomId,
      name,
      icon: decodeURIComponent(icon),
      playerId,
    },
  });

  if (upgraded) return new Response("Ok", { status: 200 });
  return new Response("Internal Server Error", { status: 500 });
}

console.log("Server started");
