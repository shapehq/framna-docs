import { getSession } from "@auth0/nextjs-auth0"
import ISession from "./ISession"
import { UnauthorizedError } from "@/features/auth/domain/AuthError"

export default class Auth0Session implements ISession {
  async getUserId(): Promise<string> {
    const session = await getSession()
    if (!session) {
      throw new UnauthorizedError("User ID is unavailable because the user is not authenticated.")
    }
    return session.user.sub
  }
}