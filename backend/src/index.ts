import { Server } from "bun";
import { Room } from "../../shared/src/types/room";
import { getCookies } from "./get-cookies";
import {
  WebSocketMessage,
  WebSocketMessageType,
} from "../../shared/src/web-socket-message";
import { getAllFrontendFiles } from "./get-all-frontend-files";
import { Player } from "../../shared/src/types/player";
import { handlePlayerPlacedItem } from "./handle-player-placed-items.ts";

export interface PlayerSession {
  roomId: string;
  name: string;
  icon: "🪨" | "✂️" | "📃";
  playerId: string;
}

const FRONTEND_FILES = getAllFrontendFiles();
export const rooms = new Map<string, Room>();
const successorGroups = new Map<string, string>();

const server = Bun.serve<PlayerSession>({
  fetch: async (request, server) => {
    let url = new URL(request.url);
    if (url.pathname === "/") url.pathname = "/index.html";

    if (url.pathname === "/create-room" && request.method === "POST") {
      return await postCreateRoom(request);
    }
    if (url.pathname === "/join-room" && request.method === "POST") {
      return await postJoinRoom(request);
    }
    if (url.pathname === "/upgrade" && request.method === "GET") {
      return await getUpgrade(request, server);
    }
    if (url.pathname === "/rematch" && request.method === "POST") {
      return await getRematch(request);
    }
    if (FRONTEND_FILES.has(url.pathname) && request.method === "GET") {
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

      if (webSocketMessage.type === WebSocketMessageType.PLAYER_PLACED_ITEM) {
        handlePlayerPlacedItem(playerSession, webSocketMessage, server);
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
    close(ws) {
      const { roomId, playerId } = ws.data;
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find(
        (player) => player.playerId === playerId
      );
      if (!player) return;
      room.players = room.players.filter(
        (player) => player.playerId !== playerId
      );
      rooms.set(roomId, room);

      const playerLeftMessage: WebSocketMessage = {
        type: WebSocketMessageType.PLAYER_LEFT,
        data: {
          message: `player ${player.name} ${player.icon} left the room`,
          name: player.name,
          icon: player.icon,
          playerId: player.playerId,
        },
        fromPlayerId: player.playerId,
        room,
      };

      server.publish(roomId, JSON.stringify(playerLeftMessage));
    },
  },
});

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

async function getUpgrade(request: Request, server: Server): Promise<Response> {
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

async function getRematch(request: Request) {
  const { roomId, name, playerId } = await request.json();
  if (!roomId || !name || !playerId) {
    return new Response("Bad Request", { status: 400 });
  }

  const room = rooms.get(successorGroups.get(roomId) ?? "") ?? {
    roomId: crypto.randomUUID(),
    items: [],
    players: [],
  };

  if (room.players.find((player) => player.playerId === playerId)) {
    return new Response("Forbidden", { status: 403 });
  }

  if (room.players.length >= 3) {
    return new Response("Room is full", { status: 400 });
  }

  const player = {
    name,
    icon: ["🪨", "📃", "✂️"][room.players.length] as "🪨" | "✂️" | "📃",
    playerId,
  };

  room.players.push(player);
  rooms.set(room.roomId, room);
  successorGroups.set(roomId, room.roomId);

  if (room.players.length >= 3) {
    successorGroups.delete(roomId);
    rooms.delete(roomId);
  }

  const headers = new Headers();
  headers.append("Set-Cookie", `roomId=${room.roomId}`);
  headers.append("Set-Cookie", `name=${name}`);
  headers.append("Set-Cookie", `icon=${encodeURIComponent(player.icon)}`);
  headers.append("Set-Cookie", `playerId=${playerId}`);
  return new Response(JSON.stringify({ room, player }), {
    status: 200,
    headers,
  });
}

console.log("Server started");
