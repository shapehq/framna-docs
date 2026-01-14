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
const mockGetEndpointDetails = jest.fn()

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
    getEndpointDetails: mockGetEndpointDetails,
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

describe("CLI single endpoint endpoint", () => {
  let GET: (request: NextRequest) => Promise<NextResponse>

  beforeAll(async () => {
    const routeModule = await import("@/app/api/cli/endpoint/route")
    GET = routeModule.GET
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 401 when no auth header", async () => {
    const request = new Request(
      "http://localhost/api/cli/endpoint?project=my-project&path=/users&method=GET"
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
      "http://localhost/api/cli/endpoint?project=my-project&path=/users",
      {
        headers: { Authorization: "Bearer valid-session" },
      }
    ) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("project, path, and method parameters required")
  })

  it("returns endpoint details with 200 status when found", async () => {
    mockGet.mockResolvedValue({
      sessionId: "valid-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })

    const mockEndpoint = {
      summary: "List users",
      operationId: "listUsers",
      tags: ["users"],
      responses: {
        "200": {
          description: "Successful response",
        },
      },
    }
    mockGetEndpointDetails.mockResolvedValue(mockEndpoint)

    const request = new Request(
      "http://localhost/api/cli/endpoint?project=my-project&path=/users&method=GET",
      {
        headers: { Authorization: "Bearer valid-session" },
      }
    ) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.endpoint).toEqual(mockEndpoint)
    expect(mockGetEndpointDetails).toHaveBeenCalledWith(
      "my-project",
      "/users",
      "get",
      undefined,
      undefined
    )
  })

  it("returns 404 when endpoint not found", async () => {
    mockGet.mockResolvedValue({
      sessionId: "valid-session",
      accessToken: "github-token",
      createdAt: new Date().toISOString(),
    })

    mockGetEndpointDetails.mockResolvedValue(null)

    const request = new Request(
      "http://localhost/api/cli/endpoint?project=my-project&path=/nonexistent&method=GET",
      {
        headers: { Authorization: "Bearer valid-session" },
      }
    ) as NextRequest
    const response = await GET(request as NextRequest)

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBe("Endpoint not found")
  })
})
