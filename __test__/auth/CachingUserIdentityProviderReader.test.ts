import { CachingUserIdentityProviderReader } from "../../src/features/auth/domain"
import { UserIdentityProvider } from "../../src/features/auth/domain"

test("It fetches user identity provider if it is not cached", async () => {
  let didFetchUserIdentityProvider = false
  const sut = new CachingUserIdentityProviderReader({
    async get() {
      return null
    },
    async set() {},
    async delete() {}
  }, {
    async getUserIdentityProvider() {
      didFetchUserIdentityProvider = true
      return UserIdentityProvider.GITHUB
    },
  })
  await sut.getUserIdentityProvider("foo")
  expect(didFetchUserIdentityProvider).toBeTruthy()
})

test("It does not fetch user identity provider if it is cached", async () => {
  let didFetchUserIdentityProvider = false
  const sut = new CachingUserIdentityProviderReader({
    async get() {
      return UserIdentityProvider.GITHUB
    },
    async set() {},
    async delete() {}
  }, {
    async getUserIdentityProvider() {
      didFetchUserIdentityProvider = true
      return UserIdentityProvider.GITHUB
    },
  })
  await sut.getUserIdentityProvider("foo")
  expect(didFetchUserIdentityProvider).toBeFalsy()
})

test("It caches fetched user identity provider for user", async () => {
  let cachedUserId: string | undefined
  let cachedUserIdentityProvider: string | undefined
  const sut = new CachingUserIdentityProviderReader({
    async get() {
      return null
    },
    async set(userId, userIdentityProvider) {
      cachedUserId = userId
      cachedUserIdentityProvider = userIdentityProvider
    },
    async delete() {}
  }, {
    async getUserIdentityProvider() {
      return UserIdentityProvider.USERNAME_PASSWORD
    },
  })
  await sut.getUserIdentityProvider("1234")
  expect(cachedUserId).toBe("1234")
  expect(cachedUserIdentityProvider).toBe(UserIdentityProvider.USERNAME_PASSWORD.toString())
})
