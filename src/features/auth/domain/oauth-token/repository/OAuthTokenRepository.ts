import { IDB, UnauthorizedError } from "@/common"
import { IOAuthTokenRepository, OAuthToken } from ".."

export default class OAuthTokenRepository implements IOAuthTokenRepository {
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
      oauth_tokens
    WHERE 
      provider = $1 AND user_id = $2;
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
  
  async set(userId: string, token: OAuthToken): Promise<void> {
    const query = `
    INSERT INTO oauth_tokens (
      provider,
      user_id,
      access_token,
      refresh_token
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, provider)
    DO UPDATE SET access_token = $3, refresh_token = $4, last_updated_at = NOW();
    `
    try {
      await this.db.query(query, [this.provider, userId, token.accessToken, token.refreshToken])
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  
  async delete(userId: string): Promise<void> {
    const query = `DELETE FROM oauth_tokens WHERE provider = $1 AND user_id = $2`
    await this.db.query(query, [this.provider, userId])
  }
}
