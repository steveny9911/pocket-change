import { assert } from "std/_util/asserts.ts";
import { validEntryDate } from "@/domain/model/entry.ts";
import { assertFalse } from "std/testing/asserts.ts";

Deno.test("[model] EntryDate validEntryDate", () => {
  assert(validEntryDate({
    year: 2023,
  }));
  assert(validEntryDate({
    year: 2023,
    month: 1,
  }));
  assert(validEntryDate({
    year: 2023,
    month: 1,
    date: 1,
  }));
  assertFalse(validEntryDate({
    year: -1,
  }));
  assertFalse(validEntryDate({
    year: 2023,
    date: 1,
  }));
});
