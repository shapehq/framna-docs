import {
  GitHubRepositoryDataSource
 } from "../../src/features/projects/data"

test("It loads repositories from data source", async () => {
  let didLoadRepositories = false
  const sut = new GitHubRepositoryDataSource({
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    loginsDataSource: {
      async getLogins() {
        return [{
          name: "acme"
        }]
      }
    },
    graphQlClient: {
      async graphql() {
        didLoadRepositories = true
        return {
          search: {
            results: []
          }
        }
      }
    }
  })
  await sut.getRepositories()
  expect(didLoadRepositories).toBeTruthy()
})

test("It maps repositories from GraphQL to the GitHubRepository model", async () => {
  const sut = new GitHubRepositoryDataSource({
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    loginsDataSource: {
      async getLogins() {
        return [{
          name: "acme"
        }]
      }
    },
    graphQlClient: {
      async graphql() {
        return { 
          search: {
            results: [{
              name: "foo-openapi",
              owner: {
                login: "acme"
              },
              defaultBranchRef: {
                name: "main",
                target: {
                  oid: "12345678"
                }
              },
              branches: {
                edges: [{
                  node: {
                    name: "main",
                    target: {
                      oid: "12345678",
                      tree: {
                        entries: [{
                          name: "openapi.yml"
                        }]
                      }
                    }
                  }
                }]
              },
              tags: {
                edges: [{
                  node: {
                    name: "1.0",
                    target: {
                      oid: "12345678",
                      tree: {
                        entries: [{
                          name: "openapi.yml"
                        }]
                      }
                    }
                  }
                }]
              }
            }]
          }
        }
      }
    }
  })
  const repositories = await sut.getRepositories()
  expect(repositories).toEqual([{
    name: "foo-openapi",
    owner: "acme",
    defaultBranchRef: {
      id: "12345678",
      name: "main"
    },
    branches: [{
      id: "12345678",
      name: "main",
      files: [{
        name: "openapi.yml"
      }]
    }],
    tags: [{
      id: "12345678",
      name: "1.0",
      files: [{
        name: "openapi.yml"
      }]
    }]
  }])
})

test("It queries for both .yml and .yaml file extension with specifying .yml extension", async () => {
  let query: string | undefined
  const sut = new GitHubRepositoryDataSource({
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    loginsDataSource: {
      async getLogins() {
        return [{
          name: "acme"
        }]
      }
    },
    graphQlClient: {
      async graphql(request) {
        query = request.query
        return {
          search: {
            results: []
          }
        }
      }
    }
  })
  await sut.getRepositories()
  expect(query).toContain(".demo-docs.yml")
  expect(query).toContain(".demo-docs.yaml")
})

test("It queries for both .yml and .yaml file extension with specifying .yaml extension", async () => {
  let query: string | undefined
  const sut = new GitHubRepositoryDataSource({
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs.yml",
    loginsDataSource: {
      async getLogins() {
        return [{
          name: "acme"
        }]
      }
    },
    graphQlClient: {
      async graphql(request) {
        query = request.query
        return {
          search: {
            results: []
          }
        }
      }
    }
  })
  await sut.getRepositories()
  expect(query).toContain(".demo-docs.yml")
  expect(query).toContain(".demo-docs.yaml")
})

test("It queries for both .yml and .yaml file extension with no extension", async () => {
  let query: string | undefined
  const sut = new GitHubRepositoryDataSource({
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs",
    loginsDataSource: {
      async getLogins() {
        return [{
          name: "acme"
        }]
      }
    },
    graphQlClient: {
      async graphql(request) {
        query = request.query
        return {
          search: {
            results: []
          }
        }
      }
    }
  })
  await sut.getRepositories()
  expect(query).toContain(".demo-docs.yml")
  expect(query).toContain(".demo-docs.yaml")
})

test("It loads repositories for all logins", async () => {
  let searchQueries: string[] = []
  const sut = new GitHubRepositoryDataSource({
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".demo-docs",
    loginsDataSource: {
      async getLogins() {
        return [{
          name: "acme"
        }, {
          name: "somecorp"
        }, {
          name: "techsystems"
        }]
      }
    },
    graphQlClient: {
      async graphql(request) {
        if (request.variables?.searchQuery) {
          searchQueries.push(request.variables.searchQuery)
        }
        return {
          search: {
            results: []
          }
        }
      }
    }
  })
  await sut.getRepositories()
  expect(searchQueries.length).toEqual(4)
  expect(searchQueries).toContain("\"-openapi\" in:name is:private")
  expect(searchQueries).toContain("\"-openapi\" in:name user:acme is:public")
  expect(searchQueries).toContain("\"-openapi\" in:name user:somecorp is:public")
  expect(searchQueries).toContain("\"-openapi\" in:name user:techsystems is:public")
})
