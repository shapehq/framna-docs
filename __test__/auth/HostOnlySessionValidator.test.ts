import {
  HostOnlySessionValidator,
  SessionValidity
} from "../../src/features/auth/domain"

test("It validates session when user is host", async () => {
  let didValidateSession = false
  const sut = new HostOnlySessionValidator({
    isGuestReader: {
      async getIsGuest() {
        return false
      }
    },
    sessionValidator: {
      async validateSession() {
        didValidateSession = true
        return SessionValidity.VALID
      },
    }
  })
  await sut.validateSession()
  expect(didValidateSession).toBeTruthy()
})

test("It does not validate session when user is guest", async () => {
  let didValidateSession = false
  const sut = new HostOnlySessionValidator({
    isGuestReader: {
      async getIsGuest() {
        return true
      }
    },
    sessionValidator: {
      async validateSession() {
        didValidateSession = true
        return SessionValidity.VALID
      },
    }
  })
  await sut.validateSession()
  expect(didValidateSession).toBeFalsy()
})
