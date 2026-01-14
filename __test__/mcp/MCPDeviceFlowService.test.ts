import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { MCPDeviceFlowService } from "@/features/mcp/domain/MCPDeviceFlowService"
import { IMCPSessionStore } from "@/features/mcp/domain"

describe("MCPDeviceFlowService", () => {
  let service: MCPDeviceFlowService
  let mockSessionStore: jest.Mocked<IMCPSessionStore>

  beforeEach(() => {
    mockSessionStore = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      createPendingSession: jest.fn(),
      getPendingSession: jest.fn(),
      completePendingSession: jest.fn(),
    }
    service = new MCPDeviceFlowService({
      sessionStore: mockSessionStore,
      clientId: "test-client-id",
    })
  })

  describe("getSessionToken", () => {
    it("returns null when no session ID provided", async () => {
      const result = await service.getSessionToken(undefined)
      expect(result).toBeNull()
    })

    it("returns session when valid session ID provided", async () => {
      const session = {
        sessionId: "test-session-id",
        accessToken: "gho_xxx",
        createdAt: new Date().toISOString(),
      }
      mockSessionStore.get.mockResolvedValue(session)

      const result = await service.getSessionToken("test-session-id")

      expect(result).toEqual(session)
    })
  })
})
