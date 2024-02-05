import { getServerSession } from "next-auth/next"
import { UnauthorizedError } from "../../common"
import ISession from "./ISession"
import { IIsUserGuestReader } from "@/features/auth/domain"

export type AuthSessionConfig = {
  readonly isUserGuestReader: IIsUserGuestReader
}

export default class AuthjsSession implements ISession {
  private readonly isUserGuestReader: IIsUserGuestReader
  
  constructor(config: AuthSessionConfig) {
    this.isUserGuestReader = config.isUserGuestReader
  }
  
  async getUserId(): Promise<string> {
    const session = await getServerSession()
    if (!session) {
      throw new UnauthorizedError("User ID is unavailable because the user is not authenticated.")
    }
    // return session.user.sub
    return "foo"
  }
  
  async getIsGuest(): Promise<boolean> {
    return false
    // const userId = await this.getUserId()
    // return await this.isUserGuestReader.getIsUserGuest(userId)
  }
}
