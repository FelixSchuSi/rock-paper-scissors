import { ICanvas } from "../../shared/src/types/canvas";
import { Item } from "../../shared/src/types/item";
import { Point } from "../../shared/src/types/point";

export class Canvas implements ICanvas {
  clear(): void {}
  drawItems(items: Item[], drawArrows?: boolean | undefined): void {}
  drawItem(item: Item, drawArrow?: boolean | undefined): void {}
  drawArrow(arrow: { from: Point; to: Point }): void {}
  drawFinalScreen(items: Item[]): void {}
  getMousePosition(e: any): Point {
    return { x: 0, y: 0 };
  }
}

export const canvas = new Canvas();
