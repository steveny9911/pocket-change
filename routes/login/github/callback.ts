import type { Handlers } from "$fresh/server.ts";
import { client } from "@/utils/oauth2_clients.ts";
import { InitUser } from "@/domain/model/user.ts";
import { SubscriptionLevel } from "@/domain/model/subscription_level.ts";
import { State } from "@/routes/_middleware.ts";
import * as db_user from "@/domain/db/db_user.ts";
import { OAuthProvider } from "@/domain/model/oauth_provider.ts";
import { handleCallback } from "deno_kv_oauth";

interface ResponseGitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  email: string;
}

async function getGithubUser(accessToken: string): Promise<ResponseGitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error();
  }

  return await response.json() as ResponseGitHubUser;
}

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, State> = {
  async GET(req: Request, _ctx) {
    // const accessToken = await getAccessToken(req, GithubOAuth2Client);
    const { response, accessToken, sessionId } = await handleCallback(
      req,
      client,
    );
    const githubUser = await getGithubUser(accessToken);

    const user = await db_user.getUserByOAuth(
      OAuthProvider.Github,
      githubUser.id.toString(),
    );
    if (!user) {
      const initUser: InitUser = {
        sessionId: sessionId,
        subscriptionLevel: SubscriptionLevel.Free,
        stripeCustomerId: undefined,
        oauthAccounts: {
          github: {
            id: githubUser.id.toString(),
            username: githubUser.login.toString(),
          },
        },
      };

      await db_user.createUser(initUser);
    } else {
      await db_user.setUserSession(user, sessionId);
    }

    return response;
  },
};
