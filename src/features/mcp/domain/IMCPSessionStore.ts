import { MCPSession } from "./MCPSession"

export interface IMCPSessionStore {
  get(sessionId: string): Promise<MCPSession | null>
  set(session: MCPSession): Promise<void>
  delete(sessionId: string): Promise<void>
  createPendingSession(deviceCode: string): Promise<string>
  getPendingSession(deviceCode: string): Promise<string | null>
  completePendingSession(deviceCode: string, session: MCPSession): Promise<void>
}
