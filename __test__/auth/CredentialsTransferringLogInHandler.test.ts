import CredentialsTransferringLogInHandler from "../../src/features/auth/domain/logIn/CredentialsTransferringLogInHandler"

test("It transfers credentials", async () => {
  let didTransferCredentials = false
  const sut = new CredentialsTransferringLogInHandler({
    async transferCredentials() {
      didTransferCredentials = true
    }
  })
  await sut.handleLogIn("1234")
  expect(didTransferCredentials).toBeTruthy()
})
