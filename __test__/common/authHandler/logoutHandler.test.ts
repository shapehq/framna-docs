import logoutHandler from "@/common/authHandler/logout"

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
    async getProjects() {
      return []
    },
    async storeProjects() {},
    async deleteProjects() {}
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
    async getProjects() {
      return []
    },
    async storeProjects() {},
    async deleteProjects() {
      didDeleteProjects = true
    }
  })
  expect(didDeleteProjects).toBeTruthy()
})
