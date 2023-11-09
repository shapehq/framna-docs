import { AccessTokenService } from "../../src/features/auth/domain"

test("It reads the access token for a guest user", async () => {
  let didReadAccessToken = false
  const sut = new AccessTokenService({
    isGuestReader: {
      async getIsGuest() {
        return true
      }
    },
    guestAccessTokenService: {
      async getAccessToken() {
        didReadAccessToken = true
        return "oldAccessToken"
      },
      async refreshAccessToken() {
        return "newAccessToken"
      }
    },
    hostAccessTokenService: {
      async getAccessToken() {
        return "oldAccessToken"
      },
      async refreshAccessToken() {
        return "newAccessToken"
      }
    }
  })
  await sut.getAccessToken()
  expect(didReadAccessToken).toBeTruthy()
})

test("It refreshes the access token for a guest user", async () => {
  let didRefreshAccessToken = false
  const sut = new AccessTokenService({
    isGuestReader: {
      async getIsGuest() {
        return true
      }
    },
    guestAccessTokenService: {
      async getAccessToken() {
        return "oldAccessToken"
      },
      async refreshAccessToken() {
        didRefreshAccessToken = true
        return "newAccessToken"
      }
    },
    hostAccessTokenService: {
      async getAccessToken() {
        return "oldAccessToken"
      },
      async refreshAccessToken() {
        return "newAccessToken"
      }
    }
  })
  await sut.refreshAccessToken("oldAccessToken")
  expect(didRefreshAccessToken).toBeTruthy()
})

test("It reads the access token for a host user", async () => {
  let didReadAccessToken = false
  const sut = new AccessTokenService({
    isGuestReader: {
      async getIsGuest() {
        return false
      }
    },
    guestAccessTokenService: {
      async getAccessToken() {
        return "oldAccessToken"
      },
      async refreshAccessToken() {
        return "newAccessToken"
      }
    },
    hostAccessTokenService: {
      async getAccessToken() {
        didReadAccessToken = true
        return "oldAccessToken"
      },
      async refreshAccessToken() {
        return "newAccessToken"
      }
    }
  })
  await sut.getAccessToken()
  expect(didReadAccessToken).toBeTruthy()
})

test("It refreshes the access token for a host user", async () => {
  let didRefreshAccessToken = false
  const sut = new AccessTokenService({
    isGuestReader: {
      async getIsGuest() {
        return false
      }
    },
    guestAccessTokenService: {
      async getAccessToken() {
        return "oldAccessToken"
      },
      async refreshAccessToken() {
        return "newAccessToken"
      }
    },
    hostAccessTokenService: {
      async getAccessToken() {
        return "oldAccessToken"
      },
      async refreshAccessToken() {
        didRefreshAccessToken = true
        return "newAccessToken"
      }
    }
  })
  await sut.refreshAccessToken("oldAccessToken")
  expect(didRefreshAccessToken).toBeTruthy()
})
