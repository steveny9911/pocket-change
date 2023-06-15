import { Entry, entryDateToString } from "@/domain/model/entry.ts";
import { CurrencyFmt } from "@/utils/fmt.ts";

export default function EntryRow({ entry }: { entry: Entry }) {
  return (
    <>
      <div style="flex-grow: 1">
        <div style="display: flex; flex-direction: row; justify-content: space-between">
          <p>{entry.note ? entry.note : "---"}</p>
          <p>{CurrencyFmt.format(entry.amount)}</p>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: space-between">
          {
            /* <p>
            {(!entry.categoryLabel || entry.categoryLabel === "")
              ? "---"
              : entry.categoryLabel}
          </p> */
          }
          <p>{entry.payee}</p>
          <p>{entryDateToString(entry.date)}</p>
        </div>
      </div>
    </>
  );
}
