import { ICanvas } from "../../shared/src/types/canvas";
import {
  ARROW_DRAW_SIZE_FACTOR,
  ITEM_RADIUS,
  ITEM_WIDTH,
  SIMULATION_HEIGHT,
  SIMULATION_WIDTH,
} from "../../shared/src/constants";
import { Item } from "../../shared/src/types/item";
import { Point } from "../../shared/src/types/point";

class Canvas implements ICanvas {
  private readonly canvas = document.querySelector(
    "canvas"
  ) as HTMLCanvasElement;
  private readonly mainContentElement = document.querySelector(
    ".main-content"
  ) as HTMLDivElement;
  private readonly itemImages = new Map<Item["text"], HTMLImageElement>([
    ["📃", document.querySelector(".paper")!],
    ["✂️", document.querySelector(".scissors")!],
    ["🪨", document.querySelector(".rock")!],
  ]);

  private readonly canvasRect;
  private readonly canvasScaleX;
  private readonly canvasScaleY;

  constructor() {
    this.fullsize();
    this.clear();
    this.canvasScaleX = this.canvas.width / SIMULATION_WIDTH;
    this.canvasScaleY = this.canvas.height / SIMULATION_HEIGHT;
    this.canvasRect = this.canvas.getBoundingClientRect();
  }

  private get context(): CanvasRenderingContext2D {
    return this.canvas.getContext("2d")!;
  }

  public clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private fullsize(): void {
    this.canvas.width = this.mainContentElement.clientWidth;
    this.canvas.height = this.mainContentElement.clientHeight;
  }

  public drawItems(items: Item[], drawArrows?: boolean): void {
    items.forEach((item) => this.drawItem(item, drawArrows ?? false));
  }

  public drawItem(item: Item, drawArrow?: boolean): void {
    const x = Math.floor(item.x * this.canvasScaleX);
    const y = Math.floor(item.y * this.canvasScaleY);
    this.context.drawImage(
      this.itemImages.get(item.text)!,
      x,
      y,
      ITEM_WIDTH,
      ITEM_WIDTH
    );

    if (!drawArrow) return;

    this.drawArrow({
      from: { x: x + ITEM_RADIUS, y: y + ITEM_RADIUS },
      to: {
        x: x + item.dx * ARROW_DRAW_SIZE_FACTOR + ITEM_RADIUS,
        y: y + item.dy * ARROW_DRAW_SIZE_FACTOR + ITEM_RADIUS,
      },
    });
  }

  public drawArrow(arrow: { from: Point; to: Point }): void {
    this.context.beginPath();
    this.context.moveTo(arrow.from.x, arrow.from.y);
    this.context.lineTo(arrow.to.x, arrow.to.y);
    this.context.stroke();
  }

  public drawFinalScreen(items: Item[]): void {
    const finalScreenElement = document.querySelector(
      `.${items[0].text}`
    ) as HTMLDivElement;

    this.canvas.classList.add("blurry");
    finalScreenElement.classList.remove("hidden");
  }

  public getMousePosition(e: MouseEvent | TouchEvent): Point {
    let x = 0;
    let y = 0;

    if (e instanceof TouchEvent) {
      if (e.touches.length === 1) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else {
        x =
          Array.from(e.touches).reduce((acc, touch) => acc + touch.clientX, 0) /
          e.touches.length;

        y =
          Array.from(e.touches).reduce((acc, touch) => acc + touch.clientY, 0) /
          e.touches.length;
      }
    }

    if (e instanceof MouseEvent) {
      x = e.clientX;
      y = e.clientY;
    }

    return {
      x: (x - this.canvasRect.left) / this.canvasScaleY - ITEM_RADIUS,
      y: (y - this.canvasRect.top) / this.canvasScaleY - ITEM_RADIUS,
    };
  }
}

export const canvas = new Canvas();
export type { Canvas };
