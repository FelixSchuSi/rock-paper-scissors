import { STATE } from ".";
import { Player } from "../../shared/src/types/player";
import { Room } from "../../shared/src/types/room";
import { playerJoinedRoomCallback } from "./player-joined-room-callback";

export async function joinRoom() {
  const respose = await fetch("/join-room", {
    method: "POST",
    body: JSON.stringify({
      roomId: (document.querySelector(".room-id") as HTMLInputElement).value,
      name: (document.querySelector(".join-room-name") as HTMLInputElement)
        .value,
      playerId: STATE.playerId,
    }),
  });
  const content = (await respose.json()) as { room: Room; player: Player };
  playerJoinedRoomCallback(content);
}
