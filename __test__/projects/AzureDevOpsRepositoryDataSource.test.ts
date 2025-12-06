import { AzureDevOpsRepositoryDataSource } from "@/features/projects/data"
import IAzureDevOpsClient, { AzureDevOpsRepository, AzureDevOpsRef, AzureDevOpsItem } from "@/common/azure-devops/IAzureDevOpsClient"

function createMockClient(overrides: Partial<IAzureDevOpsClient> = {}): IAzureDevOpsClient {
  return {
    async getRepositories(): Promise<AzureDevOpsRepository[]> {
      return []
    },
    async getRefs(): Promise<AzureDevOpsRef[]> {
      return []
    },
    async getItems(): Promise<AzureDevOpsItem[]> {
      return []
    },
    async getFileContent(): Promise<string | ArrayBuffer | null> {
      return null
    },
    ...overrides
  }
}

test("It loads repositories from data source", async () => {
  let didLoadRepositories = false
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        didLoadRepositories = true
        return []
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  await sut.getRepositories()
  expect(didLoadRepositories).toBeTruthy()
})

test("It filters repositories by suffix", async () => {
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }, {
          id: "repo-2",
          name: "bar-service",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/bar-service",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs(repositoryId) {
        if (repositoryId === "repo-1") {
          return [{
            name: "refs/heads/main",
            objectId: "abc123"
          }]
        }
        return []
      },
      async getItems() {
        return [{
          path: "/openapi.yml",
          gitObjectType: "blob"
        }]
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  const repositories = await sut.getRepositories()
  expect(repositories.length).toEqual(1)
  expect(repositories[0].name).toEqual("foo-openapi")
})

test("It maps repositories to the domain model", async () => {
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        return [{
          name: "refs/heads/main",
          objectId: "abc123"
        }, {
          name: "refs/tags/1.0",
          objectId: "def456"
        }]
      },
      async getItems() {
        return [{
          path: "/openapi.yml",
          gitObjectType: "blob"
        }]
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  const repositories = await sut.getRepositories()
  expect(repositories).toEqual([{
    name: "foo-openapi",
    owner: "myorg",
    webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
    defaultBranchRef: {
      id: "abc123",
      name: "main"
    },
    configYml: undefined,
    configYaml: undefined,
    branches: [{
      id: "abc123",
      name: "main",
      files: [{ name: "openapi.yml" }]
    }],
    tags: [{
      id: "def456",
      name: "1.0",
      files: [{ name: "openapi.yml" }]
    }]
  }])
})

test("It separates branches from tags by ref prefix", async () => {
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        return [
          { name: "refs/heads/main", objectId: "abc123" },
          { name: "refs/heads/develop", objectId: "abc124" },
          { name: "refs/tags/v1.0", objectId: "def456" },
          { name: "refs/tags/v2.0", objectId: "def457" }
        ]
      },
      async getItems() {
        return [{ path: "/openapi.yml", gitObjectType: "blob" }]
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  const repositories = await sut.getRepositories()
  expect(repositories[0].branches.length).toEqual(2)
  expect(repositories[0].tags.length).toEqual(2)
  expect(repositories[0].branches.map(b => b.name)).toEqual(["main", "develop"])
  expect(repositories[0].tags.map(t => t.name)).toEqual(["v1.0", "v2.0"])
})

test("It strips refs/heads/ and refs/tags/ prefixes from ref names", async () => {
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/feature/test",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        return [
          { name: "refs/heads/feature/test", objectId: "abc123" },
          { name: "refs/tags/release/v1.0", objectId: "def456" }
        ]
      },
      async getItems() {
        return [{ path: "/openapi.yml", gitObjectType: "blob" }]
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  const repositories = await sut.getRepositories()
  expect(repositories[0].branches[0].name).toEqual("feature/test")
  expect(repositories[0].tags[0].name).toEqual("release/v1.0")
  expect(repositories[0].defaultBranchRef.name).toEqual("feature/test")
})

test("It fetches config file with .yml extension", async () => {
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        return [{ name: "refs/heads/main", objectId: "abc123" }]
      },
      async getItems() {
        return [{ path: "/openapi.yml", gitObjectType: "blob" }]
      },
      async getFileContent(_repoId, path) {
        if (path === ".framna-docs.yml") {
          return "name: Test Project"
        }
        return null
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  const repositories = await sut.getRepositories()
  expect(repositories[0].configYml).toEqual({ text: "name: Test Project" })
})

test("It fetches config file with .yaml extension", async () => {
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        return [{ name: "refs/heads/main", objectId: "abc123" }]
      },
      async getItems() {
        return [{ path: "/openapi.yml", gitObjectType: "blob" }]
      },
      async getFileContent(_repoId, path) {
        if (path === ".framna-docs.yaml") {
          return "name: Test Project"
        }
        return null
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yaml"
  })
  const repositories = await sut.getRepositories()
  expect(repositories[0].configYaml).toEqual({ text: "name: Test Project" })
})

test("It strips file extension from config filename before querying", async () => {
  const queriedPaths: string[] = []
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        return [{ name: "refs/heads/main", objectId: "abc123" }]
      },
      async getItems() {
        return [{ path: "/openapi.yml", gitObjectType: "blob" }]
      },
      async getFileContent(_repoId, path) {
        queriedPaths.push(path)
        return null
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  await sut.getRepositories()
  expect(queriedPaths).toContain(".framna-docs.yml")
  expect(queriedPaths).toContain(".framna-docs.yaml")
})

test("It only includes blob items as files", async () => {
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        return [{ name: "refs/heads/main", objectId: "abc123" }]
      },
      async getItems() {
        return [
          { path: "/openapi.yml", gitObjectType: "blob" },
          { path: "/docs", gitObjectType: "tree" },
          { path: "/schema.json", gitObjectType: "blob" }
        ]
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  const repositories = await sut.getRepositories()
  expect(repositories[0].branches[0].files.length).toEqual(2)
  expect(repositories[0].branches[0].files.map(f => f.name)).toEqual(["openapi.yml", "schema.json"])
})

test("It defaults to main branch when defaultBranch is not set", async () => {
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        return [{ name: "refs/heads/main", objectId: "abc123" }]
      },
      async getItems() {
        return [{ path: "/openapi.yml", gitObjectType: "blob" }]
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  const repositories = await sut.getRepositories()
  expect(repositories[0].defaultBranchRef.name).toEqual("main")
})

test("It returns null for repositories that fail to enrich", async () => {
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        throw new Error("API Error")
      },
      async getItems() {
        return []
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  const repositories = await sut.getRepositories()
  expect(repositories.length).toEqual(0)
})

test("It returns null for refs that fail to enrich", async () => {
  let callCount = 0
  const sut = new AzureDevOpsRepositoryDataSource({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          defaultBranch: "refs/heads/main",
          webUrl: "https://dev.azure.com/myorg/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getRefs() {
        return [
          { name: "refs/heads/main", objectId: "abc123" },
          { name: "refs/heads/broken", objectId: "broken123" }
        ]
      },
      async getItems(_repoId, _path, version) {
        callCount++
        if (version === "broken") {
          throw new Error("API Error")
        }
        return [{ path: "/openapi.yml", gitObjectType: "blob" }]
      }
    }),
    organization: "myorg",
    repositoryNameSuffix: "-openapi",
    projectConfigurationFilename: ".framna-docs.yml"
  })
  const repositories = await sut.getRepositories()
  expect(callCount).toEqual(2)
  expect(repositories[0].branches.length).toEqual(1)
  expect(repositories[0].branches[0].name).toEqual("main")
})
