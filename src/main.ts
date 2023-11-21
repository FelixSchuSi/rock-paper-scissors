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

const registry = new FinalizationRegistry((heldValue) => {
  console.log("GCing", heldValue);
});

registry.register(preparationPhaseController, "preparation-phase-controller");

window.addEventListener("prep-phase-complete", (event) => {
  preparationPhaseController = undefined;
  start(event.detail);
});
