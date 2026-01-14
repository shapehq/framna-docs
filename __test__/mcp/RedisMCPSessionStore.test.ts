import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { RedisMCPSessionStore } from "@/features/mcp/data/RedisMCPSessionStore"
import { MCPSession } from "@/features/mcp/domain"
import IKeyValueStore from "@/common/key-value-store/IKeyValueStore"

describe("RedisMCPSessionStore", () => {
  let store: RedisMCPSessionStore
  let mockKvStore: jest.Mocked<IKeyValueStore>

  beforeEach(() => {
    mockKvStore = {
      get: jest.fn(),
      set: jest.fn(),
      setExpiring: jest.fn(),
      delete: jest.fn(),
    }
    store = new RedisMCPSessionStore({ store: mockKvStore })
  })

  describe("get", () => {
    it("returns null when session not found", async () => {
      mockKvStore.get.mockResolvedValue(null)
      const result = await store.get("non-existent")
      expect(result).toBeNull()
    })

    it("returns session when found", async () => {
      const session: MCPSession = {
        sessionId: "123e4567-e89b-12d3-a456-426614174000",
        accessToken: "gho_xxx",
        createdAt: new Date().toISOString(),
      }
      mockKvStore.get.mockResolvedValue(JSON.stringify(session))

      const result = await store.get(session.sessionId)

      expect(result).toEqual(session)
      expect(mockKvStore.get).toHaveBeenCalledWith("mcp:session:123e4567-e89b-12d3-a456-426614174000")
    })
  })

  describe("set", () => {
    it("stores session with 30 day TTL", async () => {
      const session: MCPSession = {
        sessionId: "123e4567-e89b-12d3-a456-426614174000",
        accessToken: "gho_xxx",
        createdAt: new Date().toISOString(),
      }

      await store.set(session)

      expect(mockKvStore.setExpiring).toHaveBeenCalledWith(
        "mcp:session:123e4567-e89b-12d3-a456-426614174000",
        JSON.stringify(session),
        30 * 24 * 60 * 60 // 30 days in seconds
      )
    })
  })
})
