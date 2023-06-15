import { Entry } from "@/domain/model/entry.ts";
import EntryRow from "@/components/EntryRow.tsx";
import EntryDelete from "@/islands/EntryDelete.tsx";

export default function EntryList(props: { entries: Entry[] }) {
  const { entries } = props;

  return (
    <>
      <div style="font-size: 1.7rem; font-family: Monaco">
        {entries.map((entry: Entry) => {
          return (
            <div style="margin-top: 1rem; margin-bottom: 1rem; display: flex; flex-direction: row; align-items: center">
              <EntryDelete entryId={entry.id} />
              <EntryRow entry={entry} />
            </div>
          );
        })}
      </div>
    </>
  );
}
