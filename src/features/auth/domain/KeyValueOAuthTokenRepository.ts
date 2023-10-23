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
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    let obj: any | undefined
    try {
      obj = JSON.parse(rawOAuthToken)
    } catch(error) {
      throw new Error(`Could not decode OAuthToken read from store for user with ID ${userId}.`)
    }
    if (!obj.accessToken) {
      throw new Error(`Stored OAuthToken for user with ID ${userId} lacks the accessToken property.`)
    }
    if (!obj.refreshToken) {
      throw new Error(`Stored OAuthToken for user with ID ${userId} lacks the refreshToken property.`)
    }
    if (!obj.accessTokenExpiryDate) {
      throw new Error(`Stored OAuthToken for user with ID ${userId} lacks the accessTokenExpiryDate property.`)
    }
    if (!obj.refreshTokenExpiryDate) {
      throw new Error(`Stored OAuthToken for user with ID ${userId} lacks the refreshTokenExpiryDate property.`)
    }
    const accessTokenExpiryDate = new Date(obj.accessTokenExpiryDate)
    const refreshTokenExpiryDate = new Date(obj.refreshTokenExpiryDate)
    if (!isValidDate(accessTokenExpiryDate)) {
      throw new Error(`Stored OAuthToken for user with ID ${userId} has an accessTokenExpiryDate property but it contains an invalid date.`)
    }
    if (!isValidDate(refreshTokenExpiryDate)) {
      throw new Error(`Stored OAuthToken for user with ID ${userId} has an refreshTokenExpiryDate property but it contains an invalid date.`)
    }
    return {
      accessToken: obj.accessToken,
      refreshToken: obj.refreshToken,
      accessTokenExpiryDate: accessTokenExpiryDate,
      refreshTokenExpiryDate: refreshTokenExpiryDate
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

function isValidDate(date: Date) {
  return date instanceof Date && !isNaN((date as unknown) as number)
}
