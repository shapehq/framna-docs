import RemoveInvitedFlagLogInHandler from "../../src/features/auth/domain/logIn/RemoveInvitedFlagLogInHandler"

test("It removes invited flag from specified user", async () => {
  let updatedUserId: string | undefined
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  let updatedMetadata: {[key: string]: any} | undefined
  const sut = new RemoveInvitedFlagLogInHandler({
    async updateMetadata(userId, metadata) {
      updatedUserId = userId
      updatedMetadata = metadata
    }
  })
  await sut.handleLogIn("1234")
  expect(updatedUserId).toEqual("1234")
  expect(updatedMetadata).toEqual({
    has_pending_invitation: false
  })
})
