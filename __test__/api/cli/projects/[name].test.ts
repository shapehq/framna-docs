import {
  jest,
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
} from "@jest/globals"
import { NextRequest, NextResponse } from "next/server"

// Set environment variables before any module loading
process.env.REDIS_URL = "redis://localhost:6379"
process.env.REPOSITORY_NAME_SUFFIX = "-openapi"
process.env.FRAMNA_DOCS_PROJECT_CONFIGURATION_FILENAME = "framna-docs.yaml"
process.env.ENCRYPTION_PUBLIC_KEY_BASE_64 = Buffer.from(
  "mock-public-key"
).toString("base64")
process.env.ENCRYPTION_PRIVATE_KEY_BASE_64 = Buffer.from(
  "mock-private-key"
).toString("base64")

const mockGet = jest.fn()
const mockGetProjects = jest.fn()

// Mock Redis
jest.unstable_mockModule("@/common/key-value-store/RedisKeyValueStore", () => ({
  default: jest.fn().mockImplementation(() => ({})),
}))

// Mock MCP session store
jest.unstable_mockModule("@/features/mcp/data/RedisMCPSessionStore", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

// Mock GitHubProjectDataSource
jest.unstable_mockModule(
  "@/features/projects/data/GitHubProjectDataSource",
  () => ({
    default: jest.fn().mockImplementation(() => ({
      getProjects: mockGetProjects,
    })),
  })
)

// Mock other dependencies to avoid import errors
jest.unstable_mockModule("@/features/encrypt/EncryptionService", () => ({
  default: jest.fn().mockImplementation(() => ({
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  })),
}))

jest.unstable_mockModule("@/features/projects/domain/RemoteConfigEncoder", () => ({
  default: jest.fn().mockImplementation(() => ({
    encode: jest.fn(),
    decode: jest.fn(),
  })),
}))

describe("CLI single project endpoint", () => {
  let GET: (
    request: NextRequest,
    context: { params: Promise<{ name: string }> }
  ) => Promise<NextResponse>

  beforeAll(async () => {
    const routeModule = await import("@/app/api/cli/projects/[name]/route")
    GET = routeModule.GET
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 401 when no auth header", async () => {
    const request = new Request(
      "http://localhost/api/cli/projects/my-project"
    ) as NextRequest
    const response = await GET(request as NextRequest, {
      params: Promise.resolve({ name: "my-project" }),
    })

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Authorization header required")
  })

  it("returns 401 when session not found in Redis", async () => {
    mockGet.mockResolvedValue(null)

    const request = new Request("http://localhost/api/cli/projects/my-project", {
      headers: { Authorization: "Bearer invalid-session" },
    }) as NextRequest
    const response = await GET(request as NextRequest, {
      params: Promise.resolve({ name: "my-project" }),
    })

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Invalid or expired session")
  })

  it("returns project with 200 status when found", async () => {
    mockGet.mockResolvedValue({
      sessionId: "valid-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })

    const mockProject = {
      id: "owner-my-project",
      owner: "owner",
      name: "my-project",
      displayName: "My Project",
      versions: [],
      ownerUrl: "https://github.com/owner",
      url: "https://github.com/owner/my-project-openapi",
    }
    mockGetProjects.mockResolvedValue([mockProject])

    const request = new Request("http://localhost/api/cli/projects/my-project", {
      headers: { Authorization: "Bearer valid-session" },
    }) as NextRequest
    const response = await GET(request as NextRequest, {
      params: Promise.resolve({ name: "my-project" }),
    })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.project).toEqual(mockProject)
  })

  it("returns 404 when project not found", async () => {
    mockGet.mockResolvedValue({
      sessionId: "valid-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })

    mockGetProjects.mockResolvedValue([])

    const request = new Request(
      "http://localhost/api/cli/projects/non-existent",
      {
        headers: { Authorization: "Bearer valid-session" },
      }
    ) as NextRequest
    const response = await GET(request as NextRequest, {
      params: Promise.resolve({ name: "non-existent" }),
    })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe("Project not found")
  })
})
