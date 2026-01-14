import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals"

// Set environment variables before any module loading
process.env.REDIS_URL = "redis://localhost:6379"
process.env.GITHUB_CLIENT_ID = "test-client-id"

const mockPollForToken = jest.fn()

// Use unstable_mockModule for ESM
jest.unstable_mockModule("@/common/key-value-store/RedisKeyValueStore", () => ({
  default: jest.fn().mockImplementation(() => ({})),
}))

jest.unstable_mockModule("@/features/mcp/data", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({})),
}))

jest.unstable_mockModule("@/features/mcp/domain", () => ({
  MCPDeviceFlowService: jest.fn().mockImplementation(() => ({
    pollForToken: mockPollForToken,
  })),
}))

describe("GET /api/cli/auth/status", () => {
  let GET: (req: Request) => Promise<Response>

  beforeAll(async () => {
    const routeModule = await import("@/app/api/cli/auth/status/route")
    GET = routeModule.GET
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns pending when authorization not complete", async () => {
    mockPollForToken.mockResolvedValue(null)

    const request = new Request(
      "http://localhost/api/cli/auth/status?device_code=abc123"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ status: "pending" })
  })

  it("returns complete with sessionId on success", async () => {
    mockPollForToken.mockResolvedValue({ sessionId: "session-uuid" })

    const request = new Request(
      "http://localhost/api/cli/auth/status?device_code=abc123"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ status: "complete", sessionId: "session-uuid" })
  })

  it("returns 400 when device_code missing", async () => {
    const request = new Request("http://localhost/api/cli/auth/status")
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it("returns error status when pollForToken fails", async () => {
    mockPollForToken.mockRejectedValue(new Error("Token expired"))

    const request = new Request(
      "http://localhost/api/cli/auth/status?device_code=abc123"
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ status: "error", error: "Token expired" })
  })
})
