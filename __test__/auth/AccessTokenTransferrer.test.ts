import { AccessTokenTransferrer } from "../../src/features/auth/domain"

test("It transfers access token for GitHub account provider type", async () => {
  let didTransferAccessToken = false
  const sut = new AccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "github"
      }
    },
    gitHubAccessTokenTransferrer: {
      async transferAccessToken() {
        didTransferAccessToken = true
        return "new-github-access-token"
      }
    },
    guestAccessTokenTransferrer: {
      async transferAccessToken() {
        didTransferAccessToken = false
        return "new-guest-access-token"
      }
    }
  })
  const accessToken = await sut.transferAccessToken()
  expect(didTransferAccessToken).toBeTruthy()
  expect(accessToken).toBe("new-github-access-token")
})

test("It transfers access token for email account provider type", async () => {
  let didTransferAccessToken = false
  const sut = new AccessTokenTransferrer({
    session: {
      async getIsAuthenticated() {
        return true
      },
      async getUserId() {
        return "1234"
      },
      async getEmail() {
        return "john@example.com"
      },
      async getAccountProviderType() {
        return "email"
      }
    },
    gitHubAccessTokenTransferrer: {
      async transferAccessToken() {
        didTransferAccessToken = false
        return "new-github-access-token"
      }
    },
    guestAccessTokenTransferrer: {
      async transferAccessToken() {
        didTransferAccessToken = true
        return "new-guest-access-token"
      }
    }
  })
  const accessToken = await sut.transferAccessToken()
  expect(didTransferAccessToken).toBeTruthy()
  expect(accessToken).toBe("new-guest-access-token")
})
