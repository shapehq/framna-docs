import { AccessTokenService } from "../../src/features/auth/domain"
import { OAuthToken } from "../../src/features/auth/domain"

test("It gets the access token for the user", async () => {
  let readUserID: string | undefined
  const sut = new AccessTokenService({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    repository: {
      async get(userId) {
        readUserID = userId
        return { accessToken: "foo", refreshToken: "bar" }
      },
      async set() {},
      async delete() {},
    },
    refresher: {
      async refreshOAuthToken() {
        return { accessToken: "foo", refreshToken: "bar" }
      }
    }
  })
  const accessToken = await sut.getAccessToken()
  expect(readUserID).toBe("1234")
  expect(accessToken).toBe("foo")
})

test("It refreshes OAuth using stored refresh token", async () => {
  let usedRefreshToken: string | undefined
  const sut = new AccessTokenService({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    repository: {
      async get() {
        return { accessToken: "oldAccessToken", refreshToken: "oldRefreshToken" }
      },
      async set() {},
      async delete() {},
    },
    refresher: {
      async refreshOAuthToken(refreshToken) {
        usedRefreshToken = refreshToken
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    }
  })
  await sut.refreshAccessToken("oldAccessToken")
  expect(usedRefreshToken).toBe("oldRefreshToken")
})

test("It stores the new OAuth token for the user", async () => {
  let storedUserId: string | undefined
  let storedOAuthToken: OAuthToken | undefined
  const sut = new AccessTokenService({
    userIdReader: {
      async getUserId() {
        return "1234"
      }
    },
    repository: {
      async get() {
        return { accessToken: "oldAccessToken", refreshToken: "oldRefreshToken" }
      },
      async set(userId, oAuthToken) {
        storedUserId = userId
        storedOAuthToken = oAuthToken
      },
      async delete() {},
    },
    refresher: {
      async refreshOAuthToken() {
        return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" }
      }
    }
  })
  await sut.refreshAccessToken("foo")
  expect(storedUserId).toBe("1234")
  expect(storedOAuthToken?.accessToken).toBe("newAccessToken")
  expect(storedOAuthToken?.refreshToken).toBe("newRefreshToken")
})
