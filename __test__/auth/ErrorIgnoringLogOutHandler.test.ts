import { ErrorIgnoringLogOutHandler } from "@/features/auth/domain"

test("It ignores errors", async () => {
  const sut = new ErrorIgnoringLogOutHandler({
    async handleLogOut() {
      throw new Error("Mock")
    }
  })
  // Test will fail if the following throws.
  await sut.handleLogOut()
})
