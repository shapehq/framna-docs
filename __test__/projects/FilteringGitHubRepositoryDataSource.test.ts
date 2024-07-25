import { FilteringGitHubRepositoryDataSource } from "../../src/features/projects/domain"

test("It returns all repositories when no hidden repositories are provided", async () => {
  const sut = new FilteringGitHubRepositoryDataSource({
    hiddenRepositories: [],
    dataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [],
          tags: []
        }, {
          owner: "acme",
          name: "bar-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "bar"
          },
          branches: [],
          tags: []
        }]
      }
    }
  })
  const repositories = await sut.getRepositories()
  expect(repositories.length).toEqual(2)
})

test("It removes hidden repository", async () => {
  const sut = new FilteringGitHubRepositoryDataSource({
    hiddenRepositories: ["acme/foo-openapi"],
    dataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [],
          tags: []
        }, {
          owner: "acme",
          name: "bar-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "bar"
          },
          branches: [],
          tags: []
        }]
      }
    }
  })
  const repositories = await sut.getRepositories()
  expect(repositories.length).toEqual(1)
})

test("It returns unmodified list when hidden repository was not found", async () => {
  const sut = new FilteringGitHubRepositoryDataSource({
    hiddenRepositories: ["acme/baz-openapi"],
    dataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [],
          tags: []
        }, {
          owner: "acme",
          name: "bar-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "bar"
          },
          branches: [],
          tags: []
        }]
      }
    }
  })
  const repositories = await sut.getRepositories()
  expect(repositories.length).toEqual(2)
})

test("It removes multiple hidden repositories", async () => {
  const sut = new FilteringGitHubRepositoryDataSource({
    hiddenRepositories: ["acme/foo-openapi", "acme/bar-openapi"],
    dataSource: {
      async getRepositories() {
        return [{
          owner: "acme",
          name: "foo-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "main"
          },
          branches: [],
          tags: []
        }, {
          owner: "acme",
          name: "bar-openapi",
          defaultBranchRef: {
            id: "12345678",
            name: "bar"
          },
          branches: [],
          tags: []
        }]
      }
    }
  })
  const repositories = await sut.getRepositories()
  expect(repositories.length).toEqual(0)
})
