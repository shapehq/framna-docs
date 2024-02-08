import { IDB, UnauthorizedError } from "../../../common"
import { IOAuthTokenRepository, OAuthToken } from "../domain"

type AuthjsOAuthTokenRepositoryConfig = {
  readonly db: IDB
  readonly provider: string
}

export default class AuthjsOAuthTokenRepository implements IOAuthTokenRepository {
  private readonly db: IDB
  private readonly provider: string
  
  constructor(config: AuthjsOAuthTokenRepositoryConfig) {
    this.db = config.db
    this.provider = config.provider
  }
  
  async get(userId: string): Promise<OAuthToken> {
    const result = await this.db.query(
      "SELECT access_token, refresh_token FROM accounts WHERE \"userId\" = $1 AND provider = $2",
      [userId, this.provider]
    )
    if (result.rows.length == 0) {
      throw new UnauthorizedError("The access token was not found. It appears that the user is not authenticated.")
    }
    const accessToken = result.rows[0].access_token
    const refreshToken = result.rows[0].refresh_token
    if (!accessToken || !refreshToken) {
      throw new UnauthorizedError("")
    }
    return { accessToken, refreshToken }
  }
  
  async set(_userId: string, _token: OAuthToken): Promise<void> {
    throw new Error("Not implemented. We do not support modifying data owned by Auth.js. Use our access_tokens table instead.")
  }
  
  async delete(_userId: string): Promise<void> {
    throw new Error("Not implemented. We do not support modifying data owned by Auth.js. Use our access_tokens table instead.")
  }
}
