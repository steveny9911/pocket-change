import { InitUser, User } from "@/domain/model/user.ts";
import { kv } from "@/domain/db/kv.ts";
import { OAuthProvider } from "@/domain/model/oauth_provider.ts";
import { CATEGORY_BY_USERID_KEY } from "@/domain/db/db_category.ts";
import { DEFAULT_CATEGORY } from "@/domain/model/category.ts";

export const USER_KEY = "user";
export const USER_BY_SESSION_KEY = "user_by_session";
export const USER_BY_OAUTH_GITHUB_KEY = "user_by_oauth_github";

export async function createUser(initUser: InitUser) {
  const user: User = {
    ...initUser,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  const userKey = [USER_KEY, user.id];
  const userBySessionKey = [USER_BY_SESSION_KEY, user.sessionId];

  // ensure all user has a default category with label of "" (see: DEFAULT_CATEGORY)
  const categoryByUserIdKey = [CATEGORY_BY_USERID_KEY, user.id, ""];

  const ops = kv.atomic()
    .check({ key: userKey, versionstamp: null })
    .check({ key: userBySessionKey, versionstamp: null })
    .check({ key: categoryByUserIdKey, versionstamp: null })
    .set(userKey, user)
    .set(userBySessionKey, user)
    .set(categoryByUserIdKey, DEFAULT_CATEGORY);

  if (user.oauthAccounts.github !== undefined) {
    const userByOAuthGithub = [
      USER_BY_OAUTH_GITHUB_KEY,
      user.oauthAccounts.github.id,
    ];

    ops.check({
      key: userByOAuthGithub,
      versionstamp: null,
    }).set(userByOAuthGithub, user);
  }

  const res = await ops.commit();

  if (!res.ok) {
    throw new Error(
      `Failed to create user: ${user.id}, oauth: ${initUser.oauthAccounts}`,
    );
  }

  return user;
}

export async function getUserByOAuth(
  oauthProvider: OAuthProvider,
  githubId: string,
) {
  switch (oauthProvider) {
    case OAuthProvider.Github: {
      const res = await kv.get<User>([USER_BY_OAUTH_GITHUB_KEY, githubId]);
      return res.value;
    }
    default:
      throw new Error("Unknown OAuth provider");
  }
}

export async function getUserById(userId: string) {
  const res = await kv.get<User>([USER_KEY, userId]);
  return res.value;
}

export async function getUserBySessionId(sessionId: string) {
  const userBySessionKey = [USER_BY_SESSION_KEY, sessionId];

  const res = await kv.get<User>(userBySessionKey, {
    consistency: "eventual",
  }) ?? await kv.get<User>(userBySessionKey);

  return res.value;
}

/**
 * Checks for existing/previous sessions in 'user';
 * if exist, delete previous sessions, then user session;
 * else, set user session
 *
 * @param user
 * @param sessionId
 */
export async function setUserSession(
  user: User,
  sessionId: string,
) {
  if (user.sessionId !== undefined) {
    await deleteUserBySessionId(user.sessionId);
  }

  const userKey = [USER_KEY, user.id];
  const userBySessionKey = [USER_BY_SESSION_KEY, sessionId];

  user = { ...user, sessionId } as User;

  const ops = kv.atomic()
    .check({ key: userBySessionKey, versionstamp: null })
    .set(userKey, user)
    .set(userBySessionKey, user);

  if (user.oauthAccounts.github !== undefined) {
    const userByOAuthGithub = [
      USER_BY_OAUTH_GITHUB_KEY,
      user.oauthAccounts.github.id,
    ];

    ops.set(userByOAuthGithub, user);
  }

  const res = await ops.commit();

  if (!res.ok) throw new Error(`Failed to set user session: ${user.id}`);
}

export async function deleteUserBySessionId(sessionId: string) {
  await kv.delete([USER_BY_SESSION_KEY, sessionId]);
}
