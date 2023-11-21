import { PreparationPhaseController } from "./preparation-phase-controller";
import { start } from "./tick";

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

let preparationPhaseController: PreparationPhaseController | undefined =
  new PreparationPhaseController();

window.addEventListener("prep-phase-complete", (event) => {
  preparationPhaseController = undefined;
  start(event.detail);
});
