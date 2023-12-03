import { getTick } from "../../shared/src/tick";
import { Item } from "../../shared/src/types/item";
import {
  WebSocketMessage,
  WebSocketMessageType,
} from "../../shared/src/web-socket-message";
import { canvas } from "./canvas";
import { PreparationPhaseController } from "./preparation-phase-controller";

let preparationPhaseController: PreparationPhaseController | undefined;

export function webSocketMessageHandler(event: MessageEvent<string>) {
  const data = JSON.parse(event.data) as WebSocketMessage;

  console.log("received message", data);
  const type = data.type;
  if (type === WebSocketMessageType.ROOM_CREATED) {
    return;
  }
  if (type === WebSocketMessageType.PLAYER_JOINED) {
    return;
  }
  if (type === WebSocketMessageType.ALL_PLAYERS_JOINED) {
    handleAllPlayersJoined();
  }
  if (type === WebSocketMessageType.PLAYER_PLACED_ITEM) {
    handlePlayerPlacedItems(data);
  }
  if (type === WebSocketMessageType.ALL_ITEMS_PLACED) {
    handleAllItemsPlaced(data);
  }
}

function handleAllPlayersJoined() {
  document.querySelector(".invite-screen")!.classList.add("hidden");
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

  const { tick } = getTick(data.room.items, canvas, window);
  tick();
}
