import assert from "node:assert/strict";
import test from "node:test";

import { VISITOR_STORAGE_KEY, getNiaVisitorId, resolveNiaUserId } from "./visitorId";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
  key() {
    return null;
  }
  get length() {
    return this.data.size;
  }
}

test("reusa el visitor id del navegador", () => {
  const storage = new MemoryStorage() as unknown as Storage;
  const first = getNiaVisitorId(storage);
  const second = getNiaVisitorId(storage);
  assert.equal(first, second);
  assert.equal(storage.getItem(VISITOR_STORAGE_KEY), first);
  assert.ok(first.length > 8);
});

test("si hay login, el user_id es el uid de Firebase", () => {
  const storage = new MemoryStorage() as unknown as Storage;
  getNiaVisitorId(storage);
  assert.equal(resolveNiaUserId("firebase-uid-1", storage), "firebase-uid-1");
  assert.equal(resolveNiaUserId("  ", storage), storage.getItem(VISITOR_STORAGE_KEY));
});
