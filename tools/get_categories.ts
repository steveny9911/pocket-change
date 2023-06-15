// Copyright 2023 the Deno authors. All rights reserved. MIT license.

import { kv } from "@/domain/db/kv.ts";
import { CATEGORY_BY_USERID_KEY } from "@/domain/db/db_category.ts";
import { Category } from "@/domain/model/category.ts";

export async function getAllCategories() {
  const iter = kv.list<Category>({ prefix: [CATEGORY_BY_USERID_KEY] });
  for await (const res of iter) {
    console.log(res.key, res.value);
  }
}

if (import.meta.main) {
  if (
    !confirm(
      "This script gets all 'Category' data from the Deno KV database. Are you sure you'd like to continue?",
    )
  ) {
    close();
  }

  await getAllCategories();
  await kv.close();
}
