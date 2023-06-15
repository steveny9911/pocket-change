import {
  assertCategories,
  assertEntries,
  assertUsers,
  resetKv,
} from "@/test/db/helpers.ts";
import { createUser } from "@/domain/db/db_user.ts";
import { returnsNext, stub } from "std/testing/mock.ts";
import { InitUser, User } from "@/domain/model/user.ts";
import { SubscriptionLevel } from "@/domain/model/subscription_level.ts";
import { Entry, InitEntry } from "@/domain/model/entry.ts";
import { assertEquals } from "std/testing/asserts.ts";
import {
  getCategoriesByUserId,
  getCategoryByUserId,
} from "@/domain/db/db_category.ts";
import { DEFAULT_CATEGORY } from "@/domain/model/category.ts";
import {
  addEntry,
  getEntriesByCategory,
  getEntriesByDate,
} from "@/domain/db/db_entry.ts";

Deno.test("[integration] create a user, get an entry, add a category", async (t) => {
  const createdAt = 12345;
  const sessionId = "sessionId-1234";
  const expectedUser: User = {
    sessionId: sessionId,
    id: "userId-1234",
    subscriptionLevel: SubscriptionLevel.Free,
    oauthAccounts: {
      github: {
        id: "githubId-1234",
        username: "githubUsername-1234",
      },
    },
    createdAt: createdAt,
  };
  const expectedEntry: Entry = {
    userId: expectedUser.id,
    amount: 10.99,
    date: {
      year: 2023,
      month: 1,
      date: 1,
    },
    categoryLabel: DEFAULT_CATEGORY.label,
    id: "entry-1234",
    createdAt: createdAt,
  };

  const randomUUIDStud = stub(
    crypto,
    "randomUUID",
    returnsNext([expectedUser.id, expectedEntry.id]),
  );

  const dateStub = stub(
    Date,
    "now",
    () => createdAt,
  );

  try {
    await t.step("[db] create a new user", async () => {
      const initUser: InitUser = { ...expectedUser };
      const user = await createUser(initUser);

      assertUsers(user, expectedUser);
    });

    await t.step("[db] get category should have default category", async () => {
      const categories = await getCategoriesByUserId(expectedUser.id);
      assertEquals(categories.length, 1);
      assertCategories(categories[0], DEFAULT_CATEGORY);

      const category = await getCategoryByUserId(
        expectedUser.id,
        DEFAULT_CATEGORY.label,
      );
      if (!category) throw "Cannot find default category";
      assertCategories(category, DEFAULT_CATEGORY);
    });

    await t.step(
      "[db] add an entry without a category should put into default category",
      async () => {
        const initEntry: InitEntry = { ...expectedEntry };
        delete initEntry.categoryLabel;

        const entry = await addEntry(expectedUser.id, initEntry);
        assertEntries(entry, expectedEntry);

        const entriesByDate = await getEntriesByDate(expectedUser.id, {
          year: 2023,
        });
        assertEquals(entriesByDate.length, 1);
        assertEntries(entriesByDate[0], expectedEntry);

        const entriesByCategory = await getEntriesByCategory(
          expectedUser.id,
          DEFAULT_CATEGORY.label,
        );
        assertEquals(entriesByCategory.length, 1);
        assertEntries(entriesByCategory[0], expectedEntry);
      },
    );
  } finally {
    randomUUIDStud.restore();
    dateStub.restore();
    await resetKv();
  }
});
