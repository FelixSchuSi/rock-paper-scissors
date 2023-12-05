import { STATE } from ".";
import { Player } from "../../shared/src/types/player";
import { Room } from "../../shared/src/types/room";
import {
  WebSocketMessage,
  WebSocketMessageType,
} from "../../shared/src/web-socket-message";
import { webSocketMessageHandler } from "./web-socket-message-handler";

export function playerJoinedRoomCallback(apiResponse: {
  room: Room;
  player: Player;
}) {
  STATE.playerIcon = apiResponse.player.icon;
  STATE.playerName = apiResponse.player.name;
  STATE.room = apiResponse.room;

  document.querySelector(".invite-code")!.textContent = apiResponse.room.roomId;
  document.querySelector(".invite-screen")!.classList.remove("hidden");

  document.querySelector(".start-screen")!.classList.add("hidden");
  const socket = new WebSocket(
    `${location.protocol === "https:" ? "wss://" : "ws://"}${
      location.hostname
    }${location.port !== "" ? `:${location.port}` : ""}/join-room`
  );
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
  document.querySelectorAll(".restart-btn")!.forEach((btn) => {
    btn.addEventListener("click", () => {
      const message: WebSocketMessage = {
        type: WebSocketMessageType.REMATCH_REQUEST,
        data: {},
        fromPlayerId: STATE.playerId,
        room: STATE.room!,
      };
      socket.send(JSON.stringify(message));

      document.querySelector(".invite-screen")!.classList.remove("hidden");
      document
        .querySelectorAll(".final-screen")
        .forEach((e) => e.classList.add("hidden"));
      document.querySelector("canvas")!.classList.remove("blurry");
    });
  });
}
