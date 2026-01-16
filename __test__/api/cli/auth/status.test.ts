import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals"

// Set environment variables before any module loading
process.env.REDIS_URL = "redis://localhost:6379"
process.env.GITHUB_CLIENT_ID = "test-client-id"
process.env.GITHUB_CLIENT_SECRET = "test-client-secret"

const mockPollForToken = jest.fn()

// Use unstable_mockModule for ESM
jest.unstable_mockModule("@/common/key-value-store/RedisKeyValueStore", () => ({
  default: jest.fn().mockImplementation(() => ({})),
}))

jest.unstable_mockModule("@/features/cli/data", () => ({
  RedisCLISessionStore: jest.fn().mockImplementation(() => ({})),
}))

jest.unstable_mockModule("@/features/cli/domain", () => ({
  CLIDeviceFlowService: jest.fn().mockImplementation(() => ({
    pollForToken: mockPollForToken,
  })),
}))

function createPostRequest(body: unknown, ip?: string): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (ip) {
    headers["x-forwarded-for"] = ip
  }
  return new Request("http://localhost/api/cli/auth/status", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
}

describe("POST /api/cli/auth/status", () => {
  let POST: (req: Request) => Promise<Response>
  let rateLimitMap: Map<string, number>

  beforeAll(async () => {
    const routeModule = await import("@/app/api/cli/auth/status/route")
    POST = routeModule.POST
    rateLimitMap = routeModule.rateLimitMap
  })

  beforeEach(() => {
    jest.clearAllMocks()
    rateLimitMap.clear()
  })

  it("returns pending when authorization not complete", async () => {
    mockPollForToken.mockResolvedValue(null)

    const request = createPostRequest({ device_code: "abc123" }, "192.168.1.1")
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ status: "pending" })
  })

  it("returns complete with sessionId on success", async () => {
    mockPollForToken.mockResolvedValue({ sessionId: "session-uuid" })

    const request = createPostRequest({ device_code: "abc123" }, "192.168.1.2")
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ status: "complete", sessionId: "session-uuid" })
  })

  it("returns 400 when device_code missing", async () => {
    const request = createPostRequest({}, "192.168.1.3")
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it("returns 400 when body is invalid JSON", async () => {
    const request = new Request("http://localhost/api/cli/auth/status", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.4" },
      body: "invalid json",
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: "Invalid JSON body" })
  })

  it("returns error status when pollForToken fails", async () => {
    mockPollForToken.mockRejectedValue(new Error("Token expired"))

    const request = createPostRequest({ device_code: "abc123" }, "192.168.1.5")
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ status: "error", error: "Token expired" })
  })

  describe("rate limiting", () => {
    it("returns 429 when same IP makes requests too quickly", async () => {
      mockPollForToken.mockResolvedValue(null)
      const testIP = "10.0.0.1"

      // First request should succeed
      const request1 = createPostRequest({ device_code: "abc123" }, testIP)
      const response1 = await POST(request1)
      expect(response1.status).toBe(200)

      // Second request from same IP should be rate limited
      const request2 = createPostRequest({ device_code: "abc123" }, testIP)
      const response2 = await POST(request2)
      const data = await response2.json()

      expect(response2.status).toBe(429)
      expect(data.error).toContain("Too many requests")
    })

    it("allows requests from different IPs", async () => {
      mockPollForToken.mockResolvedValue(null)

      const request1 = createPostRequest({ device_code: "abc123" }, "10.0.0.2")
      const response1 = await POST(request1)
      expect(response1.status).toBe(200)

      const request2 = createPostRequest({ device_code: "abc123" }, "10.0.0.3")
      const response2 = await POST(request2)
      expect(response2.status).toBe(200)
    })

    it("allows request after rate limit window expires", async () => {
      mockPollForToken.mockResolvedValue(null)
      const testIP = "10.0.0.4"

      // First request
      const request1 = createPostRequest({ device_code: "abc123" }, testIP)
      await POST(request1)

      // Simulate time passing by manually updating the rate limit map
      rateLimitMap.set(testIP, Date.now() - 6000) // 6 seconds ago

      // Request should now succeed
      const request2 = createPostRequest({ device_code: "abc123" }, testIP)
      const response2 = await POST(request2)
      expect(response2.status).toBe(200)
    })
  })
})
