import { getTick } from "../../shared/src/tick";
import { canvas } from "./canvas";
import { PreparationPhaseController } from "./preparation-phase-controller";

const userId = crypto.randomUUID();
// let preparationPhaseController: PreparationPhaseController | undefined =
//   new PreparationPhaseController();

// const registry = new FinalizationRegistry((heldValue) => {
//   console.log("GCing", heldValue);
// });

// registry.register(preparationPhaseController, "preparation-phase-controller");

// window.addEventListener("prep-phase-complete", async (event) => {
//   preparationPhaseController = undefined;

//   const respose = await fetch("/start", {
//     method: "POST",
//     body: JSON.stringify(event.detail),
//   });
//   const { initialItems } = await respose.json();
//   const { tick } = getTick(initialItems, canvas, window);

//   tick();
// });

async function createRoom() {
  const respose = await fetch("/create-room", {
    method: "POST",
    body: JSON.stringify({
      name: userId,
      icon: "🪨",
      playerId: userId,
    }),
  });
  const content = await respose.json();
  console.log(content);

  const socket = new WebSocket("ws://localhost:3000/join-room");
  socket.addEventListener("message", (event) => {
    console.log(event.data);
  });
}

async function joinRoom() {
  const respose = await fetch("/join-room", {
    method: "POST",
    body: JSON.stringify({
      roomId: (document.querySelector(".room-id") as HTMLInputElement).value,
      name: userId,
      icon: "✂️",
      playerId: userId,
    }),
  });
  const content = await respose.json();
  console.log(content);

  const socket = new WebSocket("ws://localhost:3000/join-room");
  socket.addEventListener("message", (event) => {
    console.log(event.data);
  });
  socket.addEventListener("open", () => {
    socket.send("hello");
  });
}

document.querySelector(".create-room")?.addEventListener("click", createRoom);
document.querySelector(".join-room")?.addEventListener("click", joinRoom);
