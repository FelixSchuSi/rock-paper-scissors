import { STATE } from ".";
import { getTick } from "../../shared/src/tick";
import { Item } from "../../shared/src/types/item";
import {
  WebSocketMessage,
  WebSocketMessageType,
} from "../../shared/src/web-socket-message";
import { canvas } from "./canvas";
import { PreparationPhaseController } from "./preparation-phase-controller";

let preparationPhaseController: PreparationPhaseController | undefined;
let simulationAbortController: AbortController | undefined;

export function webSocketMessageHandler(event: MessageEvent<string>) {
  const data = JSON.parse(event.data) as WebSocketMessage;

  console.log("received message", data);
  const type = data.type;
  if (type === WebSocketMessageType.ROOM_CREATED) {
    return;
  }
  if (type === WebSocketMessageType.PLAYER_JOINED) {
    handlePlayerJoined(data);
  }
  if (type === WebSocketMessageType.ALL_PLAYERS_JOINED) {
    handleAllPlayersJoined(data);
  }
  if (type === WebSocketMessageType.PLAYER_PLACED_ITEM) {
    handlePlayerPlacedItems(data);
  }
  if (type === WebSocketMessageType.ALL_ITEMS_PLACED) {
    handleAllItemsPlaced(data);
  }
  if (type === WebSocketMessageType.REMATCH_RESPONSE) {
    handleRematchResponse(data);
  }
}

function handleAllPlayersJoined(data: WebSocketMessage) {
  document.querySelector(".invite-screen")!.classList.add("hidden");
  STATE.room = data.room;
  preparationPhaseController = new PreparationPhaseController();
  preparationPhaseController.activePlayerItem = "🪨";
}

function handlePlayerPlacedItems(data: WebSocketMessage) {
  const nextItem = data.data.nextItem as "🪨" | "📃" | "✂️";
  console.log("received", WebSocketMessageType.PLAYER_PLACED_ITEM, data);
  if (preparationPhaseController === undefined) return;
  preparationPhaseController.activePlayerItem = nextItem;
  preparationPhaseController.anotherPlayerPlacedItem(data.data.items as Item[]);
}

function handleAllItemsPlaced(data: WebSocketMessage) {
  if (preparationPhaseController === undefined) return;
  preparationPhaseController.completePrepPhase();
  preparationPhaseController = undefined;

  simulationAbortController = new AbortController();
  const { tick } = getTick(
    data.room.items,
    canvas,
    window,
    simulationAbortController
  );
  tick();
}

function handlePlayerJoined(data: WebSocketMessage) {
  STATE.room = data.room;
  STATE.playerIcon = data.room.players.find(
    (player) => player.playerId === STATE.playerId
  )?.icon;
  document.querySelector(".invite-code")!.textContent = STATE.room.roomId;
}

function handleRematchResponse(data: WebSocketMessage) {
  simulationAbortController?.abort();
  STATE.room = data.room;
  STATE.playerIcon = data.room.players.find(
    (player) => player.playerId === STATE.playerId
  )?.icon;
  document.querySelector(".invite-code")!.textContent = STATE.room.roomId;
}
