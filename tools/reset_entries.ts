// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { kv } from "@/domain/db/kv.ts";
import {
  ENTRY_BY_DATE_KEY,
  ENTRY_BY_USER_ID_KEY,
} from "@/domain/db/db_entry.ts";
import { Entry } from "@/domain/model/entry.ts";

export async function resetEntries() {
  const promises = [];

  const entriesByUserIdIter = kv.list<Entry>({
    prefix: [ENTRY_BY_USER_ID_KEY],
  });
  for await (const res of entriesByUserIdIter) {
    promises.push(kv.delete(res.key));
  }

  const entriesByDateIter = kv.list<Entry>({ prefix: [ENTRY_BY_DATE_KEY] });
  for await (const res of entriesByDateIter) {
    promises.push(kv.delete(res.key));
  }

  await Promise.all(promises);
}

if (import.meta.main) {
  if (
    !confirm(
      "This script deletes all 'Entry' data from the Deno KV database. Are you sure you'd like to continue?",
    )
  ) {
    close();
  }

  await resetEntries();
  await kv.close();
}
