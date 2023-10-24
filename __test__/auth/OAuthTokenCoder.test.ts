import OAuthTokenCoder from "../../src/features/auth/domain/OAuthTokenCoder"

test("It throws an error when the returned OAuth token does not contain an access token", async () => {
  const str = JSON.stringify({
    refreshToken: "bar",
    accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
    refreshTokenExpiryDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
  })
  expect(() => OAuthTokenCoder.decode(str)).toThrow()
})

test("It throws an error when the returned OAuth token does not contain an refresh token", async () => {
  const str = JSON.stringify({
    accessToken: "foo",
    accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
    refreshTokenExpiryDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
  })
  expect(() => OAuthTokenCoder.decode(str)).toThrow()
})

test("It throws an error when the returned OAuth token does not contain an expiry date for the access token", async () => {
  const str = JSON.stringify({
    accessToken: "foo",
    refreshToken: "bar",
    refreshTokenExpiryDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
  })
  expect(() => OAuthTokenCoder.decode(str)).toThrow()
})

test("It throws an error when the returned OAuth token does not contain an expiry date for the refresh token", async () => {
  const str = JSON.stringify({
    accessToken: "foo",
    refreshToken: "bar",
    accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
  })
  expect(() => OAuthTokenCoder.decode(str)).toThrow()
})

test("It throws an error when the returned OAuth token does not contain a valid expiry date for the access token", async () => {
  const str = JSON.stringify({
    accessToken: "foo",
    refreshToken: "bar",
    accessTokenExpiryDate: "baz",
    refreshTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000)
  })
  expect(() => OAuthTokenCoder.decode(str)).toThrow()
})

test("It throws an error when the returned OAuth token does not contain a valid expiry date for the refresh token", async () => {
  const str = JSON.stringify({
    accessToken: "foo",
    refreshToken: "bar",
    accessTokenExpiryDate: new Date(new Date().getTime() + 3600 * 1000),
    refreshTokenExpiryDate: "baz"
  })
  expect(() => OAuthTokenCoder.decode(str)).toThrow()
})
