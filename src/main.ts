import { canvas } from "./canvas";
import { tick } from "./tick";

console.log(canvas, tick);

export interface Item {
  text: "🪨" | "📃" | "✂️";
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface Point {
  x: number;
  y: number;
}

// tick();
