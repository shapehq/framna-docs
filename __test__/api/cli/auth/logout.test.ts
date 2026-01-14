import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals"

// Set environment variables before any module loading
process.env.REDIS_URL = "redis://localhost:6379"

const mockDelete = jest.fn()

// Use unstable_mockModule for ESM
jest.unstable_mockModule("@/common/key-value-store/RedisKeyValueStore", () => ({
  default: jest.fn().mockImplementation(() => ({})),
}))

jest.unstable_mockModule("@/features/mcp/data", () => ({
  RedisMCPSessionStore: jest.fn().mockImplementation(() => ({
    delete: mockDelete,
  })),
}))

describe("POST /api/cli/auth/logout", () => {
  let POST: (req: Request) => Promise<Response>

  beforeAll(async () => {
    const routeModule = await import("@/app/api/cli/auth/logout/route")
    POST = routeModule.POST
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deletes session and returns success", async () => {
    mockDelete.mockResolvedValue(undefined)

    const request = new Request("http://localhost/api/cli/auth/logout", {
      method: "POST",
      headers: { Authorization: "Bearer session-uuid" },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ success: true })
    expect(mockDelete).toHaveBeenCalledWith("session-uuid")
  })

  it("returns 401 when no authorization header", async () => {
    const request = new Request("http://localhost/api/cli/auth/logout", {
      method: "POST",
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it("returns 401 when authorization header is not Bearer token", async () => {
    const request = new Request("http://localhost/api/cli/auth/logout", {
      method: "POST",
      headers: { Authorization: "Basic some-credentials" },
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
