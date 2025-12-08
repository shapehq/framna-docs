import { jest } from "@jest/globals"
import AzureDevOpsClient from "@/common/azure-devops/AzureDevOpsClient"
import { AzureDevOpsError } from "@/common/azure-devops/AzureDevOpsError"

const originalFetch = global.fetch

function createMockTokenDataSource(accessToken = "test-token") {
  return {
    async getOAuthToken() {
      return { accessToken }
    }
  }
}

function mockFetchResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null
    },
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(typeof data === "string" ? data : JSON.stringify(data)),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
  })
}

afterEach(() => {
  global.fetch = originalFetch
})

describe("getRepositories", () => {
  test("It calls the correct API endpoint", async () => {
    let fetchedUrl: string | undefined
    global.fetch = jest.fn().mockImplementation((url: string | URL | Request) => {
      fetchedUrl = url.toString()
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ value: [], count: 0 })
      })
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    await sut.getRepositories()

    expect(fetchedUrl).toContain("https://dev.azure.com/my-org/_apis/git/repositories")
    expect(fetchedUrl).toContain("api-version=7.1")
  })

  test("It includes the Bearer token in the Authorization header", async () => {
    let capturedHeaders: HeadersInit | undefined
    global.fetch = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      capturedHeaders = options?.headers
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ value: [], count: 0 })
      })
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource("my-access-token")
    })
    await sut.getRepositories()

    expect(capturedHeaders).toBeDefined()
    expect((capturedHeaders as Record<string, string>).Authorization).toEqual("Bearer my-access-token")
  })

  test("It returns the repositories from the response", async () => {
    global.fetch = mockFetchResponse({
      value: [
        { id: "repo-1", name: "foo-openapi", webUrl: "https://test", project: { id: "p1", name: "proj" } }
      ],
      count: 1
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    const repos = await sut.getRepositories()

    expect(repos).toHaveLength(1)
    expect(repos[0].name).toEqual("foo-openapi")
  })
})

describe("getRefs", () => {
  test("It calls the correct API endpoint with repository ID", async () => {
    let fetchedUrl: string | undefined
    global.fetch = jest.fn().mockImplementation((url: string | URL | Request) => {
      fetchedUrl = url.toString()
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ value: [], count: 0 })
      })
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    await sut.getRefs("repo-123")

    expect(fetchedUrl).toContain("/_apis/git/repositories/repo-123/refs")
  })

  test("It returns the refs from the response", async () => {
    global.fetch = mockFetchResponse({
      value: [
        { name: "refs/heads/main", objectId: "abc123" },
        { name: "refs/tags/v1.0", objectId: "def456" }
      ],
      count: 2
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    const refs = await sut.getRefs("repo-123")

    expect(refs).toHaveLength(2)
    expect(refs[0].name).toEqual("refs/heads/main")
  })
})

describe("getItems", () => {
  test("It calls the correct API endpoint with scope path and version", async () => {
    let fetchedUrl: string | undefined
    global.fetch = jest.fn().mockImplementation((url: string | URL | Request) => {
      fetchedUrl = url.toString()
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ value: [], count: 0 })
      })
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    await sut.getItems("repo-123", "/docs", "main")

    expect(fetchedUrl).toContain("/_apis/git/repositories/repo-123/items")
    expect(fetchedUrl).toContain("scopePath=%2Fdocs")
    expect(fetchedUrl).toContain("versionDescriptor.version=main")
    expect(fetchedUrl).toContain("recursionLevel=OneLevel")
  })

  test("It returns empty array when request fails", async () => {
    global.fetch = mockFetchResponse("Not found", 404)

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    const items = await sut.getItems("repo-123", "/", "main")

    expect(items).toEqual([])
  })
})

