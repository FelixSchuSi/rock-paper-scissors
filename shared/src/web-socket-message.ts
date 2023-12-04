import { Room } from "./types/room";

export const WebSocketMessageType = Object.freeze({
  ROOM_CREATED: "ROOM_CREATED",
  PLAYER_JOINED: "PLAYER_JOINED",
  ALL_PLAYERS_JOINED: "ALL_PLAYERS_JOINED",
  PLAYER_PLACED_ITEM: "PLAYER_PLACED_ITEM",
  ALL_ITEMS_PLACED: "ALL_ITEMS_PLACED",
  REMATCH_REQUEST: "REMATCH_REQUEST",
  REMATCH_RESPONSE: "REMATCH_RESPONSE",
});

export type WebSocketMessageType =
  (typeof WebSocketMessageType)[keyof typeof WebSocketMessageType];

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: Record<string, unknown>;
  fromPlayerId: string;
  room: Room;
}
