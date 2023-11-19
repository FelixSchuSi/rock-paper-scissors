import { Item } from "./main";

class Canvas {
  public readonly canvas: HTMLCanvasElement = document.querySelector("canvas")!;
  private readonly mainContentElement: HTMLDivElement =
    document.querySelector(".main-content")!;
  private readonly rockImage: HTMLImageElement =
    document.querySelector(".rock")!;
  private readonly paperImage: HTMLImageElement =
    document.querySelector(".paper")!;
  private readonly scissorsImage: HTMLImageElement =
    document.querySelector(".scissors")!;
  constructor() {
    this.fullsize();
    this.clear();
  }

  public get context(): CanvasRenderingContext2D {
    return this.canvas.getContext("2d")!;
  }

  public clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.font = "32px Arial";
    this.context.textAlign = "left";
    this.context.textBaseline = "top";
  }

  public fullsize() {
    this.canvas.width = this.mainContentElement.clientWidth;
    this.canvas.height = this.mainContentElement.clientHeight;
  }

  public drawItems(items: Item[]) {
    this.clear();

    items.forEach((item) => {
      const [x, y] = this.translateFromSimulationToCanvasCoordinates([
        item.x,
        item.y,
      ]);

      if (item.text === "📃")
        this.context.drawImage(this.paperImage, x, y, 32, 32);
      if (item.text === "✂️")
        this.context.drawImage(this.scissorsImage, x, y, 32, 32);
      if (item.text === "🪨")
        this.context.drawImage(this.rockImage, x, y, 32, 32);
      // draw dots at all four corners of the item
      // this.drawPixel(x, y);
      // this.drawPixel(x + 32, y);
      // this.drawPixel(x + 32, y + 32);
      // this.drawPixel(x, y + 32);
    });
  }

  private translateFromSimulationToCanvasCoordinates(
    input: [number, number]
  ): [number, number] {
    const [x, y] = input;
    const simulationSizeX = 450;
    const simulationSizeY = 800;
    const canvasSizeX = this.canvas.width;
    const canvasSizeY = this.canvas.height;
    const scaleX = canvasSizeX / simulationSizeX;
    const scaleY = canvasSizeY / simulationSizeY;
    return [Math.floor(x * scaleX), Math.floor(y * scaleY)];
  }

  public drawFinalScreen(items: Item[]) {
    const finalScreenElement = document.querySelector(
      `.${items[0].text}`
    ) as HTMLDivElement;
    finalScreenElement.classList.remove("hidden");
    canvas.context.filter = "blur(4px)";
  }

  // private drawPixel(x: number, y: number) {
  //   const id = this.context.createImageData(1, 1);
  //   const d = id.data;
  //   d[0] = 255;
  //   d[1] = 0;
  //   d[2] = 0;
  //   d[3] = 255;
  //   this.context.putImageData(id, x, y);

  //   this.context.fillStyle = "rgba(255,0,0,1)";
  //   this.context.fillRect(x, y, 1, 1);
  // }
}

export const canvas = new Canvas();
