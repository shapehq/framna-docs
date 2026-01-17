import { jest, describe, it, expect, beforeAll } from "@jest/globals"

// Set environment variables before any module loading
process.env.REDIS_URL = "redis://localhost:6379"
process.env.GITHUB_CLIENT_ID = "test-client-id"
process.env.GITHUB_CLIENT_SECRET = "test-client-secret"

const mockInitiateDeviceFlow = jest.fn().mockResolvedValue({
  userCode: "ABCD-1234",
  verificationUri: "https://github.com/login/device",
  deviceCode: "device123",
  sessionId: "session-uuid",
  expiresIn: 899,
  interval: 5,
})

// Use unstable_mockModule for ESM
jest.unstable_mockModule("@/common/key-value-store/RedisKeyValueStore", () => ({
  default: jest.fn().mockImplementation(() => ({})),
}))

jest.unstable_mockModule("@/features/cli/data", () => ({
  RedisCLISessionStore: jest.fn().mockImplementation(() => ({})),
}))

jest.unstable_mockModule("@/features/cli/domain", () => ({
  CLIDeviceFlowService: jest.fn().mockImplementation(() => ({
    initiateDeviceFlow: mockInitiateDeviceFlow,
  })),
}))

describe("POST /api/cli/auth/device", () => {
  let POST: (req: Request) => Promise<Response>

  beforeAll(async () => {
    const routeModule = await import("@/app/api/cli/auth/device/route")
    POST = routeModule.POST
  })

  it("returns device flow details for authentication", async () => {
    const request = new Request("http://localhost/api/cli/auth/device", {
      method: "POST",
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      userCode: "ABCD-1234",
      verificationUri: "https://github.com/login/device",
      deviceCode: "device123",
      sessionId: "session-uuid",
      expiresIn: 899,
      interval: 5,
    })
  })
})
