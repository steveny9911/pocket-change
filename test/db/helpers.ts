import { kv } from "@/domain/db/kv.ts";
import { assertEquals, assertExists } from "std/testing/asserts.ts";
import { Category } from "@/domain/model/category.ts";
import { User } from "@/domain/model/user.ts";
import { Entry, InitEntry } from "@/domain/model/entry.ts";

export async function resetKv() {
  const iter = kv.list({ prefix: [] });
  const promises = [];
  for await (const res of iter) promises.push(kv.delete(res.key));
  await Promise.all(promises);
}

export function assertCategories(c1: Category, c2: Category) {
  assertEquals(c1.label, c2.label);
  assertEquals(c1.icon, c2.icon);
}

export function assertUsers(u1: User, u2: User) {
  assertEquals(u1.id, u2.id);
  assertEquals(u1.sessionId, u2.sessionId);
  assertEquals(u1.subscriptionLevel, u2.subscriptionLevel);
  assertEquals(u1.stripeCustomerId, u2.stripeCustomerId);
  assertEquals(u1.oauthAccounts.github?.id, u2.oauthAccounts.github?.id);
  assertEquals(
    u1.oauthAccounts.github?.username,
    u2.oauthAccounts.github?.username,
  );
  assertEquals(u1.createdAt, u2.createdAt);
}

export function assertEntryAndInitEntry(initEntry: InitEntry, entry: Entry) {
  assertEquals(entry.userId, initEntry.userId);
  assertEquals(entry.amount, initEntry.amount);
  assertEquals(entry.date, initEntry.date);
  assertEquals(entry.accountId, initEntry.accountId);
  assertEquals(entry.payee, initEntry.payee);
  assertEquals(entry.note, initEntry.note);

  assertExists(entry.id);
  assertExists(entry.createdAt);
  assertExists(entry.categoryLabel);
}

export function assertEntries(e1: Entry, e2: Entry) {
  assertEquals(e1.userId, e2.userId);
  assertEquals(e1.amount, e2.amount);
  assertEquals(e1.date, e2.date);
  assertEquals(e1.accountId, e2.accountId);
  assertEquals(e1.payee, e2.payee);
  assertEquals(e1.categoryLabel, e2.categoryLabel);
  assertEquals(e1.note, e2.note);
  assertEquals(e1.id, e2.id);
  assertEquals(e1.createdAt, e2.createdAt);
}
