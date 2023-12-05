import { STATE } from ".";
import { Player } from "../../shared/src/types/player";
import { Room } from "../../shared/src/types/room";
import { playerJoinedRoomCallback } from "./player-joined-room-callback";

export async function createRoom() {
  const respose = await fetch("/create-room", {
    method: "POST",
    body: JSON.stringify({
      name: (document.querySelector(".create-room-name") as HTMLInputElement)
        .value,
      playerId: STATE.playerId,
    }),
  });
  const content = (await respose.json()) as { room: Room; player: Player };
  playerJoinedRoomCallback(content);
}
