import { SIMULATION_WIDTH, SIMULATION_HEIGHT, ITEM_WIDTH } from "./constants";
import { Item } from "./types/item";

export function generateRandomItem(text?: Item["text"]): Item {
  return {
    text:
      text ??
      (["🪨", "📃", "✂️"][Math.floor(Math.random() * 3)] as Item["text"]),
    x: Math.random() * (SIMULATION_WIDTH - ITEM_WIDTH),
    y: Math.random() * (SIMULATION_HEIGHT - ITEM_WIDTH),
    dx: Math.random() * 5,
    dy: Math.random() * 5,
  };
}
