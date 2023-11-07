import GuestCredentialsTransferrer from "../../src/features/auth/domain/credentialsTransfer/GuestCredentialsTransferrer"

test("It fetches an access token for the specified user from the data source", async () => {
  let didFetchAccessToken = false
  const sut = new GuestCredentialsTransferrer({
    dataSource: {
      async getAccessToken() {
        didFetchAccessToken = true
        return "foo"
      }
    },
    repository: {
      async get() {
        return "foo"
      },
      async set() {},
      async delete() {},
    }
  })
  await sut.transferCredentials("123")
  expect(didFetchAccessToken).toBeTruthy()
})

test("It stores the feteched access token for the specified user", async () => {
  let storedUserId: string | undefined
  let storedAccessToken: string | undefined
  const sut = new GuestCredentialsTransferrer({
    dataSource: {
      async getAccessToken() {
        return "foo"
      }
    },
    repository: {
      async get() {
        return "foo"
      },
      async set(userId, accessToken) {
        storedUserId = userId
        storedAccessToken = accessToken
      },
      async delete() {},
    }
  })
  await sut.transferCredentials("123")
  expect(storedUserId).toBe("123")
  expect(storedAccessToken).toBe("foo")
})
