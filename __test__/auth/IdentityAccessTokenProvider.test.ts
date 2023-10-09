import { IdentityAccessTokenProvider } from "../../src/lib/auth/IdentityAccessTokenProvider"

test("It finds the access token for the specified provider", async () => {
  const sut = new IdentityAccessTokenProvider({
    async getUserDetails() {
      return {identities: [{provider: "github", accessToken: "foo"}]}
    }
  }, "github")
  const accessToken = await sut.getAccessToken()
  expect(accessToken).toBe("foo")
})

test("It errors when access token could not be found for provider", async () => {
  const sut = new IdentityAccessTokenProvider({
    async getUserDetails() {
      return {identities: [{provider: "google", accessToken: "foo"}]}
    }
  }, "github")
  expect(sut.getAccessToken()).rejects.toThrow()
})

test("It errors when there are no identities", async () => {
  const sut = new IdentityAccessTokenProvider({
    async getUserDetails() {
      return {identities: []}
    }
  }, "github")
  expect(sut.getAccessToken()).rejects.toThrow()
})
