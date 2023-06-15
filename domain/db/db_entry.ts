import { kv } from "@/domain/db/kv.ts";
import {
  Entry,
  EntryDateSearch,
  InitEntry,
  validEntryDate,
} from "@/domain/model/entry.ts";
import { EntryCategoryLabel } from "@/domain/model/category.ts";
import { getCategoryByUserId } from "@/domain/db/db_category.ts";
import { sortEntries } from "@/utils/helpers.ts";

export const ENTRY_BY_USER_ID_KEY = "entry_by_userId";
export const ENTRY_BY_DATE_KEY = "entry_by_date";
export const ENTRY_BY_CATEGORY_KEY = "entry_by_category";

export async function addEntry(userId: string, initEntry: InitEntry) {
  if (!validEntryDate(initEntry.date)) {
    throw { ok: false, message: "Invalid entry date" };
  }

  // if category is set in the initial entry, then
  // check if that category exists for the user
  //    if exists, ok!
  //    else, that's a bad request!
  //
  // else, it's default to "" (all user should have a default category with label "")
  //
  if (initEntry.categoryLabel !== undefined) {
    const category = await getCategoryByUserId(userId, initEntry.categoryLabel);
    if (category === null) {
      throw `Category does not exist for user: ${userId}, label: ${initEntry.categoryLabel}`;
    }
  }

  // TODO: should have a counter for number of entry
  // TODO: limit the number of entries per user

  const entryId = crypto.randomUUID();
  const entry: Entry = {
    ...initEntry,
    categoryLabel: initEntry.categoryLabel ?? "",
    id: entryId,
    createdAt: Date.now(),
  };

  const entryByUserId = [ENTRY_BY_USER_ID_KEY, userId, entryId];
  const entryByDateKey = [
    ENTRY_BY_DATE_KEY,
    userId,
    initEntry.date.year,
    initEntry.date.month,
    initEntry.date.date,
    entryId,
  ];
  const entryByCategoryKey = [
    ENTRY_BY_CATEGORY_KEY,
    userId,
    entry.categoryLabel,
    entryId,
  ];

  const res = await kv.atomic()
    .check({ key: entryByUserId, versionstamp: null })
    .check({ key: entryByDateKey, versionstamp: null })
    .check({ key: entryByCategoryKey, versionstamp: null })
    .set(entryByUserId, entry)
    .set(entryByDateKey, entry)
    .set(entryByCategoryKey, entry)
    .commit();

  if (!res.ok) throw `Failed to add entry: ${entryId}`;

  return entry;
}

/**
 * @param userId
 * @param entryDate
 * @param cursor
 * @returns
 */
export async function getEntriesByDate(
  userId: string,
  entryDate: EntryDateSearch,
  cursor?: string, // TODO: implement paging
) {
  if (!validEntryDate(entryDate)) {
    throw { ok: false, message: "Invalid entry date" };
  }

  const entryByDateKey = [ENTRY_BY_DATE_KEY, userId, entryDate.year];

  if (entryDate.month !== undefined) {
    entryByDateKey.push(entryDate.month);
  }

  if (entryDate.date !== undefined) {
    entryByDateKey.push(entryDate.date);
  }

  const iter = await kv.list<Entry>({ prefix: entryByDateKey }, {
    limit: 100,
    cursor: cursor,
    reverse: true, // most recent entry first
  });

  const entries: Entry[] = [];
  for await (const res of iter) entries.push(res.value);

  sortEntries(entries);

  return entries;
}

export async function getEntriesByCategory(
  userId: string,
  category: EntryCategoryLabel,
  cursor?: string, // TODO: implement paging
) {
  const entryByCategoryKey = [ENTRY_BY_CATEGORY_KEY, userId, category];

  const iter = await kv.list<Entry>({ prefix: entryByCategoryKey }, {
    limit: 100,
    cursor: cursor,
  });

  const entries: Entry[] = [];
  for await (const res of iter) entries.push(res.value);

  sortEntries(entries);

  return entries;
}

export async function deleteEntry(userId: string, entryId: string) {
  const entryByUserId = [ENTRY_BY_USER_ID_KEY, userId, entryId];

  const entry = (await kv.get<Entry>(entryByUserId)).value;
  if (!entry) {
    return true;
  }

  const entryByDateKey = [
    ENTRY_BY_DATE_KEY,
    userId,
    entry.date.year,
    entry.date.month,
    entry.date.date,
    entryId,
  ];
  const entryByCategoryKey = [
    ENTRY_BY_CATEGORY_KEY,
    userId,
    entry.categoryLabel,
    entryId,
  ];

  const res = await kv.atomic()
    .delete(entryByUserId)
    .delete(entryByDateKey)
    .delete(entryByCategoryKey)
    .commit();

  if (!res.ok) throw `Failed to delete entry: ${entryId}`;

  return true;
}

// TODO: update entry
// TODO: edit entry
