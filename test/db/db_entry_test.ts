import { addEntry, getEntriesByDate } from "@/domain/db/db_entry.ts";
import { Entry, EntryDate, InitEntry } from "@/domain/model/entry.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { returnsNext, stub } from "std/testing/mock.ts";
import { assertEntryAndInitEntry, resetKv } from "@/test/db/helpers.ts";

const userId = "userId-1234";
const initEntry1: InitEntry = {
  userId: userId,
  amount: 1.99,
  date: {
    year: 2023,
    month: 1,
    date: 1,
  },
};

// same year, month, date-of-the-month
const initEntry2: InitEntry = {
  userId: userId,
  amount: 2.99,
  date: {
    year: 2023,
    month: 1,
    date: 1,
  },
};

// same year, month, different date-of-the-month
const initEntry3: InitEntry = {
  userId: userId,
  amount: 3.99,
  date: {
    year: 2023,
    month: 1,
    date: 2,
  },
};

// same year, different month
const initEntry4: InitEntry = {
  userId: userId,
  amount: 4.99,
  date: {
    year: 2023,
    month: 2,
    date: 2,
  },
};

// differnet year
const initEntry5: InitEntry = {
  userId: userId,
  amount: 5.99,
  date: {
    year: 2024,
    month: 2,
    date: 2,
  },
};

Deno.test("[db] add and get a entry (by date)", async (t) => {
  const entryDate: EntryDate = {
    year: 2023,
    month: 1,
    date: 1,
  };
  const initEntry: InitEntry = {
    userId: userId,
    amount: 10.99,
    date: entryDate,
  };

  let entry: Entry | undefined = undefined;

  try {
    await t.step("get an non-exist entry before adding anything", async () => {
      const entries = await getEntriesByDate(userId, {
        year: 1,
        month: 1,
        date: 1,
      });
      assertEquals(entries.length, 0);
    });

    await t.step("add one entry", async () => {
      entry = await addEntry(userId, initEntry);
      if (!entry) {
        throw "addEntry failed";
      }

      assertEntryAndInitEntry(initEntry, entry);
    });

    await t.step("get an non-exist entry after adding one entry", async () => {
      const entries = await getEntriesByDate(userId, {
        year: 1,
        month: 1,
        date: 1,
      });
      assertEquals(entries.length, 0);
    });

    await t.step("get an entry with full date", async () => {
      const entries = await getEntriesByDate(userId, {
        year: entryDate.year,
        month: entryDate.month,
        date: entryDate.date,
      });
      assertEquals(entries.length, 1);
      assertEquals(entries[0], entry);
    });

    await t.step("get an entry with year and month", async () => {
      const entries = await getEntriesByDate(userId, {
        year: entryDate.year,
        month: entryDate.month,
      });
      assertEquals(entries.length, 1);
      assertEquals(entries[0], entry);
    });

    await t.step("get an entry with year", async () => {
      const entries = await getEntriesByDate(userId, {
        year: entryDate.year,
      });
      assertEquals(entries.length, 1);
      assertEquals(entries[0], entry);
    });
  } finally {
    await resetKv();
  }
});

Deno.test("[db] add and get entries (by date)", async (t) => {
  let entry1: Entry | undefined = undefined;
  let entry2: Entry | undefined = undefined;
  let entry3: Entry | undefined = undefined;
  let entry4: Entry | undefined = undefined;
  let entry5: Entry | undefined = undefined;

  const randomUUIDStud = stub(
    crypto,
    "randomUUID",
    returnsNext(["a", "b", "c", "d", "e"]),
  );

  try {
    await t.step("add all entries", async () => {
      entry1 = await addEntry(userId, initEntry1);
      entry2 = await addEntry(userId, initEntry2);
      entry3 = await addEntry(userId, initEntry3);
      entry5 = await addEntry(userId, initEntry5);
      entry4 = await addEntry(userId, initEntry4); // most recent entry

      if (!entry1 || !entry2 || !entry3 || !entry4 || !entry5) {
        throw "addEntry faild";
      }

      assertEntryAndInitEntry(initEntry1, entry1);
      assertEntryAndInitEntry(initEntry2, entry2);
      assertEntryAndInitEntry(initEntry3, entry3);
      assertEntryAndInitEntry(initEntry4, entry4);
      assertEntryAndInitEntry(initEntry5, entry5);
    });

    await t.step("get entries by full date", async () => {
      const entries = await getEntriesByDate(userId, {
        year: initEntry1.date.year,
        month: initEntry1.date.month,
        date: initEntry1.date.date,
      });
      assertEquals(entries.length, 2);
      assertEquals(entries[0], entry2);
      assertEquals(entries[1], entry1);
    });

    await t.step("get entries by year and month", async () => {
      const entries = await getEntriesByDate(userId, {
        year: initEntry1.date.year,
        month: initEntry1.date.month,
      });
      assertEquals(entries.length, 3);
      assertEquals(entries[0], entry3);
      assertEquals(entries[1], entry2);
      assertEquals(entries[2], entry1);
    });

    await t.step("get entries by year", async () => {
      const entries = await getEntriesByDate(userId, {
        year: initEntry1.date.year,
      });

      assertEquals(entries.length, 4);
      assertEquals(entries[0], entry4);
      assertEquals(entries[1], entry3);
      assertEquals(entries[2], entry2);
      assertEquals(entries[3], entry1);
    });
  } finally {
    randomUUIDStud.restore();
    await resetKv();
  }
});
