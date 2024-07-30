import { Session } from "next-auth"
import { UnauthorizedError } from "@/common"
import ISession from "./ISession"

export default class AuthjsSession implements ISession {
  private readonly auth: () => Promise<Session | null>
  
  constructor(config: { auth: () => Promise<Session | null> }) {
    this.auth = config.auth
  }
  
  async getIsAuthenticated(): Promise<boolean> {
    const session = await this.auth()
    return session != null
  }
  
  async getUserId(): Promise<string> {
    const session = await this.auth()
    if (!session || !session.user || !session.user.id) {
      throw new UnauthorizedError("User ID is unavailable because the user is not authenticated.")
    }
    return session.user.id
  }
}
