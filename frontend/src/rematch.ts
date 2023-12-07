import { STATE } from ".";
import { Player } from "../../shared/src/types/player";
import { Room } from "../../shared/src/types/room";
import { playerJoinedRoomCallback } from "./player-joined-room-callback";
import { simulationAbortController } from "./web-socket-message-handler";

export async function rematch() {
  const respose = await fetch("/rematch", {
    method: "POST",
    body: JSON.stringify({
      roomId: STATE.room?.roomId,
      name: STATE.playerName,
      playerId: STATE.playerId,
    }),
  });
  const content = (await respose.json()) as { room: Room; player: Player };
  playerJoinedRoomCallback(content);
  simulationAbortController?.abort();
}
