import { tick } from "../../shared/src/tick";
import { Item } from "../../shared/src/types/item";
import { canvas } from "./canvas";
import { simulationAbortController } from "./web-socket-message-handler";

export function initGameLoop(initialItems: Item[]): () => void {
  let items: Item[] = initialItems;
  let gameFinished = false;

  function gameLoop() {
    tick(items);

    canvas.clear();
    canvas.drawItems(items);

    if (simulationAbortController?.signal.aborted === true) {
      canvas.clear();
      return;
    }

    if (!gameFinished && items.every((item) => item.text === items[0].text)) {
      gameFinished = true;
      canvas.drawFinalScreen(items);
    }

    window.requestAnimationFrame(gameLoop);
  }

  return gameLoop;
}
