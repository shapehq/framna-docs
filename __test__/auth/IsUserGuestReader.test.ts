import { IsUserGuestReader } from "../../src/features/auth/domain"
import { UserIdentityProvider } from "../../src/features/auth/domain"

test("It does not consider a user to be a guest if they are logged in with GitHub", async () => {
  const sut = new IsUserGuestReader({
    async getUserIdentityProvider() {
      return UserIdentityProvider.GITHUB
    }
  })
  const isGuest = await sut.getIsUserGuest("foo")
  expect(isGuest).toBeFalsy()
})

test("It considers user a to be a guest if they are logged in with username and password", async () => {
  const sut = new IsUserGuestReader({
    async getUserIdentityProvider() {
      return UserIdentityProvider.USERNAME_PASSWORD
    }
  })
  const isGuest = await sut.getIsUserGuest("foo")
  expect(isGuest).toBeTruthy()
})
