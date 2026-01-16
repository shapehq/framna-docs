import { CLISession } from "./CLISession"

export interface ICLISessionStore {
  get(sessionId: string): Promise<CLISession | null>
  set(session: CLISession): Promise<void>
  delete(sessionId: string): Promise<void>
  createPendingSession(deviceCode: string): Promise<string>
  getPendingSession(deviceCode: string): Promise<string | null>
  completePendingSession(deviceCode: string, session: CLISession): Promise<void>
}
