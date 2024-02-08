import { IDB, UnauthorizedError } from "../../../../common"
import { IOAuthTokenRepository, OAuthToken } from "."

type OAuthTokenRepositoryConfig = {
  readonly db: IDB
}

export default class OAuthTokenRepository implements IOAuthTokenRepository {
  private readonly db: IDB
  
  constructor(config: OAuthTokenRepositoryConfig) {
    this.db = config.db
  }
  
  async get(userId: string): Promise<OAuthToken> {
    const query = "SELECT access_token, refresh_token FROM access_tokens WHERE user_id = $1"
    const result = await this.db.query(query, [userId])
    if (result.rows.length == 0) {
      throw new UnauthorizedError("The access token was not found. It appears that the user is not authenticated.")
    }
    const row = result.rows[0]
    const accessToken = row.access_token
    const refreshToken = row.refresh_token
    return { accessToken, refreshToken }
  }
  
  async set(userId: string, token: OAuthToken): Promise<void> {
    const query = `
    INSERT INTO access_tokens (user_id, access_token, refresh_token)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id)
    DO UPDATE SET access_token = $2, refresh_token = $3;`
    await this.db.query(query, [userId, token.accessToken, token.refreshToken])
  }
  
  async delete(userId: string): Promise<void> {
    await this.db.query("DELETE FROM access_tokens WHERE user_id = $1", [userId])
  }
}
