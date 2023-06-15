import { assertCategories, assertUsers, resetKv } from "@/test/db/helpers.ts";
import {
  createUser,
  getUserById,
  getUserByOAuth,
  getUserBySessionId,
  setUserSession,
} from "@/domain/db/db_user.ts";
import { OAuthProvider } from "@/domain/model/oauth_provider.ts";
import { assertEquals, assertExists } from "std/testing/asserts.ts";
import { stub } from "std/testing/mock.ts";
import { InitUser, User } from "@/domain/model/user.ts";
import { SubscriptionLevel } from "@/domain/model/subscription_level.ts";
import { getCategoriesByUserId } from "@/domain/db/db_category.ts";
import { DEFAULT_CATEGORY } from "@/domain/model/category.ts";

Deno.test("[db] login new user (create user) ", async (t) => {
  const sessionId = "sessionId-1234";
  const createdAt = 12345;
  const expectedUser: User = {
    sessionId: sessionId,
    id: "userId-1234",
    subscriptionLevel: SubscriptionLevel.Free,
    oauthAccounts: {
      github: {
        id: "githubId-1234",
        username: "githubUsername-1234",
      },
    },
    createdAt: createdAt,
  };

  // when creating a user
  // a random sessionId is created during callback
  // then createUser() is called with that random sessionId
  // createUser() will then generate a random userId
  //
  const randomUUIDStudForUserId = stub(
    crypto,
    "randomUUID",
    () => expectedUser.id,
  );

  const dateStub = stub(
    Date,
    "now",
    () => createdAt,
  );

  try {
    await t.step("get an non-exist user before creating anything", async () => {
      const userByOAuth = await getUserByOAuth(
        OAuthProvider.Github,
        expectedUser.oauthAccounts.github!.id,
      );
      assertEquals(userByOAuth, null);

      const userById = await getUserById(expectedUser.id);
      assertEquals(userById, null);

      const userBySessionId = await getUserBySessionId(sessionId);
      assertEquals(userBySessionId, null);
    });

    await t.step("create a new user", async () => {
      const initUser: InitUser = { ...expectedUser };

      const createdUser = await createUser(initUser);
      if (!createdUser) {
        throw "createUser failed";
      }

      assertUsers(expectedUser, createdUser);
    });

    await t.step("get the new user", async () => {
      const userByOAuth = await getUserByOAuth(
        OAuthProvider.Github,
        expectedUser.oauthAccounts.github!.id,
      );
      assertExists(userByOAuth);
      assertUsers(expectedUser, userByOAuth);

      const userById = await getUserById(expectedUser.id);
      assertExists(userById);
      assertUsers(expectedUser, userById);

      const userBySessionId = await getUserBySessionId(sessionId);
      assertExists(userBySessionId);
      assertUsers(expectedUser, userBySessionId);
    });

    await t.step("get categories of the new user", async () => {
      const categories = await getCategoriesByUserId(expectedUser.id);
      assertEquals(categories.length, 1);
      assertCategories(categories[0], DEFAULT_CATEGORY);
    });
  } finally {
    randomUUIDStudForUserId.restore();
    dateStub.restore();
    await resetKv();
  }
});

Deno.test("[db] login existing user (set user session)", async (t) => {
  const sessionId1 = "sessionId1-1234";
  const sessionId2 = "sessionId2-1234";
  const createdAt = 12345;
  const expectedUser: User = {
    sessionId: "",
    id: "userId-1234",
    subscriptionLevel: SubscriptionLevel.Free,
    oauthAccounts: {
      github: {
        id: "githubId-1234",
        username: "githubUsername-1234",
      },
    },
    createdAt: createdAt,
  };

  // when creating a user
  // a random sessionId is created during callback
  // then createUser() is called with that random sessionId
  // createUser() will then generate a random userId
  //
  const randomUUIDStud = stub(
    crypto,
    "randomUUID",
    () => expectedUser.id,
  );

  const dateStub = stub(
    Date,
    "now",
    () => createdAt,
  );

  try {
    await t.step("create a user", async () => {
      const initUser: InitUser = { ...expectedUser, sessionId: sessionId1 };
      expectedUser.sessionId = sessionId1;

      const createdUser = await createUser(initUser);
      if (!createdUser) {
        throw "createUser failed";
      }

      assertUsers(expectedUser, createdUser);
    });

    await t.step(
      "login exisiting user (set user session) and get user",
      async () => {
        // when logging an existing user,
        // the callback will create a new random sessionId
        expectedUser.sessionId = sessionId2;
        await setUserSession(expectedUser, sessionId2);

        const userByOAuth = await getUserByOAuth(
          OAuthProvider.Github,
          expectedUser.oauthAccounts.github!.id,
        );
        assertExists(userByOAuth);
        assertUsers(expectedUser, userByOAuth);

        const userById = await getUserById(expectedUser.id);
        assertExists(userById);
        assertUsers(expectedUser, userById);

        const userBySessionId = await getUserBySessionId(sessionId2);
        assertExists(userBySessionId);
        assertUsers(expectedUser, userBySessionId);
      },
    );
  } finally {
    randomUUIDStud.restore();
    dateStub.restore();
    await resetKv();
  }
});
