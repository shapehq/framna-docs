import logoutHandler from "../../../src/common/authHandler/logout"

test("It deletes the user's auth token", async () => {
  let didDeleteAuthToken = false
  logoutHandler({
    async getOAuthToken() {
      throw new Error("Not implemented")
    },
    async storeOAuthToken() {},
    async deleteOAuthToken() {
      didDeleteAuthToken = true
    }
  }, {
    async get() {
      return []
    },
    async set() {},
    async delete() {}
  })
  expect(didDeleteAuthToken).toBeTruthy()
})

test("It deletes the cached projects", async () => {
  let didDeleteProjects = false
  logoutHandler({
    async getOAuthToken() {
      throw new Error("Not implemented")
    },
    async storeOAuthToken() {},
    async deleteOAuthToken() {}
  }, {
    async get() {
      return []
    },
    async set() {},
    async delete() {
      didDeleteProjects = true
    }
  })
  expect(didDeleteProjects).toBeTruthy()
})
