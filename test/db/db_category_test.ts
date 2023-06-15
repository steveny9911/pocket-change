import {
  addCategory,
  getCategoriesByUserId,
  getCategoryByUserId,
} from "@/domain/db/db_category.ts";
import { assertEquals } from "std/testing/asserts.ts";
import { assertCategories, resetKv } from "@/test/db/helpers.ts";
import { Category, DEFAULT_CATEGORY } from "@/domain/model/category.ts";

Deno.test("[db] add and get categories", async (t) => {
  const userId = "userId-1234";
  const expectedCategory1: Category = {
    label: "B",
    icon: "train",
  };
  const expectedCategory2: Category = {
    label: "A",
    icon: "movie",
  };

  try {
    await t.step("get non-exist categories before adding", async () => {
      const categories = await getCategoriesByUserId(userId);
      assertEquals(categories.length, 0);

      const category = await getCategoryByUserId(
        userId,
        DEFAULT_CATEGORY.label,
      );
      assertEquals(category, null); // no user related logics here
    });

    await t.step("add a category then get all", async () => {
      const category1 = await addCategory(userId, expectedCategory1);
      assertCategories(category1, expectedCategory1);

      const categories = await getCategoriesByUserId(userId);
      assertEquals(categories.length, 1);
      assertCategories(categories[0], expectedCategory1);
    });

    await t.step(
      "add a category with exactly the same label should fail",
      async () => {
        try {
          await addCategory(userId, expectedCategory1);
        } catch (e) {
          assertEquals(`Failed to add entry: ${expectedCategory1.label}`, e);
        }
      },
    );

    await t.step(
      "add another category and get should sort based on label",
      async () => {
        const category2 = await addCategory(userId, expectedCategory2);
        assertCategories(category2, expectedCategory2);

        const categories = await getCategoriesByUserId(userId);
        assertEquals(categories.length, 2);
        assertCategories(categories[0], expectedCategory2);
        assertCategories(categories[1], expectedCategory1);
      },
    );
  } finally {
    await resetKv();
  }
});
