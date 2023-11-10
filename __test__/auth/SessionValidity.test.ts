import {
  mergeSessionValidity,
  SessionValidity
} from "../../src/features/auth/domain"

test("It returns invalid validity when left-hand side validity indicates that the session is invalid", async () => {
  const sut = mergeSessionValidity(
    SessionValidity.INVALID_ACCESS_TOKEN,
    SessionValidity.VALID
  )
  expect(sut).toEqual(SessionValidity.INVALID_ACCESS_TOKEN)
})

test("It returns invalid validity when right-hand side validity indicates that the session is invalid", async () => {
  const sut = mergeSessionValidity(
    SessionValidity.VALID,
    SessionValidity.INVALID_ACCESS_TOKEN
  )
  expect(sut).toEqual(SessionValidity.INVALID_ACCESS_TOKEN)
})

test("It returns valid validity when both validities indicate that the session is valid", async () => {
  const sut = mergeSessionValidity(
    SessionValidity.VALID,
    SessionValidity.VALID
  )
  expect(sut).toEqual(SessionValidity.VALID)
})
