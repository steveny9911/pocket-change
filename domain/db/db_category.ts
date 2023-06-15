import { kv } from "@/domain/db/kv.ts";
import { Category } from "@/domain/model/category.ts";

export const CATEGORY_BY_USERID_KEY = "category_by_userId";

export async function addCategory(userId: string, category: Category) {
  const categoryByUserIdKey = [CATEGORY_BY_USERID_KEY, userId, category.label];

  // TODO: limit the number of categories allowed per user

  const res = await kv.atomic()
    .check({ key: categoryByUserIdKey, versionstamp: null })
    .set(categoryByUserIdKey, category)
    .commit();

  if (!res.ok) throw `Failed to add entry: ${category.label}`;

  return category;
}

export async function getCategoryByUserId(userId: string, label: string) {
  const categoryByUserIdKey = [CATEGORY_BY_USERID_KEY, userId, label];
  const res = await kv.get<Category>(categoryByUserIdKey);

  return res.value;
}

export async function getCategoriesByUserId(userId: string) {
  const categoryByUserIdKey = [CATEGORY_BY_USERID_KEY, userId];

  const iter = await kv.list<Category>({ prefix: categoryByUserIdKey });

  const categories: Category[] = [];
  for await (const res of iter) categories.push(res.value);

  categories.sort((a, b) => a.label.localeCompare(b.label)); // sorted alphabetically

  return categories;
}
