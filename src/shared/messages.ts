import type { AppState, Failure } from "./types";

/** Requests sent from the popup / content script to the background worker. */
export type Message =
  | { type: "sync" }
  | { type: "state" }
  | { type: "switch"; name: string }
  | { type: "add" }
  | { type: "remove"; name: string };

export type MessageType = Message["type"];

/** A failed switch may still carry the fresh state so the UI can redraw. */
export type SwitchResult = AppState | (AppState & Failure) | Failure;

export interface ReplyMap {
  sync: AppState | Failure;
  state: AppState | Failure;
  switch: SwitchResult;
  add: { ok: true } | Failure;
  remove: AppState | Failure;
}

export function send<T extends MessageType>(
  message: Extract<Message, { type: T }>
): Promise<ReplyMap[T]> {
  return chrome.runtime.sendMessage(message);
}

export const isFailure = (reply: unknown): reply is Failure =>
  typeof reply === "object" && reply !== null && "error" in reply;

export const hasState = (reply: unknown): reply is AppState =>
  typeof reply === "object" && reply !== null && "accounts" in reply;
