import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals"
import { NextRequest, NextResponse } from "next/server"

// Set environment variables before any module loading
process.env.REDIS_URL = "redis://localhost:6379"

const mockGet = jest.fn()

// Use unstable_mockModule for ESM
jest.unstable_mockModule("@/common/key-value-store/RedisKeyValueStore", () => ({
  default: jest.fn().mockImplementation(() => ({})),
}))

jest.unstable_mockModule("@/features/cli/data/RedisCLISessionStore", () => ({
  RedisCLISessionStore: jest.fn().mockImplementation(() => ({
    get: mockGet,
  })),
}))

describe("CLI middleware", () => {
  let getSessionFromRequest: (request: NextRequest) => string | null
  let withAuth: <T>(
    handler: (request: NextRequest, auth: { session: { sessionId: string; accessToken: string }; sessionStore: unknown }) => Promise<NextResponse<T>>
  ) => (request: NextRequest) => Promise<NextResponse<T | { error: string }>>

  beforeAll(async () => {
    const middlewareModule = await import("@/app/api/cli/middleware")
    getSessionFromRequest = middlewareModule.getSessionFromRequest
    withAuth = middlewareModule.withAuth
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getSessionFromRequest", () => {
    it("extracts session ID from Bearer token", () => {
      const request = new Request("http://localhost/api/cli/test", {
        headers: { Authorization: "Bearer abc123" },
      }) as NextRequest
      expect(getSessionFromRequest(request as NextRequest)).toBe("abc123")
    })

    it("returns null when no auth header", () => {
      const request = new Request("http://localhost/api/cli/test") as NextRequest
      expect(getSessionFromRequest(request as NextRequest)).toBeNull()
    })
  })

  describe("withAuth", () => {
    it("returns 401 when no session ID", async () => {
      const handler = jest.fn()
      const wrappedHandler = withAuth(handler)

      const request = new Request("http://localhost/api/cli/test") as NextRequest
      const response = await wrappedHandler(request as NextRequest)

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it("returns 401 when session not found in Redis", async () => {
      mockGet.mockResolvedValue(null)

      const handler = jest.fn()
      const wrappedHandler = withAuth(handler)

      const request = new Request("http://localhost/api/cli/test", {
        headers: { Authorization: "Bearer invalid-session" },
      }) as NextRequest
      const response = await wrappedHandler(request as NextRequest)

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it("calls handler with auth context when session valid", async () => {
      const mockSession = {
        sessionId: "valid-session",
        accessToken: "github-token",
        createdAt: new Date().toISOString(),
      }
      mockGet.mockResolvedValue(mockSession)

      const handler = jest
        .fn()
        .mockResolvedValue(NextResponse.json({ ok: true }))
      const wrappedHandler = withAuth(handler)

      const request = new Request("http://localhost/api/cli/test", {
        headers: { Authorization: "Bearer valid-session" },
      }) as NextRequest
      const response = await wrappedHandler(request as NextRequest)

      expect(response.status).toBe(200)
      expect(handler).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          session: mockSession,
          sessionStore: expect.any(Object),
        })
      )
    })
  })
})
