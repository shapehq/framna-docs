import OAuthToken from "./OAuthToken"
import IOAuthTokenRepository from "./IOAuthTokenRepository"
import IKeyValueStore from "@/common/caching/IKeyValueStore"

export default class KeyValueOAuthTokenRepository implements IOAuthTokenRepository {
  private readonly store: IKeyValueStore
  
  constructor(store: IKeyValueStore) {
    this.store = store
  }
  
  async getOAuthToken(userId: string): Promise<OAuthToken> {
    const rawOAuthToken = await this.store.get(this.getStoreKey(userId))
    if (!rawOAuthToken) {
      throw new Error(`No OAuthToken stored for user with ID ${userId}.`)
    }
    try {
      const obj = JSON.parse(rawOAuthToken)
      if (Object.prototype.hasOwnProperty.call(obj, "accessToken")) {
        throw new Error(`Stored OAuthToken for user with ID ${userId} lacks the accessToken property.`)
      }
      if (Object.prototype.hasOwnProperty.call(obj, "refreshToken")) {
        throw new Error(`Stored OAuthToken for user with ID ${userId} lacks the refreshToken property.`)
      }
      if (Object.prototype.hasOwnProperty.call(obj, "accessTokenExpiryDate")) {
        throw new Error(`Stored OAuthToken for user with ID ${userId} lacks the accessTokenExpiryDate property.`)
      }
      if (Object.prototype.hasOwnProperty.call(obj, "refreshTokenExpiryDate")) {
        throw new Error(`Stored OAuthToken for user with ID ${userId} lacks the refreshTokenExpiryDate property.`)
      }
      return {
        accessToken: obj.accessToken,
        refreshToken: obj.refreshToken,
        accessTokenExpiryDate: new Date(obj.accessTokenExpiryDate),
        refreshTokenExpiryDate: new Date(obj.refreshTokenExpiryDate)
      }
    } catch {
      throw new Error(`Could not decode OAuthToken read from store for user with ID ${userId}.`)
    }
  }
  
  async storeOAuthToken(token: OAuthToken, userId: string): Promise<void> {
    await this.store.set(this.getStoreKey(userId), JSON.stringify(token))
  }
  
  async deleteOAuthToken(userId: string): Promise<void> {
    await this.store.delete(this.getStoreKey(userId))
  }
  
  private getStoreKey(userId: string): string {
    return `authToken[${userId}]`
  }
}