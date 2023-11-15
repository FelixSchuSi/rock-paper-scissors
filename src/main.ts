import "./style.css";

const canvasElement = document.querySelector("canvas") as HTMLCanvasElement;
const context = canvasElement.getContext("2d")!;
const mainContentElement = document.querySelector(
  ".main-content"
) as HTMLDivElement;
clearCanvas();
const measureTextResult = context.measureText("🪨");
const itemWidth = measureTextResult.width;
const itemHeight =
  measureTextResult.actualBoundingBoxAscent +
  measureTextResult.actualBoundingBoxDescent;

let items: Item[] = [
  generateRandomItem("✂️"),
  generateRandomItem("✂️"),
  generateRandomItem("✂️"),
  generateRandomItem("📃"),
  generateRandomItem("📃"),
  generateRandomItem("📃"),
  generateRandomItem("🪨"),
  generateRandomItem("🪨"),
  generateRandomItem("🪨"),
];

function generateRandomItem(text?: Item["text"]): Item {
  const item: Item = {
    text:
      text ??
      (["🪨", "📃", "✂️"][Math.floor(Math.random() * 3)] as Item["text"]),
    x: Math.random() * (mainContentElement.clientWidth - itemWidth),
    y: Math.random() * (mainContentElement.clientHeight - itemHeight),
    dx: Math.random() * 5,
    dy: Math.random() * 5,
  };
  return item;
}
function fullsizeCanvas() {
  canvasElement.width = mainContentElement.clientWidth;
  canvasElement.height = mainContentElement.clientHeight;
}

interface Item {
  text: "🪨" | "📃" | "✂️";
  x: number;
  y: number;
  dx: number;
  dy: number;
}

function drawItems() {
  clearCanvas();

  items.forEach((item) => {
    context.fillText(item.text, item.x, item.y);
    drawPixel(item.x, item.y);
    drawPixel(item.x + itemWidth, item.y);
    drawPixel(item.x + itemWidth, item.y + itemHeight);
    drawPixel(item.x, item.y + itemHeight);
  });
}

function clearCanvas() {
  context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  context.font = "32px Arial";
  context.textAlign = "left";
  context.textBaseline = "top";
}

function drawPixel(x: number, y: number) {
  const id = context.createImageData(1, 1);
  const d = id.data;
  d[0] = 255;
  d[1] = 0;
  d[2] = 0;
  d[3] = 255;
  context.putImageData(id, x, y);

  context.fillStyle = "rgba(255,0,0,1)";
  context.fillRect(x, y, 1, 1);
}

const STATE_CHANGES = new Map([
  ["🪨📃", "📃"],
  ["📃🪨", "📃"],
  ["✂️📃", "✂️"],
  ["📃✂️", "✂️"],
  ["🪨✂️", "🪨"],
  ["✂️🪨", "🪨"],
  ["🪨🪨", "🪨"],
  ["📃📃", "📃"],
  ["✂️✂️", "✂️"],
] as const);

function tick() {
  const newItems: Item[] = items.map((item) => {
    let { x, y, dx, dy } = item;
    if (x + dx < 0) {
      dx = -dx;
    }
    if (y + dy < 0) {
      dy = -dy;
    }
    if (x + dx + itemWidth > canvasElement.width) {
      dx = -dx;
    }
    if (y + dy + itemHeight > canvasElement.height) {
      dy = -dy;
    }

    x = x + dx;
    y = y + dy;
    return { ...item, x, y, dx, dy };
  });

  items = window.structuredClone(newItems);

  for (let i = 0; i < newItems.length; i++) {
    for (let j = 0; j < newItems.length; j++) {
      if (i === j) continue;

      const item1 = newItems[i];
      const item2 = newItems[j];
      const distanceX = item2.x - item1.x;
      const distanceY = item2.y - item1.y;
      const dist = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (dist >= itemWidth) continue;

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

      const halfOverlap = (itemWidth - dist) / 2;

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

  drawItems();
  window.requestAnimationFrame(tick);
}

fullsizeCanvas();
tick();
