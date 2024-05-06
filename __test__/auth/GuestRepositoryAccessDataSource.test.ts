import { GuestRepositoryAccessDataSource } from "../../src/features/auth/domain"

test("It throws error if no user was found for the user ID", async () => {
  const sut = new GuestRepositoryAccessDataSource({
    db: {
      async connect() {
        return {
          async query(_query: string, _values: any[] = []) {
            // Return no rows as the user was not found.
            return { rows: [] }
          },
          async disconnect() {}
        }
      },
      async query(_query, _values = []) {
        // Return no rows as the user was not found.
        return { rows: [] }
      }
    },
    guestRepository: {
      async getProjectsForEmail(_email) {
        return []
      }
    }
  })
  await expect(sut.getRepositoryNames("1234")).rejects.toThrow()
})

test("It throws an error if the user does not have an e-mail", async () => {
  const sut = new GuestRepositoryAccessDataSource({
    db: {
      async connect() {
        return {
          async query(_query: string, _values: any[] = []) {
            return {
              rows: [{ email: null }]
            }
          },
          async disconnect() {}
        }
      },
      async query(_query, _values = []) {
        return { 
          rows: [{ email: null }]
        }
      }
    },
    guestRepository: {
      async getProjectsForEmail(_email) {
        return []
      }
    }
  })
  await expect(sut.getRepositoryNames("1234")).rejects.toThrow()
})

test("It throws an error if the user has an empty e-mail", async () => {
  const sut = new GuestRepositoryAccessDataSource({
    db: {
      async connect() {
        return {
          async query(_query: string, _values: any[] = []) {
            return {
              rows: [{ email: "" }]
            }
          },
          async disconnect() {}
        }
      },
      async query(_query, _values = []) {
        return { 
          rows: [{ email: "" }]
        }
      }
    },
    guestRepository: {
      async getProjectsForEmail(_email) {
        return []
      }
    }
  })
  await expect(sut.getRepositoryNames("1234")).rejects.toThrow()
})

test("It queries the guest repository using the user's e-mail", async () => {
  let queriedEmail: string | undefined
  const sut = new GuestRepositoryAccessDataSource({
    db: {
      async connect() {
        return {
          async query(_query: string, _values: any[] = []) {
            return {
              rows: [{ email: "john@example.com" }]
            }
          },
          async disconnect() {}
        }
      },
      async query(_query, _values = []) {
        return { 
          rows: [{ email: "john@example.com" }]
        }
      }
    },
    guestRepository: {
      async getProjectsForEmail(email) {
        queriedEmail = email
        return []
      }
    }
  })
  await sut.getRepositoryNames("1234")
  expect(queriedEmail).toBe("john@example.com")
})

test("It returns repository names fetched from guest repository", async () => {
  const sut = new GuestRepositoryAccessDataSource({
    db: {
      async connect() {
        return {
          async query(_query: string, _values: any[] = []) {
            return {
              rows: [{ email: "john@example.com" }]
            }
          },
          async disconnect() {}
        }
      },
      async query(_query, _values = []) {
        return { 
          rows: [{ email: "john@example.com" }]
        }
      }
    },
    guestRepository: {
      async getProjectsForEmail(_email) {
        return ["foo", "bar"]
      }
    }
  })
  const repositoryNames = await sut.getRepositoryNames("1234")
  expect(repositoryNames).toEqual(["foo", "bar"])
})
