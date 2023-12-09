import { tick } from "../../shared/src/tick";
import { Item } from "../../shared/src/types/item";

export function initGameLoop(initialItems: Item[]): () => void {
  let items: Item[] = initialItems;

  function gameLoop() {
    tick(items);

    if (items.every((item) => item.text === items[0].text)) {
      return;
    }

    gameLoop();
  }

  return gameLoop;
}
