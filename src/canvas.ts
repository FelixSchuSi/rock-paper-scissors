import { ITEM_WIDTH, SIMULATION_HEIGHT, SIMULATION_WIDTH } from "./constants";
import type { Item } from "./main";

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

  constructor() {
    this.fullsize();
    this.clear();
    this.canvasScaleX = this.canvas.width / SIMULATION_WIDTH;
    this.canvasScaleY = this.canvas.height / SIMULATION_HEIGHT;
  }

  private get context(): CanvasRenderingContext2D {
    return this.canvas.getContext("2d")!;
  }

  private clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private fullsize() {
    this.canvas.width = this.mainContentElement.clientWidth;
    this.canvas.height = this.mainContentElement.clientHeight;
  }

  public drawItems(items: Item[]) {
    this.clear();

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

  public drawFinalScreen(items: Item[]) {
    const finalScreenElement = document.querySelector(
      `.${items[0].text}`
    ) as HTMLDivElement;
    canvas.context.filter = "blur(4px)";
    finalScreenElement.classList.remove("hidden");
  }
}

export const canvas = new Canvas();
