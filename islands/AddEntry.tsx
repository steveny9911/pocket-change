import { Category } from "@/domain/model/category.ts";
import { useRef } from "preact/hooks";

export default function AddEntry(props: { categories: Category[] }) {
  const { categories } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleOpen = () => {
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button onClick={handleOpen} class="btn">
        Add
      </button>
      <dialog
        id="add-entry-dialog"
        ref={dialogRef}
        class="modal-dialog outer-border"
        style="max-width: 30rem;"
      >
        <div class="inner-border">
          <div class="modal-contents">
            <h1 class="modal-text center">Add An Entry</h1>
            <form
              style="all: unset"
              ref={formRef}
              method="POST"
            >
              <div style="padding-left: 20px; padding-right: 20px">
                <div class="field-row">
                  <label for="amount">
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    step="0.01"
                    inputMode="numeric"
                    pattern="\d*"
                    required
                  />
                </div>
                <div class="field-row">
                  <label for="date">
                    Date
                  </label>
                  <input id="date" type="date" name="date" required />
                </div>

                <div class="field-row">
                  <label for="payee">
                    Payee
                  </label>
                  <input
                    id="payee"
                    type="text"
                    name="payee"
                    maxLength={128}
                  />
                </div>
                <div class="field-row">
                  <label for="note">
                    Note
                  </label>
                  <input id="note" type="text" name="note" maxLength={128} />
                </div>
                <div class="field-row">
                  <label for="categoryLabel">
                    Category
                  </label>
                  <select
                    id="categoryLabel"
                    name="categoryLabel"
                    aria-label="category label"
                  >
                    {categories.map((c) => {
                      return (
                        <option id={c.label} value={c.label}>{c.label}</option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <section
                class="field-row"
                style="justify-content: flex-end; margin-top: 20px; margin-right: 20px; margin-bottom: 10px;"
              >
                <button
                  value="cancel"
                  class="btn"
                  onClick={() => {
                    dialogRef.current?.close();
                    formRef.current?.reset();
                  }}
                >
                  Cancel
                </button>
                <button value="default" class="btn">
                  Add!
                </button>
              </section>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
