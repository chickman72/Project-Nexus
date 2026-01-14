import { randomUUID } from "crypto";

const MAX_MESSAGES = 20;
const SESSION_TTL_MS = 30 * 60 * 1000;

const store = globalThis.__nexusChatSessions || new Map();
globalThis.__nexusChatSessions = store;

function generateId() {
  try {
    return randomUUID();
  } catch {
    return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function getOrCreateSession(id) {
  const now = Date.now();
  if (id && store.has(id)) {
    const session = store.get(id);
    if (now - session.updatedAt <= SESSION_TTL_MS) {
      session.updatedAt = now;
      return { id, session };
    }
    store.delete(id);
  }

  const newId = id || generateId();
  const session = { messages: [], updatedAt: now };
  store.set(newId, session);
  return { id: newId, session };
}

export function appendMessage(session, message) {
  session.messages.push(message);
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES);
  }
  session.updatedAt = Date.now();
}
