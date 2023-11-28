import { Room } from "./types/room";

export const WebSocketMessageType = Object.freeze({
  PLAYER_PLACED_ITEM: "PLAYER_PLACED_ITEM",
  PLAYER_JOINED: "PLAYER_JOINED",
});

export type WebSocketMessageType =
  (typeof WebSocketMessageType)[keyof typeof WebSocketMessageType];

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: Record<string, unknown>;
  fromPlayerId: string;
  room: Room;
}
