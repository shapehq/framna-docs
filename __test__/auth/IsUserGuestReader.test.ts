import { IsUserGuestReader } from "../../src/features/auth/domain"

test("It considers no user to be a guest", async () => {
  const sut = new IsUserGuestReader()
  const isGuestA = await sut.getIsUserGuest("foo")
  const isGuestB = await sut.getIsUserGuest("bar")
  const isGuestC = await sut.getIsUserGuest("hello")
  expect(isGuestA).toBeFalsy()  
  expect(isGuestB).toBeFalsy()
  expect(isGuestC).toBeFalsy()
})
