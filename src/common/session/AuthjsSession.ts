import { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"
import { UnauthorizedError } from "../../common"

export default class AuthjsSession {
  private readonly authOptions: NextAuthOptions
  
  constructor(config: { authOptions: NextAuthOptions }) {
    this.authOptions = config.authOptions
  }
  
  async getIsAuthenticated(): Promise<boolean> {
    const session = await getServerSession(this.authOptions)
    return session != null
  }
  
  async getUserId(): Promise<string> {
    const session = await getServerSession(this.authOptions)
    if (!session || !session.user || !session.user.id) {
      throw new UnauthorizedError("User ID is unavailable because the user is not authenticated.")
    }
    return session.user.id
  }
  
  async getIsGuest(): Promise<boolean> {
    return false
  }
}
