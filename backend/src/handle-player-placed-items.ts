import { Server } from "bun";
import { PlayerSession, rooms } from ".";
import { Item } from "../../shared/src/types/item";
import {
  WebSocketMessage,
  WebSocketMessageType,
} from "../../shared/src/web-socket-message";

export function handlePlayerPlacedItem(
  playerSession: PlayerSession,
  message: WebSocketMessage,
  server: Server
) {
  const items = message.data.items as Item[];
  const lastItem = items.at(-1);
  const room = rooms.get(message.room.roomId);
  if (room === undefined) return;
  const playerIndex = room.players.find(
    (player) => player.playerId === message.fromPlayerId
  );
  if (playerIndex === undefined) return;
  if (playerSession.playerId != message.fromPlayerId) return;
  if (message.type !== WebSocketMessageType.PLAYER_PLACED_ITEM) return;
  if (items.length !== room.items.length + 1) return;
  if (lastItem?.text !== playerIndex.icon) return;

  room.items.push(lastItem);

  let nextItem: "🪨" | "📃" | "✂️" = "🪨";

  if (lastItem.text === "🪨") {
    nextItem = "📃";
  } else if (lastItem.text === "📃") {
    nextItem = "✂️";
  } else if (lastItem.text === "✂️") {
    nextItem = "🪨";
  }
  const newMessage: WebSocketMessage = {
    type: WebSocketMessageType.PLAYER_PLACED_ITEM,
    data: { items: room.items, nextItem },
    fromPlayerId: playerSession.playerId,
    room: room,
  };

  server.publish(room.roomId, JSON.stringify(newMessage));

  if (areAllItemsPlaced(room.items)) {
    const newMessage: WebSocketMessage = {
      type: WebSocketMessageType.ALL_ITEMS_PLACED,
      data: { items: room.items },
      fromPlayerId: playerSession.playerId,
      room: room,
    };
    server.publish(room.roomId, JSON.stringify(newMessage));
  }
}

function areAllItemsPlaced(items: Item[]): boolean {
  if (items.length !== 9) return false;

  const areThreeRocksPresent =
    items.filter((item) => item.text === "🪨").length === 3;
  const areThreePapersPresent =
    items.filter((item) => item.text === "📃").length === 3;
  const areThreeScissorsPresent =
    items.filter((item) => item.text === "✂️").length === 3;

  return (
    areThreeRocksPresent && areThreePapersPresent && areThreeScissorsPresent
  );
}
