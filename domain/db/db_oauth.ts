// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { kv } from "@/domain/db/kv.ts";
import { OAuthSession } from "@/domain/model/oauth_session.ts";

const OAUTH_SESSION_KV_PREFIX = "oauth-sessions";

export async function setOAuthSession(
  oauthSessionId: string,
  oauthSession: OAuthSession,
) {
  await kv.set([OAUTH_SESSION_KV_PREFIX, oauthSessionId], oauthSession);
}

export async function getOAuthSession(oauthSessionId: string) {
  const res = await kv.get<OAuthSession>([
    OAUTH_SESSION_KV_PREFIX,
    oauthSessionId,
  ]);
  return res.value;
}

export async function deleteOAuthSession(oauthSessionId: string) {
  await kv.delete([OAUTH_SESSION_KV_PREFIX, oauthSessionId]);
}
