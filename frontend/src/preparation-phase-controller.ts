import { canvas } from "./canvas";
import { MAX_INITIAL_VELOCITY } from "../../shared/src/constants";
import { Point } from "../../shared/src/types/point";
import { Item } from "../../shared/src/types/item";
import { STATE } from ".";

export class PreparationPhaseController {
  private isMouseDown = false;
  private isInPrepPhase = true;
  private mouseDownPoint: Point = { x: 0, y: 0 };
  private prepItems: Item[] = [];
  private _activePlayerItem: Item["text"] = "🪨";
  private readonly abortController = new AbortController();
  private readonly mainContentElement = document.querySelector(
    ".main-content"
  ) as HTMLDivElement;

  private isItPlayersTurn: boolean = false;

  public set activePlayerItem(value: "🪨" | "📃" | "✂️") {
    this._activePlayerItem = value;
    this.isItPlayersTurn = value === STATE.playerIcon;
    console.log(this._activePlayerItem, this.isItPlayersTurn, STATE.playerIcon);

    if (this.isItPlayersTurn) {
      this.mainContentElement.classList.add("is-players-turn");
    } else {
      this.mainContentElement.classList.remove("is-players-turn");
    }
  }

  public anotherPlayerPlacedItem(items: Item[]): void {
    this.prepItems = items;
    canvas.drawItems(this.prepItems, true);
  }

  constructor() {
    this.mainContentElement.classList.add("prep-phase-active");
    const abortSignal = { signal: this.abortController.signal };
    window.addEventListener(
      "mousemove",
      (e) => {
        this.onMouseMove1(e);
        this.onMouseMove2(e);
      },
      abortSignal
    );
    window.addEventListener(
      "mousedown",
      (e) => this.onMouseDown(e),
      abortSignal
    );
    window.addEventListener("mouseup", (e) => this.onMouseUp(e), abortSignal);
    window.addEventListener(
      "touchstart",
      (e) => this.onMouseDown(e),
      abortSignal
    );
    window.addEventListener("touchend", (e) => this.onMouseUp(e), abortSignal);
    window.addEventListener(
      "touchmove",
      (e) => {
        this.onMouseMove1(e);
        this.onMouseMove2(e);
      },
      abortSignal
    );
  }

  private onMouseMove1(e: MouseEvent | TouchEvent): void {
    if (!this.isItPlayersTurn) return;
    if (!this.isInPrepPhase) return;
    if (this.isMouseDown) return;
    if (this.prepItems.at(-1)?.text == this._activePlayerItem) return;

    const mousePosition = canvas.getMousePosition(e);
    canvas.clear();
    canvas.drawItem({
      text: this._activePlayerItem,
      x: mousePosition.x,
      y: mousePosition.y,
      dx: 0,
      dy: 0,
    });
    canvas.drawItems(this.prepItems, true);
  }

  private onMouseMove2(e: MouseEvent | TouchEvent): void {
    if (!this.isItPlayersTurn) return;
    if (!this.isInPrepPhase) return;
    if (!this.isMouseDown) return;
    const mousePosition = canvas.getMousePosition(e);

    const lastItem = this.prepItems[this.prepItems.length - 1];

    lastItem.dx = (this.mouseDownPoint.x - mousePosition.x) / 5;
    lastItem.dy = (this.mouseDownPoint.y - mousePosition.y) / 5;
    const dist = Math.sqrt(lastItem.dx ** 2 + lastItem.dy ** 2);

    if (dist > MAX_INITIAL_VELOCITY) {
      const factor = MAX_INITIAL_VELOCITY / dist;
      lastItem.dx *= factor;
      lastItem.dy *= factor;
    }

    canvas.clear();
    canvas.drawItems(this.prepItems, true);
  }

  private onMouseDown(e: MouseEvent | TouchEvent): void {
    if (!this.isItPlayersTurn) return;
    if (!this.isInPrepPhase) return;

    // A mobile user is using two fingers
    // In that case we place the item between the two fingers
    // We also need to remove the item that was placed by the first finger
    if (this.isMouseDown) {
      this.prepItems.pop();
      canvas.clear();
    }

    this.isMouseDown = true;
    this.mouseDownPoint = canvas.getMousePosition(e);
    this.prepItems.push({
      text: this._activePlayerItem,
      x: this.mouseDownPoint.x,
      y: this.mouseDownPoint.y,
      dx: 0,
      dy: 0,
    });
    canvas.drawItems(this.prepItems, true);
  }

  private onMouseUp(e: MouseEvent | TouchEvent): void {
    if (!this.isItPlayersTurn) return;
    if (!this.isInPrepPhase) return;
    if (!this.isMouseDown) return;
    if (e instanceof TouchEvent && e.touches.length > 0) return;
    this.isMouseDown = false;
    window.dispatchEvent(
      new CustomEvent("item-placed", { detail: this.prepItems })
    );
  }

  public completePrepPhase(): void {
    this.isInPrepPhase = false;
    this.mainContentElement.classList.remove("prep-phase-active");
    this.mainContentElement.classList.remove("is-players-turn");
    this.abortController.abort();

    window.dispatchEvent(
      new CustomEvent("prep-phase-complete", { detail: this.prepItems })
    );
  }
}

declare global {
  interface WindowEventMap {
    "item-placed": CustomEvent<Item[]>;
    "prep-phase-complete": CustomEvent<Item[]>;
  }
}
