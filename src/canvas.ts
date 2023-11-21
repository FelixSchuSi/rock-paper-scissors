import { ITEM_WIDTH, SIMULATION_HEIGHT, SIMULATION_WIDTH } from "./constants";
import type { Item } from "./main";

interface Point {
  x: number;
  y: number;
}

class Canvas {
  private readonly canvas = document.querySelector(
    "canvas"
  ) as HTMLCanvasElement;
  private readonly mainContentElement = document.querySelector(
    ".main-content"
  ) as HTMLDivElement;
  private readonly rock = document.querySelector(".rock") as HTMLImageElement;
  private readonly paper = document.querySelector(".paper") as HTMLImageElement;
  private readonly scissors = document.querySelector(
    ".scissors"
  ) as HTMLImageElement;
  private readonly canvasScaleX;
  private readonly canvasScaleY;

  private isMouseDown = false;
  private isInPrepPhase = true;
  private mouseDownPoint: Point = { x: 0, y: 0 };
  private prepItems: Item[] = [];

  constructor() {
    this.fullsize();
    this.clear();
    this.canvasScaleX = this.canvas.width / SIMULATION_WIDTH;
    this.canvasScaleY = this.canvas.height / SIMULATION_HEIGHT;

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isInPrepPhase) return;
      if (this.isMouseDown) return;
      const mousePosition = this.getMousePosition(this.canvas, e);
      this.clear();
      this.context.drawImage(
        this.rock,
        mousePosition.x,
        mousePosition.y,
        ITEM_WIDTH,
        ITEM_WIDTH
      );
      this.drawItems(this.prepItems);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isInPrepPhase) return;
      if (!this.isMouseDown) return;
      const mousePosition = this.getMousePosition(this.canvas, e);

      this.clear();

      const itemRadius = ITEM_WIDTH / 2;

      this.context.beginPath();
      this.context.moveTo(
        this.mouseDownPoint.x + itemRadius,
        this.mouseDownPoint.y + itemRadius
      );
      const tipOfArrow = {
        x: this.mouseDownPoint.x - (mousePosition.x - this.mouseDownPoint.x),
        y: this.mouseDownPoint.y - (mousePosition.y - this.mouseDownPoint.y),
      };
      this.context.lineTo(tipOfArrow.x + itemRadius, tipOfArrow.y + itemRadius);
      this.context.stroke();

      const lastItem = this.prepItems[this.prepItems.length - 1];
      lastItem.dx = (this.mouseDownPoint.x - mousePosition.x) / 10;
      lastItem.dy = (this.mouseDownPoint.y - mousePosition.y) / 10;

      this.drawItems(this.prepItems);
    });

    this.canvas.addEventListener("mousedown", (e) => {
      if (!this.isInPrepPhase) return;

      this.isMouseDown = true;
      this.mouseDownPoint = this.getMousePosition(this.canvas, e);
      this.prepItems.push({
        text: "🪨",
        x: this.mouseDownPoint.x / this.canvasScaleX,
        y: this.mouseDownPoint.y / this.canvasScaleY,
        dx: 0,
        dy: 0,
      });
      this.drawItems(this.prepItems);
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (!this.isInPrepPhase) return;
      this.isMouseDown = false;

      if (this.prepItems.length >= 3) {
        this.clear();
        window.dispatchEvent(
          new CustomEvent("prep-phase-complete", { detail: this.prepItems })
        );
        this.isInPrepPhase = false;
        return;
      }
    });
  }

  private getMousePosition(canvas: HTMLCanvasElement, evt: MouseEvent): Point {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  private get context(): CanvasRenderingContext2D {
    return this.canvas.getContext("2d")!;
  }

  private clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private fullsize(): void {
    this.canvas.width = this.mainContentElement.clientWidth;
    this.canvas.height = this.mainContentElement.clientHeight;
  }

  public drawItems(items: Item[]): void {
    if (this.prepItems !== items) this.clear();

    items.forEach((item) => {
      const x = Math.floor(item.x * this.canvasScaleX);
      const y = Math.floor(item.y * this.canvasScaleY);

      if (item.text === "📃")
        this.context.drawImage(this.paper, x, y, ITEM_WIDTH, ITEM_WIDTH);
      if (item.text === "✂️")
        this.context.drawImage(this.scissors, x, y, ITEM_WIDTH, ITEM_WIDTH);
      if (item.text === "🪨")
        this.context.drawImage(this.rock, x, y, ITEM_WIDTH, ITEM_WIDTH);
    });
  }

  public drawFinalScreen(items: Item[]): void {
    const finalScreenElement = document.querySelector(
      `.${items[0].text}`
    ) as HTMLDivElement;
    canvas.context.filter = "blur(4px)";
    finalScreenElement.classList.remove("hidden");
  }
}

export const canvas = new Canvas();

declare global {
  interface WindowEventMap {
    "prep-phase-complete": CustomEvent<Item[]>;
  }
}
