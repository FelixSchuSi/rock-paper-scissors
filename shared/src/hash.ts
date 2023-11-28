import { Item } from "./types/item";

export async function hashItems(content: Item[]): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(JSON.stringify(content))
  );

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
