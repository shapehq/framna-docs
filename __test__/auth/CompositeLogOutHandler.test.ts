import { CompositeLogOutHandler } from "../../src/features/auth/domain"

test("It invokes all log out handlers", async () => {
  let didCallLogOutHandler1 = false
  let didCallLogOutHandler2 = false
  let didCallLogOutHandler3 = false
  const sut = new CompositeLogOutHandler([{
    async handleLogOut() {
      didCallLogOutHandler1 = true
    }
  }, {
    async handleLogOut() {
      didCallLogOutHandler2 = true
    }
  }, {
    async handleLogOut() {
      didCallLogOutHandler3 = true
    }
  }])
  await sut.handleLogOut()
  expect(didCallLogOutHandler1).toBeTruthy()
  expect(didCallLogOutHandler2).toBeTruthy()
  expect(didCallLogOutHandler3).toBeTruthy()
})
