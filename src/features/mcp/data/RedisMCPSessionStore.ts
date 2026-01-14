import IKeyValueStore from "@/common/key-value-store/IKeyValueStore"
import { IMCPSessionStore, MCPSession, MCPSessionSchema } from "../domain"
import { randomUUID } from "crypto"

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days
const PENDING_TTL_SECONDS = 15 * 60 // 15 minutes (GitHub device code expiry)

interface RedisMCPSessionStoreConfig {
  store: IKeyValueStore
}

export class RedisMCPSessionStore implements IMCPSessionStore {
  private store: IKeyValueStore

  constructor(config: RedisMCPSessionStoreConfig) {
    this.store = config.store
  }

  async get(sessionId: string): Promise<MCPSession | null> {
    const data = await this.store.get(`mcp:session:${sessionId}`)
    if (!data) return null
    return MCPSessionSchema.parse(JSON.parse(data))
  }

  async set(session: MCPSession): Promise<void> {
    await this.store.setExpiring(
      `mcp:session:${session.sessionId}`,
      JSON.stringify(session),
      SESSION_TTL_SECONDS
    )
  }

  async delete(sessionId: string): Promise<void> {
    await this.store.delete(`mcp:session:${sessionId}`)
  }

  async createPendingSession(deviceCode: string): Promise<string> {
    const sessionId = randomUUID()
    await this.store.setExpiring(
      `mcp:pending:${deviceCode}`,
      sessionId,
      PENDING_TTL_SECONDS
    )
    return sessionId
  }

  async getPendingSession(deviceCode: string): Promise<string | null> {
    return await this.store.get(`mcp:pending:${deviceCode}`)
  }

  async completePendingSession(deviceCode: string, session: MCPSession): Promise<void> {
    await this.set(session)
    await this.store.delete(`mcp:pending:${deviceCode}`)
  }
}
