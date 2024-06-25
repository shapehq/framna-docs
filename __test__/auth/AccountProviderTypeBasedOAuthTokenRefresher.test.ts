import { AccountProviderTypeBasedOAuthTokenRefresher } from "../../src/features/auth/domain"

test("It refreshes using email refresher when account provider is \"email\"", async () => {
  let didRefreshUsingEmailStrategy = false
  let didRefreshUsingGitHubStrategy = false
  const sut = new AccountProviderTypeBasedOAuthTokenRefresher({
    accountProviderReader: {
      async getAccountProvider() {
        return "email"
      }
    },
    strategy: {
      email: {
        async refreshOAuthToken(_oauthToken) {
          didRefreshUsingEmailStrategy = true
          return { accessToken: "foo "}
        }
      },
      github: {
        async refreshOAuthToken(_oauthToken) {
          didRefreshUsingGitHubStrategy = true
          return { accessToken: "foo "}
        }
      }
    }
  })
  await sut.refreshOAuthToken({ accessToken: "foo", refreshToken: "bar" })
  expect(didRefreshUsingEmailStrategy).toBeTruthy()
  expect(didRefreshUsingGitHubStrategy).toBeFalsy()
})

test("It refreshes using GitHub refresher when account provider is \"github\"", async () => {
  let didRefreshUsingEmailStrategy = false
  let didRefreshUsingGitHubStrategy = false
  const sut = new AccountProviderTypeBasedOAuthTokenRefresher({
    accountProviderReader: {
      async getAccountProvider() {
        return "github"
      }
    },
    strategy: {
      email: {
        async refreshOAuthToken(_oauthToken) {
          didRefreshUsingEmailStrategy = true
          return { accessToken: "foo "}
        }
      },
      github: {
        async refreshOAuthToken(_oauthToken) {
          didRefreshUsingGitHubStrategy = true
          return { accessToken: "foo "}
        }
      }
    }
  })
  await sut.refreshOAuthToken({ accessToken: "foo", refreshToken: "bar" })
  expect(didRefreshUsingEmailStrategy).toBeFalsy()
  expect(didRefreshUsingGitHubStrategy).toBeTruthy()
})