describe("getFileContent", () => {
  test("It returns text content for non-image files", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve("openapi: 3.0.0")
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    const content = await sut.getFileContent("repo-123", "openapi.yml", "main")

    expect(content).toEqual("openapi: 3.0.0")
  })

  test("It returns ArrayBuffer for image files", async () => {
    const mockArrayBuffer = new ArrayBuffer(16)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: () => Promise.resolve(mockArrayBuffer)
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    const content = await sut.getFileContent("repo-123", "icon.png", "main")

    expect(content).toBe(mockArrayBuffer)
  })

  test("It uses octet-stream Accept header for image files", async () => {
    let capturedHeaders: HeadersInit | undefined
    global.fetch = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      capturedHeaders = options?.headers
      return Promise.resolve({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
      })
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    await sut.getFileContent("repo-123", "logo.jpg", "main")

    expect((capturedHeaders as Record<string, string>).Accept).toEqual("application/octet-stream")
  })

  test("It uses text/plain Accept header for non-image files", async () => {
    let capturedHeaders: HeadersInit | undefined
    global.fetch = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      capturedHeaders = options?.headers
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve("content")
      })
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    await sut.getFileContent("repo-123", "openapi.yml", "main")

    expect((capturedHeaders as Record<string, string>).Accept).toEqual("text/plain")
  })

  test("It returns null when response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    const content = await sut.getFileContent("repo-123", "missing.yml", "main")

    expect(content).toBeNull()
  })

  test("It returns null when fetch throws an error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"))

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    const content = await sut.getFileContent("repo-123", "openapi.yml", "main")

    expect(content).toBeNull()
  })
})

describe("Error handling", () => {
  test("It throws AzureDevOpsError with isAuthError=true for 401 responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: () => Promise.resolve("Authentication failed")
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })

    try {
      await sut.getRepositories()
      fail("Expected error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(AzureDevOpsError)
      expect((e as AzureDevOpsError).isAuthError).toBe(true)
      expect((e as AzureDevOpsError).status).toBe(401)
    }
  })

  test("It throws AzureDevOpsError with isAuthError=true for 403 responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      text: () => Promise.resolve("Access denied")
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })

    try {
      await sut.getRepositories()
      fail("Expected error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(AzureDevOpsError)
      expect((e as AzureDevOpsError).isAuthError).toBe(true)
      expect((e as AzureDevOpsError).status).toBe(403)
    }
  })

  test("It throws AzureDevOpsError with isAuthError=true for 302 redirect to signin", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 302,
      statusText: "Found",
      headers: {
        get: (name: string) => name.toLowerCase() === "location" ? "https://login.microsoftonline.com/_signin" : null
      }
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })

    try {
      await sut.getRepositories()
      fail("Expected error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(AzureDevOpsError)
      expect((e as AzureDevOpsError).isAuthError).toBe(true)
      expect((e as AzureDevOpsError).status).toBe(302)
    }
  })

  test("It throws AzureDevOpsError with isAuthError=false for 302 redirect to non-auth URL", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 302,
      statusText: "Found",
      headers: {
        get: (name: string) => name.toLowerCase() === "location" ? "https://dev.azure.com/other-page" : null
      }
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })

    try {
      await sut.getRepositories()
      fail("Expected error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(AzureDevOpsError)
      expect((e as AzureDevOpsError).isAuthError).toBe(false)
      expect((e as AzureDevOpsError).status).toBe(302)
    }
  })

  test("It throws AzureDevOpsError with isAuthError=false for other error responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve("Server error")
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })

    try {
      await sut.getRepositories()
      fail("Expected error to be thrown")
    } catch (e) {
      expect(e).toBeInstanceOf(AzureDevOpsError)
      expect((e as AzureDevOpsError).isAuthError).toBe(false)
      expect((e as AzureDevOpsError).status).toBe(500)
    }
  })
})

describe("Image file detection", () => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg", ".ico"]

  test.each(imageExtensions)("It treats %s files as images", async (ext) => {
    let capturedHeaders: HeadersInit | undefined
    global.fetch = jest.fn().mockImplementation((_url: string, options?: RequestInit) => {
      capturedHeaders = options?.headers
      return Promise.resolve({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
      })
    })

    const sut = new AzureDevOpsClient({
      organization: "my-org",
      oauthTokenDataSource: createMockTokenDataSource()
    })
    await sut.getFileContent("repo-123", `image${ext}`, "main")

    expect((capturedHeaders as Record<string, string>).Accept).toEqual("application/octet-stream")
  })
})
