import IKeyValueStore from "@/common/key-value-store/IKeyValueStore"
import { ICLISessionStore, CLISession, CLISessionSchema } from "../domain"
import { randomUUID } from "crypto"

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days
const PENDING_TTL_SECONDS = 15 * 60 // 15 minutes (GitHub device code expiry)

interface RedisCLISessionStoreConfig {
  store: IKeyValueStore
}

export class RedisCLISessionStore implements ICLISessionStore {
  private store: IKeyValueStore

  constructor(config: RedisCLISessionStoreConfig) {
    this.store = config.store
  }

  async get(sessionId: string): Promise<CLISession | null> {
    const data = await this.store.get(`cli:session:${sessionId}`)
    if (!data) return null
    return CLISessionSchema.parse(JSON.parse(data))
  }

  async set(session: CLISession): Promise<void> {
    await this.store.setExpiring(
      `cli:session:${session.sessionId}`,
      JSON.stringify(session),
      SESSION_TTL_SECONDS
    )
  }

  async delete(sessionId: string): Promise<void> {
    await this.store.delete(`cli:session:${sessionId}`)
  }

  async createPendingSession(deviceCode: string): Promise<string> {
    const sessionId = randomUUID()
    await this.store.setExpiring(
      `cli:pending:${deviceCode}`,
      sessionId,
      PENDING_TTL_SECONDS
    )
    return sessionId
  }

  async getPendingSession(deviceCode: string): Promise<string | null> {
    return await this.store.get(`cli:pending:${deviceCode}`)
  }

  async completePendingSession(deviceCode: string, session: CLISession): Promise<void> {
    await this.set(session)
    await this.store.delete(`cli:pending:${deviceCode}`)
  }
}
