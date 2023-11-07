import CredentialsTransferringLogInHandler from "../../src/features/auth/domain/logIn/CredentialsTransferringLogInHandler"

test("It transfers credentials for guest", async () => {
  let didTransferGuestCredentials = false
  const sut = new CredentialsTransferringLogInHandler({
    isUserGuestReader: {
      async getIsUserGuest() {
        return true
      }
    },
    guestCredentialsTransferrer: {
      async transferCredentials() {
        didTransferGuestCredentials = true
      }
    },
    hostCredentialsTransferrer: {
      async transferCredentials() {}
    }
  })
  await sut.handleLogIn("1234")
  expect(didTransferGuestCredentials).toBeTruthy()
})

test("It transfers credentials for host", async () => {
  let didTransferHostCredentials = false
  const sut = new CredentialsTransferringLogInHandler({
    isUserGuestReader: {
      async getIsUserGuest() {
        return false
      }
    },
    guestCredentialsTransferrer: {
      async transferCredentials() {}
    },
    hostCredentialsTransferrer: {
      async transferCredentials() {
        didTransferHostCredentials = true
      }
    }
  })
  await sut.handleLogIn("1234")
  expect(didTransferHostCredentials).toBeTruthy()
})
