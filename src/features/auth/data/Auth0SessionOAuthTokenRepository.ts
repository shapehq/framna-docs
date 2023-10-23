import { getSession } from "@auth0/nextjs-auth0"
import OAuthToken from "../domain/OAuthToken"
import IOAuthTokenRepository from "../domain/IOAuthTokenRepository"
import ISessionOAuthTokenRepository from "../domain/ISessionOAuthTokenRepository"

export default class Auth0ISessionOAuthTokenRepository implements ISessionOAuthTokenRepository {
  private readonly oAuthTokenRepository: IOAuthTokenRepository
  
  constructor(oAuthTokenRepository: IOAuthTokenRepository) {
    this.oAuthTokenRepository = oAuthTokenRepository
  }
  
  async getOAuthToken(): Promise<OAuthToken> {
    const session = await getSession()
    if (!session) {
      throw new Error("Could not get the OAuth token because the user is not authenticated.")
    }
    return await this.oAuthTokenRepository.getOAuthToken(session.user.sub)
  }
  
  async storeOAuthToken(token: OAuthToken): Promise<void> {
    const session = await getSession()
    if (!session) {
      throw new Error("Could not store the OAuth token because the user is not authenticated.")
    }
    return await this.oAuthTokenRepository.storeOAuthToken(token, session.user.sub)
  }
  
  async deleteOAuthToken(): Promise<void> {
    const session = await getSession()
    if (!session) {
      throw new Error("Could not delete the OAuth token because the user is not authenticated.")
    }
    return await this.oAuthTokenRepository.deleteOAuthToken(session.user.sub)
  }
}
