import OAuthToken, { OAuthTokenSchema } from "./OAuthToken"

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
    return OAuthTokenSchema.parse(obj)
  }
}
