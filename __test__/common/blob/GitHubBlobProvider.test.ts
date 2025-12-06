import { jest } from "@jest/globals"
import GitHubBlobProvider from "@/common/blob/GitHubBlobProvider"
import { IGitHubClient, GetRepositoryContentRequest } from "@/common/github"

// Mock fetch globally for Blob conversion test
const originalFetch = global.fetch

function createMockClient(overrides: Partial<IGitHubClient> = {}): IGitHubClient {
  return {
    async graphql() {
      return {}
    },
    async getRepositoryContent() {
      return { downloadURL: "https://example.com/file" }
    },
    async getPullRequestFiles() {
      return []
    },
    async getPullRequestComments() {
      return []
    },
    async addCommentToPullRequest() {},
    async updatePullRequestComment() {},
    ...overrides
  }
}

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    blob: () => Promise.resolve(new Blob(["test content"]))
  })
})

afterEach(() => {
  global.fetch = originalFetch
})

test("It delegates to gitHubClient.getRepositoryContent", async () => {
  let forwardedRequest: GetRepositoryContentRequest | undefined
  const sut = new GitHubBlobProvider({
    gitHubClient: createMockClient({
      async getRepositoryContent(request) {
        forwardedRequest = request
        return { downloadURL: "https://example.com/file" }
      }
    })
  })
  await sut.getFileContent("owner", "repo", "path/to/file.yml", "abc123")
  expect(forwardedRequest).toEqual({
    repositoryOwner: "owner",
    repositoryName: "repo",
    path: "path/to/file.yml",
    ref: "abc123"
  })
})

test("It fetches blob from downloadURL", async () => {
  let fetchedURL: string | undefined
  global.fetch = jest.fn().mockImplementation((url: string | URL | Request) => {
    fetchedURL = url.toString()
    return Promise.resolve({
      blob: () => Promise.resolve(new Blob(["test content"]))
    })
  })

  const sut = new GitHubBlobProvider({
    gitHubClient: createMockClient({
      async getRepositoryContent() {
        return { downloadURL: "https://raw.githubusercontent.com/owner/repo/file.yml" }
      }
    })
  })
  await sut.getFileContent("owner", "repo", "file.yml", "main")
  expect(fetchedURL).toEqual("https://raw.githubusercontent.com/owner/repo/file.yml")
})

test("It returns Blob from the fetched content", async () => {
  const testBlob = new Blob(["test content"], { type: "application/octet-stream" })
  global.fetch = jest.fn().mockResolvedValue({
    blob: () => Promise.resolve(testBlob)
  })

  const sut = new GitHubBlobProvider({
    gitHubClient: createMockClient({
      async getRepositoryContent() {
        return { downloadURL: "https://example.com/file" }
      }
    })
  })
  const result = await sut.getFileContent("owner", "repo", "file.yml", "main")
  expect(result).toBe(testBlob)
})

test("It returns null when getRepositoryContent throws an error", async () => {
  const sut = new GitHubBlobProvider({
    gitHubClient: createMockClient({
      async getRepositoryContent() {
        throw new Error("Not found")
      }
    })
  })
  const result = await sut.getFileContent("owner", "repo", "file.yml", "main")
  expect(result).toBeNull()
})

test("It returns null when fetch throws an error", async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("Network error"))

  const sut = new GitHubBlobProvider({
    gitHubClient: createMockClient({
      async getRepositoryContent() {
        return { downloadURL: "https://example.com/file" }
      }
    })
  })
  const result = await sut.getFileContent("owner", "repo", "file.yml", "main")
  expect(result).toBeNull()
})
