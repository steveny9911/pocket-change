import { State } from "@/routes/_middleware.ts";
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { redirect } from "@/utils/http.ts";
import { User } from "@/domain/model/user.ts";
import {
  deleteUserBySessionId,
  getUserBySessionId,
} from "@/domain/db/db_user.ts";
import { signOut } from "deno_kv_oauth";

export interface UserState extends State {
  sessionId: string;
  user: User;
}

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<UserState>,
) {
  if (!ctx.state.sessionId) return redirect("/");

  const user = await getUserBySessionId(ctx.state.sessionId);
  if (!user) {
    await deleteUserBySessionId(ctx.state.sessionId);
    return await signOut(req);
  }

  ctx.state.user = user;
  return await ctx.next();
}
