import { tick } from "./tick";

export interface Item {
  text: "🪨" | "📃" | "✂️";
  x: number;
  y: number;
  dx: number;
  dy: number;
}

tick();
