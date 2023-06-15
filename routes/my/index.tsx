import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { UserState } from "@/routes/my/_middleware.ts";
import {
  addEntry,
  deleteEntry,
  getEntriesByDate,
} from "@/domain/db/db_entry.ts";
import { Entry, InitEntry } from "@/domain/model/entry.ts";
import { getCategoriesByUserId } from "@/domain/db/db_category.ts";
import { Category } from "@/domain/model/category.ts";
import Head from "@/components/Head.tsx";
import EntryList from "@/components/EntryList.tsx";
import AddEntry from "@/islands/AddEntry.tsx";
import { redirect } from "@/utils/http.ts";

export interface UserEntriesState extends UserState {
  entries: Entry[];
  categories: Category[];
}

interface PagePropsType extends UserEntriesState {
  searchDate: string;
}

export const handler: Handlers<UserEntriesState, UserEntriesState> = {
  async GET(
    req: Request,
    ctx: HandlerContext<PagePropsType, UserEntriesState>,
  ) {
    const url = new URL(req.url);

    const searchDate = url.searchParams.get("searchDate") ??
      new Date().toISOString().split("T")[0].slice(0, 7);
    const searchYear = parseInt(searchDate.split("-")[0]);
    const searchMonth = parseInt(searchDate.split("-")[1]);

    const entries = await getEntriesByDate(ctx.state.user.id, {
      year: searchYear,
      month: searchMonth,
    });
    ctx.state.entries = entries;

    const categories = await getCategoriesByUserId(ctx.state.user.id);
    ctx.state.categories = categories;

    return ctx.render({ ...ctx.state, searchDate });
  },
  async POST(
    req: Request,
    ctx: HandlerContext<UserEntriesState, UserEntriesState>,
  ) {
    const form = await req.formData();

    if (
      !form.get("amount") || !form.get("amount")?.toString() ||
      !form.get("date") || !form.get("date")?.toString() ||
      form.get("date")?.toString().split("-").length !== 3
    ) {
      return redirect("/my");
    }

    const initEntry: InitEntry = {
      userId: ctx.state.user.id,
      accountId: undefined,
      amount: Number(form.get("amount")?.toString()!),
      date: {
        year: parseInt(form.get("date")?.toString().split("-")[0]!),
        month: parseInt(form.get("date")?.toString().split("-")[1]!),
        date: parseInt(form.get("date")?.toString().split("-")[2]!),
      },
      payee: form.get("payee")?.toString() === ""
        ? undefined
        : form.get("payee")?.toString(),
      categoryLabel: form.get("categoryLabel")?.toString() === ""
        ? undefined
        : form.get("categoryLabel")?.toString(),
      note: form.get("note")?.toString() === ""
        ? undefined
        : form.get("note")?.toString(),
    };

    await addEntry(ctx.state.user.id, initEntry);
    return redirect("/my");
  },
  async DELETE(
    req: Request,
    ctx: HandlerContext<UserEntriesState, UserEntriesState>,
  ) {
    const url = new URL(req.url);

    const entryId = url.searchParams.get("entryId");
    if (!entryId) {
      return redirect("/my");
    }

    await deleteEntry(ctx.state.user.id, entryId);

    return redirect("/my");
  },
};

export default function Home(props: PageProps<PagePropsType>) {
  const { entries, categories, searchDate } = props.data;

  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <>
        <div class="window">
          <div class="title-bar">
            <button aria-label="Close" class="btn close"></button>
            <h1 class="title">Pocket Change</h1>
            <button aria-label="Resize" class="btn resize"></button>
          </div>
          <div class="details-bar">
            <AddEntry categories={categories} />
            <form method="GET">
              <input
                id="searchDate"
                type="month"
                name="searchDate"
                required
                value={searchDate}
              />
              <button class="btn" style="margin-left: 1rem">Search</button>
            </form>
          </div>

          <div class="window-pane">
            <EntryList entries={entries} />
          </div>
        </div>
      </>
    </>
  );
}
