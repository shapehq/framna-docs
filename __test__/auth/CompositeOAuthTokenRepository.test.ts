import { CompositeOAuthTokenRepository } from "../../src/features/auth/domain"

test("It traverses all repositories until it gets a value", async () => {
  let didGetFromRepository1 = false
  let didGetFromRepository2 = false
  let didGetFromRepository3 = false
  const sut = new CompositeOAuthTokenRepository({
    oAuthTokenRepositories: [{
      async get(_userId) {
        didGetFromRepository1 = true
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }, {
      async get(_userId) {
        didGetFromRepository2 = true
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }, {
      async get(_userId) {
        didGetFromRepository3 = true
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }]
  })
  await expect(sut.get("1234")).rejects.toThrow()
  expect(didGetFromRepository1).toBeTruthy()
  expect(didGetFromRepository2).toBeTruthy()
  expect(didGetFromRepository3).toBeTruthy()
})

test("It skips getting value from following repositories once it finds a value", async () => {
  let didGetFromRepository1 = false
  let didGetFromRepository2 = false
  let didGetFromRepository3 = false
  const sut = new CompositeOAuthTokenRepository({
    oAuthTokenRepositories: [{
      async get(_userId) {
        didGetFromRepository1 = true
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }, {
      async get(_userId) {
        didGetFromRepository2 = true
        return { accessToken: "foo" }
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }, {
      async get(_userId) {
        didGetFromRepository3 = true
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {}
    }]
  })
  await sut.get("1234")
  expect(didGetFromRepository1).toBeTruthy()
  expect(didGetFromRepository2).toBeTruthy()
  expect(didGetFromRepository3).toBeFalsy()
})

test("It sets OAuth token in all repositories", async () => {
  let didSetInRepository1 = false
  let didSetInRepository2 = false
  let didSetInRepository3 = false
  const sut = new CompositeOAuthTokenRepository({
    oAuthTokenRepositories: [{
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {
        didSetInRepository1 = true
      },
      async delete(_userId) {}
    }, {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {
        didSetInRepository2 = true
      },
      async delete(_userId) {}
    }, {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {
        didSetInRepository3 = true
      },
      async delete(_userId) {}
    }]
  })
  await sut.set("1234", { accessToken: "foo" })
  expect(didSetInRepository1).toBeTruthy()
  expect(didSetInRepository2).toBeTruthy()
  expect(didSetInRepository3).toBeTruthy()
})

test("It deletes OAuth token from all repositories", async () => {
  let didDeleteFromRepository1 = false
  let didDeleteFromRepository2 = false
  let didDeleteFromRepository3 = false
  const sut = new CompositeOAuthTokenRepository({
    oAuthTokenRepositories: [{
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {
        didDeleteFromRepository1 = true
      }
    }, {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {
        didDeleteFromRepository2 = true
      }
    }, {
      async get(_userId) {
        throw new Error("Not implemented")
      },
      async set(_userId, _token) {},
      async delete(_userId) {
        didDeleteFromRepository3 = true
      }
    }]
  })
  await sut.delete("1234")
  expect(didDeleteFromRepository1).toBeTruthy()
  expect(didDeleteFromRepository2).toBeTruthy()
  expect(didDeleteFromRepository3).toBeTruthy()
})
