import { FallbackOAuthTokenRepository } from "@/features/auth/domain"

test("It reads from secondary repository if primary repository throws error", async () => {
  let didReadFromPrimaryRepository = false
  let didReadFromSecondaryRepository = false
  const sut = new FallbackOAuthTokenRepository({
    primaryRepository: {
      async get(_userId) {
        didReadFromPrimaryRepository = true
        throw new Error("Not found")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    },
    secondaryRepository: {
      async get(_userId) {
        didReadFromSecondaryRepository = true
        return { accessToken: "foo", refreshToken: "bar" }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await sut.get("1234")
  expect(didReadFromPrimaryRepository).toBeTruthy()
  expect(didReadFromSecondaryRepository).toBeTruthy()
})

test("It skips reading from secondary repository if OAuth token was found in primary repository", async () => {
  let didReadFromPrimaryRepository = false
  let didReadFromSecondaryRepository = false
  const sut = new FallbackOAuthTokenRepository({
    primaryRepository: {
      async get(_userId) {
        didReadFromPrimaryRepository = true
        return { accessToken: "foo", refreshToken: "bar" }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    },
    secondaryRepository: {
      async get(_userId) {
        didReadFromSecondaryRepository = true
        throw new Error("Not found")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await sut.get("1234")
  expect(didReadFromPrimaryRepository).toBeTruthy()
  expect(didReadFromSecondaryRepository).toBeFalsy()
})

test("It throws error if OAuth token was not found in any of the repositories", async () => {
  const sut = new FallbackOAuthTokenRepository({
    primaryRepository: {
      async get(_userId) {
        throw new Error("Not found")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    },
    secondaryRepository: {
      async get(_userId) {
        throw new Error("Not found")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await expect(sut.get("1234")).rejects.toThrow()
})

test("It sets value from secondary repository in primary repository", async () => {
  let didSetInPrimaryRepository = false
  const sut = new FallbackOAuthTokenRepository({
    primaryRepository: {
      async get(_userId) {
        throw new Error("Not found")
      },
      async set(_userId, _token) {
        didSetInPrimaryRepository = true
      },
      async delete(_userId) {}
    },
    secondaryRepository: {
      async get(_userId) {
        return { accessToken: "foo", refreshToken: "bar" }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }
  })
  await sut.get("1234")
  expect(didSetInPrimaryRepository).toBeTruthy()
})

test("It sets value in primary repository only", async () => {
  let didSetInPrimaryRepository = false
  let didSetInSecondaryRepository = false
  const sut = new FallbackOAuthTokenRepository({
    primaryRepository: {
      async get(_userId) {
        throw new Error("Not found")
      },
      async set(_userId, _token) {
        didSetInPrimaryRepository = true
      },
      async delete(_userId) {}
    },
    secondaryRepository: {
      async get(_userId) {
        return { accessToken: "foo", refreshToken: "bar" }
      },
      async set(_userId, _token) {
        didSetInSecondaryRepository = true
      },
      async delete(_userId) {}
    }
  })
  await sut.set("1234", { accessToken: "foo" })
  expect(didSetInPrimaryRepository).toBeTruthy()
  expect(didSetInSecondaryRepository).toBeFalsy()
})

test("It deletes value from primary repository only", async () => {
  let didDeleteFromPrimaryRepository = false
  let didDeleteFromSecondaryRepository = false
  const sut = new FallbackOAuthTokenRepository({
    primaryRepository: {
      async get(_userId) {
        throw new Error("Not found")
      },
      async set(_userId, _token) {},
      async delete(_userId) {
        didDeleteFromPrimaryRepository = true
      }
    },
    secondaryRepository: {
      async get(_userId) {
        return { accessToken: "foo", refreshToken: "bar" }
      },
      async set(_userId, _token) {},
      async delete(_userId) {
        didDeleteFromSecondaryRepository = true
      }
    }
  })
  await sut.delete("1234")
  expect(didDeleteFromPrimaryRepository).toBeTruthy()
  expect(didDeleteFromSecondaryRepository).toBeFalsy()
})
