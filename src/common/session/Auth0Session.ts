import { getSession } from "@auth0/nextjs-auth0"
import { UnauthorizedError } from "../../common"
import ISession from "./ISession"
import IIsUserGuestReader from "@/features/auth/domain/userIdentityProvider/IsUserGuestReader"

export type Auth0SessionConfig = {
  readonly isUserGuestReader: IIsUserGuestReader
}

export default class Auth0Session implements ISession {
  private readonly isUserGuestReader: IIsUserGuestReader
  
  constructor(config: Auth0SessionConfig) {
    this.isUserGuestReader = config.isUserGuestReader
  }
  
  async getUserId(): Promise<string> {
    const session = await getSession()
    if (!session) {
      throw new UnauthorizedError("User ID is unavailable because the user is not authenticated.")
    }
    return session.user.sub
  }
  
  async getIsGuest(): Promise<boolean> {
    const userId = await this.getUserId()
    return await this.isUserGuestReader.getIsUserGuest(userId)
  }
}
