import { STATE } from ".";
import { Player } from "../../shared/src/types/player";
import { Room } from "../../shared/src/types/room";
import { WebSocketMessage } from "../../shared/src/web-socket-message";
import { webSocketMessageHandler } from "./web-socket-message-handler";

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
  STATE.playerIcon = content.player.icon;
  STATE.playerName = content.player.name;
  STATE.room = content.room;

  console.log(content);
  document.querySelector(".start-screen")!.classList.add("hidden");
  const socket = new WebSocket("ws://localhost:3000/join-room");
  socket.addEventListener("message", webSocketMessageHandler);
  window.addEventListener("item-placed", (e) => {
    const message: WebSocketMessage = {
      type: "PLAYER_PLACED_ITEM",
      data: { items: e.detail },
      fromPlayerId: STATE.playerId,
      room: STATE.room!,
    };
    console.log("clientside sending message", message);
    socket.send(JSON.stringify(message));
  });
}
