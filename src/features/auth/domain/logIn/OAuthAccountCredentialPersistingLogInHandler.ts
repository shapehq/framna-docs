import { IDB } from "@/common"
import { ILogInHandler, IAccount } from "."

export default class OAuthAccountCredentialPersistingLogInHandler implements ILogInHandler {
  private readonly db: IDB
  private readonly provider: string
  
  constructor(config: { db: IDB, provider: string }) {
    this.db = config.db
    this.provider = config.provider
  }
  
  async handleLogIn(_userId: string, account?: IAccount): Promise<boolean> {
    if (!account) {
      return true
    }
    if (account.provider !== this.provider) {
      return true
    }
    if (!account.providerAccountId || !account.access_token || !account.refresh_token) {
      return false
    }
    const query = `
    INSERT INTO access_tokens (
      provider,
      provider_account_id,
      access_token,
      refresh_token
    )
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (provider, provider_account_id)
    DO UPDATE SET access_token = $3, refresh_token = $4, last_updated_at = NOW();
    `
    await this.db.query(query, [
      account.provider,
      account.providerAccountId,
      account.access_token,
      account.refresh_token
    ])
    console.log("💾 DID PERSIST")
    return true
  }
}
