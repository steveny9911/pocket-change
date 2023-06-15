import { useRef } from "preact/hooks";

export default function EntryDelete({ entryId }: { entryId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleOpen = () => {
    dialogRef.current?.showModal();
  };

  const handleClose = () => {
    dialogRef.current?.close();
  };

  const handleDelete = async () => {
    const res = await fetch(`/my?entryId=${entryId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      location.reload();
    }
  };

  return (
    <>
      <dialog
        id="edit-entry-dialog"
        ref={dialogRef}
        class="modal-dialog outer-border"
        style="max-width: 30rem;"
      >
        <section
          class="field-row"
          style="justify-content: flex-end; margin: 0.7rem"
        >
          <button class="btn" onClick={handleClose}>
            Cancel
          </button>

          <button class="btn" onClick={handleDelete}>
            Delete entry
          </button>
        </section>
      </dialog>
      <div onClick={handleOpen} style="cursor: pointer">
        <img
          src="icons/Bomb.svg"
          width="50"
          height="50"
          style="padding-right: 1rem"
        />
      </div>
    </>
  );
}
