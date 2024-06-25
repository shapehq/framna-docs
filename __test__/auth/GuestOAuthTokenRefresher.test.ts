import { GuestOAuthTokenRefresher } from "../../src/features/auth/domain"

test("It gets OAuth token from data source", async () => {
  let didCallDataSource = false
  const sut = new GuestOAuthTokenRefresher({
    dataSource: {
      async getOAuthToken() {
        didCallDataSource = true
        return { accessToken: "foo" }
      }
    }
  })
  await sut.refreshOAuthToken({
    accessToken: "foo"
  })
  expect(didCallDataSource).toBeTruthy()
})

test("It throws an error when the provided OAuth token contains a refresh token", async () => {
  const sut = new GuestOAuthTokenRefresher({
    dataSource: {
      async getOAuthToken() {
        return { accessToken: "foo" }
      }
    }
  })
  await expect(
    sut.refreshOAuthToken({
      accessToken: "foo",
      refreshToken: "bar" 
    })
  )
  .rejects
  .toThrow()
})
