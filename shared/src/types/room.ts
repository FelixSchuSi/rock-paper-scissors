import { Item } from "./item";

export interface Room {
  roomId: string;
  items: Item[];
  players: { playerId: string; name: string; icon: "🪨" | "✂️" | "📃" }[];
}
