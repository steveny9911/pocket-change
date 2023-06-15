// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { kv } from "@/domain/db/kv.ts";
import { Entry } from "@/domain/model/entry.ts";
import { ENTRY_BY_USER_ID_KEY } from "@/domain/db/db_entry.ts";

export async function getAllEntries() {
  const entries = kv.list<Entry>({ prefix: [ENTRY_BY_USER_ID_KEY] });
  for await (const res of entries) {
    console.log(res.key, res.value);
  }
}

if (import.meta.main) {
  if (
    !confirm(
      "This script gets all 'Entry' data from the Deno KV database. Are you sure you'd like to continue?",
    )
  ) {
    close();
  }

  await getAllEntries();
  await kv.close();
}
