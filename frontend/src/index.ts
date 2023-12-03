import { Room } from "../../shared/src/types/room";
import { createRoom } from "./create-room";
import { joinRoom } from "./join-room";

export const STATE = new (class {
  public readonly playerId = crypto.randomUUID();
  public playerIcon: "🪨" | "✂️" | "📃" | undefined;
  public playerName: string | undefined;
  public room: Room | undefined;
})();

document.querySelector(".create-room")?.addEventListener("click", createRoom);
document.querySelector(".join-room")?.addEventListener("click", joinRoom);
