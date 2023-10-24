import OAuthToken from "./OAuthToken"

export default class OAuthTokenCoder {
  static encode(token: OAuthToken): string {
    return JSON.stringify(token)
  }
  
  static decode(string: string): OAuthToken {
    /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
    let obj: any | undefined
    try {
      obj = JSON.parse(string)
    } catch(error) {
      throw new Error(`Could not decode OAuthToken read from store.`)
    }
    if (!obj.accessToken) {
      throw new Error(`Stored OAuthToken lacks the accessToken property.`)
    }
    if (!obj.refreshToken) {
      throw new Error(`Stored OAuthToken lacks the refreshToken property.`)
    }
    if (!obj.accessTokenExpiryDate) {
      throw new Error(`Stored OAuthToken lacks the accessTokenExpiryDate property.`)
    }
    if (!obj.refreshTokenExpiryDate) {
      throw new Error(`Stored OAuthToken lacks the refreshTokenExpiryDate property.`)
    }
    const accessTokenExpiryDate = new Date(obj.accessTokenExpiryDate)
    const refreshTokenExpiryDate = new Date(obj.refreshTokenExpiryDate)
    if (!isValidDate(accessTokenExpiryDate)) {
      throw new Error(`Stored OAuthToken has an accessTokenExpiryDate property but it contains an invalid date.`)
    }
    if (!isValidDate(refreshTokenExpiryDate)) {
      throw new Error(`Stored OAuthToken has an refreshTokenExpiryDate property but it contains an invalid date.`)
    }
    return {
      accessToken: obj.accessToken,
      refreshToken: obj.refreshToken,
      accessTokenExpiryDate: accessTokenExpiryDate,
      refreshTokenExpiryDate: refreshTokenExpiryDate
    }
  }
}

function isValidDate(date: Date) {
  return date instanceof Date && !isNaN((date as unknown) as number)
}
