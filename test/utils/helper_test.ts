import { Entry } from "@/domain/model/entry.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { DEFAULT_CATEGORY } from "@/domain/model/category.ts";
import { sortEntries } from "@/utils/helpers.ts";

// deno-lint-ignore no-explicit-any
function shuffle(array: any[]) {
  let currIdx = array.length, randomIdx;

  // while there remain elements to shuffle
  while (currIdx != 0) {
    // pick a remaining element
    randomIdx = Math.floor(Math.random() * currIdx);
    currIdx--;

    // and swap it with the current element
    [array[currIdx], array[randomIdx]] = [array[randomIdx], array[currIdx]];
  }

  return array;
}

Deno.test("[helper] sort entires", () => {
  const e1: Entry = {
    id: "e1",
    createdAt: new Date("January 3, 2023 00:00:01").getTime(),
    userId: "1234",
    categoryLabel: DEFAULT_CATEGORY.label,
    amount: 1.00,
    date: {
      year: 2023,
      month: 1,
      date: 2,
    },
  };

  const e2: Entry = {
    id: "e2",
    createdAt: new Date("January 3, 2023 00:00:02").getTime(),
    userId: "1234",
    amount: 2.00,
    categoryLabel: DEFAULT_CATEGORY.label,
    date: {
      year: 2023,
      month: 1,
      date: 2,
    },
  };

  const e3: Entry = {
    id: "e3",
    createdAt: new Date("January 3, 2023 00:00:03").getTime(),
    userId: "1234",
    amount: 3.00,
    categoryLabel: DEFAULT_CATEGORY.label,
    date: {
      year: 2023,
      month: 1,
      date: 2,
    },
  };

  const e4: Entry = {
    id: "e4",
    createdAt: new Date("January 1, 2023 00:00:00").getTime(),
    userId: "1234",
    amount: 4.00,
    categoryLabel: DEFAULT_CATEGORY.label,
    date: {
      year: 2023,
      month: 1,
      date: 1,
    },
  };

  const entires = [e1, e2, e3, e4];
  shuffle(entires);

  sortEntries(entires);

  assertEquals(entires, [e3, e2, e1, e4]);
});
