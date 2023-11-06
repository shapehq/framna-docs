import { getSession } from "@auth0/nextjs-auth0"
import { UnauthorizedError } from "@/common/errors"
import ISession from "./ISession"

export default class Auth0Session implements ISession {
  async getUserId(): Promise<string> {
    const session = await getSession()
    if (!session) {
      throw new UnauthorizedError("User ID is unavailable because the user is not authenticated.")
    }
    return session.user.sub
  }
}