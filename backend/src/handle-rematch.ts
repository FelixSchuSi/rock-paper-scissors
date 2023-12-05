import { PlayerSession, rooms } from ".";
import { Room } from "../../shared/src/types/room";
import {
  WebSocketMessage,
  WebSocketMessageType,
} from "../../shared/src/web-socket-message";
import { Player } from "../../shared/src/types/player";
import { Server, ServerWebSocket } from "bun";

const successorGroups = new Map();

export function handleRematch(
  playerSession: PlayerSession,
  message: WebSocketMessage,
  server: Server,
  ws: ServerWebSocket<PlayerSession>
) {
  // TODO: this should be a rest endpoint so that we can use Playersession data
  let newRoomId: string;
  let icon: "🪨" | "✂️" | "📃";
  if (successorGroups.has(message.room.roomId)) {
    newRoomId = successorGroups.get(message.room.roomId);
    const newRoom = rooms.get(newRoomId);
    if (!newRoom) return;
    icon = ["🪨", "📃", "✂️"][newRoom.players.length] as "🪨" | "✂️" | "📃";
    newRoom.players.push({
      name: playerSession.name,
      icon,
      playerId: playerSession.playerId,
    } as Player);
  } else {
    newRoomId = crypto.randomUUID();
    successorGroups.set(message.room.roomId, newRoomId);
    icon = "🪨";
    const player = {
      name: playerSession.name,
      icon,
      playerId: playerSession.playerId,
    } as Player;
    const room: Room = {
      roomId: newRoomId,
      items: [],
      players: [player],
    };
    rooms.set(newRoomId, room);
  }
  const newRoom = rooms.get(newRoomId);
  if (!newRoom) return;

  const playerJoinedMessage: WebSocketMessage = {
    type: WebSocketMessageType.PLAYER_JOINED,
    data: {
      message: `player ${playerSession.name} ${icon} joined the room`,
      name: playerSession.name,
      icon,
      playerId: playerSession.playerId,
    },
    fromPlayerId: playerSession.playerId,
    room: newRoom,
  };

  server.publish(newRoomId, JSON.stringify(playerJoinedMessage));
  ws.subscribe(newRoomId);

  const rematchResponseMessage: WebSocketMessage = {
    type: WebSocketMessageType.REMATCH_RESPONSE,
    data: {
      message: `player ${playerSession.name} ${icon} joined the room`,
      name: playerSession.name,
      icon,
      playerId: playerSession.playerId,
    },
    fromPlayerId: playerSession.playerId,
    room: newRoom,
  };

  ws.send(JSON.stringify(rematchResponseMessage));

  if (newRoom.players.length < 3) return;
  const allPlayersJoinedMessage: WebSocketMessage = {
    type: WebSocketMessageType.ALL_PLAYERS_JOINED,
    data: {
      message: `All players joined`,
    },
    fromPlayerId: "",
    room: newRoom,
  };
  server.publish(newRoomId, JSON.stringify(allPlayersJoinedMessage));
}
