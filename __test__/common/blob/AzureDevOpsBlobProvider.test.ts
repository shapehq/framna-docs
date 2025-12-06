import AzureDevOpsBlobProvider from "@/common/blob/AzureDevOpsBlobProvider"
import IAzureDevOpsClient from "@/common/azure-devops/IAzureDevOpsClient"

function createMockClient(overrides: Partial<IAzureDevOpsClient> = {}): IAzureDevOpsClient {
  return {
    async getRepositories() {
      return []
    },
    async getRefs() {
      return []
    },
    async getItems() {
      return []
    },
    async getFileContent() {
      return null
    },
    ...overrides
  }
}

test("It returns null when repository is not found", async () => {
  const sut = new AzureDevOpsBlobProvider({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "other-repo",
          webUrl: "https://dev.azure.com/org/proj/_git/other-repo",
          project: { id: "proj-1", name: "proj" }
        }]
      }
    })
  })
  const result = await sut.getFileContent("org", "foo-openapi", "openapi.yml", "main")
  expect(result).toBeNull()
})

test("It returns null when file content is not found", async () => {
  const sut = new AzureDevOpsBlobProvider({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          webUrl: "https://dev.azure.com/org/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getFileContent() {
        return null
      }
    })
  })
  const result = await sut.getFileContent("org", "foo-openapi", "openapi.yml", "main")
  expect(result).toBeNull()
})

test("It returns text content as string", async () => {
  const sut = new AzureDevOpsBlobProvider({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          webUrl: "https://dev.azure.com/org/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getFileContent() {
        return "openapi: 3.0.0\ninfo:\n  title: Test API"
      }
    })
  })
  const result = await sut.getFileContent("org", "foo-openapi", "openapi.yml", "main")
  expect(result).toEqual("openapi: 3.0.0\ninfo:\n  title: Test API")
})

test("It converts ArrayBuffer content to Blob", async () => {
  const testData = new TextEncoder().encode("binary content")
  const sut = new AzureDevOpsBlobProvider({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-1",
          name: "foo-openapi",
          webUrl: "https://dev.azure.com/org/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getFileContent() {
        return testData.buffer
      }
    })
  })
  const result = await sut.getFileContent("org", "foo-openapi", "icon.png", "main")
  expect(result).toBeInstanceOf(Blob)
})

test("It passes correct parameters to getFileContent", async () => {
  let passedParams: { repoId?: string, path?: string, ref?: string } = {}
  const sut = new AzureDevOpsBlobProvider({
    client: createMockClient({
      async getRepositories() {
        return [{
          id: "repo-123",
          name: "foo-openapi",
          webUrl: "https://dev.azure.com/org/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getFileContent(repositoryId, path, version) {
        passedParams = { repoId: repositoryId, path, ref: version }
        return "content"
      }
    })
  })
  await sut.getFileContent("org", "foo-openapi", "openapi.yml", "main")
  expect(passedParams).toEqual({
    repoId: "repo-123",
    path: "openapi.yml",
    ref: "main"
  })
})

test("It ignores the owner parameter since organization is configured globally", async () => {
  let didCallGetRepositories = false
  const sut = new AzureDevOpsBlobProvider({
    client: createMockClient({
      async getRepositories() {
        didCallGetRepositories = true
        return [{
          id: "repo-1",
          name: "foo-openapi",
          webUrl: "https://dev.azure.com/org/proj/_git/foo-openapi",
          project: { id: "proj-1", name: "proj" }
        }]
      },
      async getFileContent() {
        return "content"
      }
    })
  })
  // Pass a different owner - it should still find the repo
  await sut.getFileContent("different-org", "foo-openapi", "openapi.yml", "main")
  expect(didCallGetRepositories).toBeTruthy()
})
