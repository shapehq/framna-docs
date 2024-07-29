import { UserDataCleanUpLogOutHandler } from "@/features/auth/domain"

test("It deletes data for the read user ID", async () => {
  let deletedUserId: string | undefined
  const sut = new UserDataCleanUpLogOutHandler({
    async getUserId() {
      return "foo"
    },
  }, {
    async delete(userId) {
      deletedUserId = userId
    }
  })
  await sut.handleLogOut()
  expect(deletedUserId).toBe("foo")
})
