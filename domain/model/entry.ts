import { EntryCategoryLabel } from "@/domain/model/category.ts";

export interface EntryDate {
  year: number;
  month: number;
  date: number;
}

export function entryDateToString(date: EntryDate): string {
  return new Date(`${date.year}-${date.month}-${date.date}`).toLocaleDateString(
    "default",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

export interface EntryDateSearch {
  year: number;
  month?: number;
  date?: number;
}

export function equalEntryDate(d1: EntryDate, d2: EntryDate): boolean {
  return d1.year === d2.year && d1.month === d2.month && d1.date === d2.date;
}

export function validEntryDate(
  entryDate: EntryDate | EntryDateSearch,
): boolean {
  if (
    (entryDate.year < 1) ||
    ((entryDate.month !== undefined) &&
      (entryDate.month < 1 || entryDate.month > 12)) ||
    ((entryDate.date !== undefined) &&
      (
        (entryDate.month === undefined) ||
        (entryDate.month < 1 || entryDate.month > 12) ||
        (entryDate.date < 1 || entryDate.date > 31)
      ))
  ) {
    return false;
  }

  return true;
}

export interface InitEntry {
  userId: string;
  accountId?: string;
  amount: number;
  date: EntryDate;
  payee?: string;
  categoryLabel?: EntryCategoryLabel;
  note?: string;
}

export interface Entry extends InitEntry {
  id: string;
  categoryLabel: EntryCategoryLabel;
  createdAt: number;
}
