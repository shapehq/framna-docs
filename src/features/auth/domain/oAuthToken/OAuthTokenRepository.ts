import { IDB, UnauthorizedError } from "../../../../common"
import { IOAuthTokenRepository, OAuthToken } from "."

export default class OAuthTokenRepository implements IOAuthTokenRepository {
  private readonly provider: string
  private readonly db: IDB
  
  constructor(config: { provider: string, db: IDB }) {
    this.provider = config.provider
    this.db = config.db
  }
  
  async get(userId: string): Promise<OAuthToken> {
    const query = `
    SELECT 
        access_tokens.access_token, 
        access_tokens.refresh_token
    FROM 
        accounts
    INNER JOIN 
        access_tokens ON access_tokens.provider_account_id = accounts."providerAccountId"
    WHERE 
        access_tokens.provider = $1 
        AND accounts."userId" = $2;
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
    INSERT INTO access_tokens (
      provider,
      provider_account_id,
      access_token,
      refresh_token
    )
    SELECT
      $2,
      "providerAccountId",
      $3,
      $4
    FROM
      accounts
    WHERE
      accounts."userId" = $1
    ON CONFLICT (provider, provider_account_id)
    DO UPDATE SET access_token = excluded.access_token, refresh_token = excluded.refresh_token, last_updated_at = NOW();
    `
    try {
      await this.db.query(query, [userId, this.provider, token.accessToken, token.refreshToken])
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  
  async delete(userId: string): Promise<void> {
    await this.db.query("DELETE FROM access_tokens WHERE user_id = $1", [userId])
  }
}
