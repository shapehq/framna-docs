import { IDB, UnauthorizedError } from "../../../common"
import { OAuthToken, IOAuthTokenDataSource } from "../domain"

export default class AuthjsOAuthTokenDataSource implements IOAuthTokenDataSource {
  private readonly db: IDB
  private readonly provider: string
  
  constructor(config: { db: IDB, provider: string }) {
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
}
