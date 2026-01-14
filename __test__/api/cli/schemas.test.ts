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
const mockListSchemas = jest.fn()

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

// Mock OpenAPIService
jest.unstable_mockModule("@/features/mcp/domain/OpenAPIService", () => ({
  OpenAPIService: jest.fn().mockImplementation(() => ({
    listSchemas: mockListSchemas,
  })),
}))

// Mock GitHubProjectDataSource
jest.unstable_mockModule(
  "@/features/projects/data/GitHubProjectDataSource",
  () => ({
    default: jest.fn().mockImplementation(() => ({
      getProjects: jest.fn(),
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

describe("CLI schemas list endpoint", () => {
  let GET: (request: NextRequest) => Promise<NextResponse>

  beforeAll(async () => {
    const routeModule = await import("@/app/api/cli/schemas/route")
    GET = routeModule.GET
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 401 when no auth header", async () => {
    const request = new Request(
      "http://localhost/api/cli/schemas?project=my-project"
    ) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Authorization header required")
  })

  it("returns 400 when project parameter is missing", async () => {
    mockGet.mockResolvedValue({
      sessionId: "valid-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })

    const request = new Request("http://localhost/api/cli/schemas", {
      headers: { Authorization: "Bearer valid-session" },
    }) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("project parameter required")
  })

  it("returns schema names with 200 status when authenticated", async () => {
    mockGet.mockResolvedValue({
      sessionId: "valid-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })

    const mockSchemas = ["User", "UserList", "Error", "CreateUserRequest"]
    mockListSchemas.mockResolvedValue(mockSchemas)

    const request = new Request(
      "http://localhost/api/cli/schemas?project=my-project",
      {
        headers: { Authorization: "Bearer valid-session" },
      }
    ) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.schemas).toEqual(mockSchemas)
    expect(mockListSchemas).toHaveBeenCalledWith(
      "my-project",
      undefined,
      undefined
    )
  })
})
