export const ITEM_WIDTH = 32;
export const SIMULATION_WIDTH = 450;
export const SIMULATION_HEIGHT = 800;
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
