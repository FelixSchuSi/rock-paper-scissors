import {
  ITEM_WIDTH,
  SIMULATION_WIDTH,
  SIMULATION_HEIGHT,
  STATE_CHANGES,
} from "./constants";
import { Item } from "./types/item";

/**
 * Simulates one tick (= simulation step) of the game.
 * You need to pass the items of the previous tick.
 * The items you passed are modified inplace.
 *
 * @param items Items of previous step.
 */
export function tick(items: Item[]): void {
  items.forEach((item) => {
    if (item.x + item.dx < 0) {
      item.dx = -item.dx;
    }
    if (item.y + item.dy < 0) {
      item.dy = -item.dy;
    }
    if (item.x + item.dx + ITEM_WIDTH > SIMULATION_WIDTH) {
      item.dx = -item.dx;
    }
    if (item.y + item.dy + ITEM_WIDTH > SIMULATION_HEIGHT) {
      item.dy = -item.dy;
    }

    item.x = item.x + item.dx;
    item.y = item.y + item.dy;
  });

  const oldItems = globalThis.structuredClone(items);

  for (let i = 0; i < oldItems.length; i++) {
    for (let j = 0; j < oldItems.length; j++) {
      if (i === j) continue;

      const item1 = oldItems[i];
      const item2 = oldItems[j];
      const distanceX = item2.x - item1.x;
      const distanceY = item2.y - item1.y;
      const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (dist >= ITEM_WIDTH) continue;

      // item1 and item2 collide
      const newText = STATE_CHANGES.get(`${item1.text}${item2.text}` as const);
      const angle = Math.atan2(distanceY, distanceX);
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      // rotate velocity
      const vx1 = item1.dx * cos + item1.dy * sin;
      const vy1 = item1.dy * cos - item1.dx * sin;
      const vx2 = item2.dx * cos + item2.dy * sin;
      const vy2 = item2.dy * cos - item2.dx * sin;

      const halfOverlap = (ITEM_WIDTH - dist) / 2;

      const x1Direction = vx1 > 0 ? 1 : -1;
      const x2Direction = vx2 > 0 ? 1 : -1;
      const newX1 = item1.x + x2Direction * halfOverlap * cos;
      const newX2 = item2.x + x1Direction * halfOverlap * cos;
      const newY1 = item1.y + x2Direction * halfOverlap * sin;
      const newY2 = item2.y + x1Direction * halfOverlap * sin;

      items[i].dx = vx2 * cos - vy1 * sin;
      items[i].dy = vy1 * cos + vx2 * sin;
      items[i].text = newText ?? item1.text;
      items[i].x = newX1;
      items[i].y = newY1;

      items[j].dx = vx1 * cos - vy2 * sin;
      items[j].dy = vy2 * cos + vx1 * sin;
      items[j].text = newText ?? item2.text;
      items[j].x = newX2;
      items[j].y = newY2;
    }
  }
}
