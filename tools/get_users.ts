// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { kv } from "@/domain/db/kv.ts";
import { User } from "@/domain/model/user.ts";
import { USER_KEY } from "@/domain/db/db_user.ts";

export async function getAllUsers() {
  const iter = kv.list<User>({ prefix: [USER_KEY] });
  for await (const res of iter) {
    console.log(res.key, res.value);
  }
}

if (import.meta.main) {
  if (
    !confirm(
      "This script gets all 'User' data from the Deno KV database. Are you sure you'd like to continue?",
    )
  ) {
    close();
  }

  await getAllUsers();
  await kv.close();
}
