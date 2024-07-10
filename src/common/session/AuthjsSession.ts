import { NextAuthResult } from "next-auth"
import { UnauthorizedError } from "@/common"
import ISession from "./ISession"

export default class AuthjsSession implements ISession {
  private readonly auth: NextAuthResult
  
  constructor(config: { auth: NextAuthResult }) {
    this.auth = config.auth
  }
  
  async getIsAuthenticated(): Promise<boolean> {
    const { auth } = this.auth
    const session = await auth()
    return session != null
  }
  
  async getUserId(): Promise<string> {
    const { auth } = this.auth
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      throw new UnauthorizedError("User ID is unavailable because the user is not authenticated.")
    }
    return session.user.id
  }
}
