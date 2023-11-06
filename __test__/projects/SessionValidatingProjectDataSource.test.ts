import SessionValidatingProjectDataSource from "../../src/features/projects/domain/SessionValidatingProjectDataSource"

test("It validates the session", async () => {
  let didValidateSession = false
  const sut = new SessionValidatingProjectDataSource({
    async validateSession() {
      didValidateSession = true
      return true
    },
  }, {
    async getProjects() {
      return []
    }
  })
  await sut.getProjects()
  expect(didValidateSession).toBeTruthy()
})

test("It fetches projects when session is valid", async () => {
  let didFetchProjects = false
  const sut = new SessionValidatingProjectDataSource({
    async validateSession() {
      return true
    },
  }, {
    async getProjects() {
      didFetchProjects = true
      return []
    }
  })
  await sut.getProjects()
  expect(didFetchProjects).toBeTruthy()
})

test("It throws error when session is invalid", async () => {
  const sut = new SessionValidatingProjectDataSource({
    async validateSession() {
      return false
    },
  }, {
    async getProjects() {
      return []
    }
  })
  expect(sut.getProjects()).rejects.toThrowError()
})
