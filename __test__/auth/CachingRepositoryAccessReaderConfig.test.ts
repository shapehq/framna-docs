import { CachingRepositoryAccessReaderConfig } from "../../src/features/auth/domain"

test("It fetches repository names for user if they are not cached", async () => {
  let didFetchRepositoryNames = false
  let requestedUserId: string | undefined
  const sut = new CachingRepositoryAccessReaderConfig({
    repository: {
      async get() {
        return null
      },
      async set() {},
      async setExpiring() {},
      async delete() {}
    },
    repositoryAccessReader: {
      async getRepositoryNames(userId: string) {
        didFetchRepositoryNames = true
        requestedUserId = userId
        return []
      }
    }
  })
  await sut.getRepositoryNames("1234")
  expect(didFetchRepositoryNames).toBeTruthy()
  expect(requestedUserId).toEqual("1234")
})

test("It does not fetch repository names if they are cached", async () => {
  let didFetchRepositoryNames = false
  const sut = new CachingRepositoryAccessReaderConfig({
    repository: {
      async get() {
        return "[\"foo\"]"
      },
      async set() {},
      async setExpiring() {},
      async delete() {}
    },
    repositoryAccessReader: {
      async getRepositoryNames() {
        didFetchRepositoryNames = true
        return []
      }
    }
  })
  await sut.getRepositoryNames("1234")
  expect(didFetchRepositoryNames).toBeFalsy()
})

test("It caches fetched repository names for user", async () => {
  let cachedUserId: string | undefined
  let cachedRepositoryNames: string | undefined
  const sut = new CachingRepositoryAccessReaderConfig({
    repository: {
      async get() {
        return null
      },
      async set(userId, value) {
        cachedUserId = userId
        cachedRepositoryNames = value
      },
      async setExpiring() {},
      async delete() {}
    },
    repositoryAccessReader: {
      async getRepositoryNames() {
        return ["foo"]
      }
    }
  })
  await sut.getRepositoryNames("1234")
  expect(cachedUserId).toEqual("1234")
  expect(cachedRepositoryNames).toEqual("[\"foo\"]")
})

test("It decodes cached repository names", async () => {
  const sut = new CachingRepositoryAccessReaderConfig({
    repository: {
      async get() {
        return "[\"foo\",\"bar\"]"
      },
      async set() {},
      async setExpiring() {},
      async delete() {}
    },
    repositoryAccessReader: {
      async getRepositoryNames() {
        return []
      }
    }
  })
  const repositoryNames = await sut.getRepositoryNames("1234")
  expect(repositoryNames).toEqual(["foo", "bar"])
})
