import type { Handlers } from "$fresh/server.ts";
import { State } from "@/routes/_middleware.ts";
import { redirect } from "@/utils/http.ts";
import { signIn } from "deno_kv_oauth";
import { client } from "@/utils/oauth2_clients.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(req, ctx) {
    return ctx.state.sessionId ? redirect("/") : await signIn(req, client);
  },
};
