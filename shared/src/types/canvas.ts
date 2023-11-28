import { Item } from "./item";
import { Point } from "./point";

export interface ICanvas {
  clear(): void;

  drawItems(items: Item[], drawArrows?: boolean): void;

  drawItem(item: Item, drawArrow?: boolean): void;

  drawArrow(arrow: { from: Point; to: Point }): void;

  drawFinalScreen(items: Item[]): void;

  getMousePosition(e: MouseEvent | TouchEvent): Point;
}
