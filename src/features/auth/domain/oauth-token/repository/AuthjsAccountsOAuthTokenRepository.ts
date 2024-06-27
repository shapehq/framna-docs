import { IDB, UnauthorizedError } from "@/common"
import { IOAuthTokenRepository, OAuthToken } from ".."

export default class AuthjsAccountsOAuthTokenRepository implements IOAuthTokenRepository {
  private readonly db: IDB
  private readonly provider: string
  
  constructor(config: { db: IDB, provider: string }) {
    this.db = config.db
    this.provider = config.provider
  }
  
  async get(userId: string): Promise<OAuthToken> {
    const query = `
    SELECT 
      access_token, 
      refresh_token
    FROM 
      accounts
    WHERE 
      provider = $1 AND \"userId\" = $2;
    `
    const result = await this.db.query(query, [this.provider, userId])
    if (result.rows.length == 0) {
      throw new UnauthorizedError("The access token was not found. It appears that the user is not authenticated.")
    }
    const row = result.rows[0]
    const accessToken = row.access_token
    const refreshToken = row.refresh_token
    return { accessToken, refreshToken }
  }
  
  async set(_userId: string, _token: OAuthToken): Promise<void> {}
  
  async delete(_userId: string): Promise<void> {}
}
