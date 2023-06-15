import { Entry } from "@/domain/model/entry.ts";

/**
 * sort entries in-place
 *
 * sort by year, then month, then date-of-the-month, then createdAt time, then entry id
 * with most recent entry first
 *
 * if the same createdAt time, then compare by entry-id
 * entry of the larger id will come first
 * (but pretty much no order guaranteed for entries of the same createdAt time)
 *
 * @param entries
 */
export function sortEntries(entries: Entry[]) {
  entries.sort((a, b) => {
    return (b.date.year - a.date.year) ||
      (b.date.month - a.date.month) ||
      (b.date.date - a.date.date) ||
      (b.createdAt - a.createdAt) ||
      (b.id.localeCompare(a.id));
  });
}
