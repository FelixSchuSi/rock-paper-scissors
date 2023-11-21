export const ITEM_WIDTH = 32;
export const ITEM_RADIUS = ITEM_WIDTH / 2;
export const SIMULATION_WIDTH = 450;
export const SIMULATION_HEIGHT = 800;
export const ARROW_DRAW_SIZE_FACTOR = 3;
export const MAX_INITIAL_VELOCITY = 15;
export const STATE_CHANGES = new Map([
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
