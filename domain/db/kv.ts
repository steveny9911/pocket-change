/// <reference lib="deno.unstable" />
export const kv = Deno.env.get("ENV") === "test"
  ? await Deno.openKv(":memory:")
  : await Deno.openKv();
