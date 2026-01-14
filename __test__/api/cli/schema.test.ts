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
const mockGetSchema = jest.fn()

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
    getSchema: mockGetSchema,
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

describe("CLI single schema endpoint", () => {
  let GET: (request: NextRequest) => Promise<NextResponse>

  beforeAll(async () => {
    const routeModule = await import("@/app/api/cli/schema/route")
    GET = routeModule.GET
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 401 when no auth header", async () => {
    const request = new Request(
      "http://localhost/api/cli/schema?project=my-project&name=User"
    ) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Authorization header required")
  })

  it("returns 400 when required parameters are missing", async () => {
    mockGet.mockResolvedValue({
      sessionId: "valid-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })

    const request = new Request(
      "http://localhost/api/cli/schema?project=my-project",
      {
        headers: { Authorization: "Bearer valid-session" },
      }
    ) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("project and name parameters required")
  })

  it("returns schema with 200 status when found", async () => {
    mockGet.mockResolvedValue({
      sessionId: "valid-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })

    const mockSchema = {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string", format: "email" },
      },
      required: ["id", "name"],
    }
    mockGetSchema.mockResolvedValue(mockSchema)

    const request = new Request(
      "http://localhost/api/cli/schema?project=my-project&name=User",
      {
        headers: { Authorization: "Bearer valid-session" },
      }
    ) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.schema).toEqual(mockSchema)
    expect(mockGetSchema).toHaveBeenCalledWith(
      "my-project",
      "User",
      undefined,
      undefined
    )
  })

  it("returns 404 when schema not found", async () => {
    mockGet.mockResolvedValue({
      sessionId: "valid-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })

    mockGetSchema.mockResolvedValue(null)

    const request = new Request(
      "http://localhost/api/cli/schema?project=my-project&name=NonExistent",
      {
        headers: { Authorization: "Bearer valid-session" },
      }
    ) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe("Schema not found")
  })
})
