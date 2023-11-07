import { CompositeLogInHandler } from "../../src/features/auth/domain"

test("It invokes all log in handlers for user", async () => {
  let userId1: string | undefined
  let userId2: string | undefined
  let userId3: string | undefined
  const sut = new CompositeLogInHandler([{
    async handleLogIn(userId) {
      userId1 = userId
    }
  }, {
    async handleLogIn(userId) {
      userId2 = userId
    }
  }, {
    async handleLogIn(userId) {
      userId3 = userId
    }
  }])
  await sut.handleLogIn("1234")
  expect(userId1).toEqual("1234")
  expect(userId2).toEqual("1234")
  expect(userId3).toEqual("1234")
})
