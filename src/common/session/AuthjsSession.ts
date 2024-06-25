import { NextAuthResult } from "next-auth"
import { IDB, UnauthorizedError } from "@/common"
import ISession, { AccountProvider } from "./ISession"

export default class AuthjsSession implements ISession {
  private readonly db: IDB
  private readonly auth: NextAuthResult
  private accountProvider: AccountProvider | undefined
  
  constructor(config: { db: IDB, auth: NextAuthResult }) {
    this.db = config.db
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
  
  async getEmail(): Promise<string> {
    const { auth } = this.auth
    const session = await auth()
    if (!session || !session.user || !session.user.email) {
      throw new UnauthorizedError("User's email is unavailable because the user is not authenticated.")
    }
    return session.user.email
  }
  
  async getAccountProvider(): Promise<AccountProvider> {
    if (this.accountProvider) {
      return this.accountProvider
    }
    const accountProvider = await this.readAccountProviderFromDB()
    this.accountProvider = accountProvider
    return accountProvider
  }
  
  private async readAccountProviderFromDB(): Promise<AccountProvider> {
    const userId = await this.getUserId()
    const result = await this.db.query(
      "SELECT true FROM accounts WHERE \"userId\" = $1 AND provider = $2 LIMIT 1",
      [userId, "github"]
    )
    if (result.rows.length > 0) {
      return "github"
    } else {
      return "email"
    }
  }
}
