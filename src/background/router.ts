import type { Message, MessageType, ReplyMap } from "../shared/messages";
import { addAccount, currentState, removeAccount, switchTo, sync } from "./actions";

type Handlers = {
  [T in MessageType]: (msg: Extract<Message, { type: T }>) => Promise<ReplyMap[T]>;
};

export const handlers: Handlers = {
  sync: () => sync(),
  state: () => currentState(),
  switch: ({ name }) => switchTo(name),
  add: () => addAccount(),
  remove: ({ name }) => removeAccount(name),
};

export function onMessage(
  msg: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
): boolean {
  const type = (msg as Message | undefined)?.type;
  if (!type || !Object.hasOwn(handlers, type)) return false;
  const handler = handlers[type] as (m: unknown) => Promise<unknown>;
  handler(msg).then(sendResponse, (e) => sendResponse({ error: String(e) }));
  return true; // async response
}
