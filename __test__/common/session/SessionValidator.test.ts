import SessionValidator from "../../../src/common/session/SessionValidator"

test("It validates a host user", async () => {
  let didValidateHostUser = false
  const sut = new SessionValidator({
    isGuestReader: {
      async getIsGuest() {
        return false
      }
    },
    guestSessionValidator: {
      async validateSession() {
        return true
      },
    },
    hostSessionValidator: {
      async validateSession() {
        didValidateHostUser = true
        return true
      },
    }
  })
  await sut.validateSession()
  expect(didValidateHostUser).toBeTruthy()
})

test("It validates a guest user", async () => {
  let didValidateGuestUser = false
  const sut = new SessionValidator({
    isGuestReader: {
      async getIsGuest() {
        return true
      }
    },
    guestSessionValidator: {
      async validateSession() {
        didValidateGuestUser = true
        return true
      },
    },
    hostSessionValidator: {
      async validateSession() {
        return true
      },
    }
  })
  await sut.validateSession()
  expect(didValidateGuestUser).toBeTruthy()
})
