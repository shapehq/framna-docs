import { User } from './User'
import { UserProviding } from './UserProviding'
import { getSession } from '@auth0/nextjs-auth0'

export class Auth0UserProvider implements UserProviding {
  async getUser(): Promise<User> {
    const session = await getSession()
    const user = session?.user
    if (!user) {
      throw new Error("User is not authenticated")
    }
    return {
      id: user.sub,
      name: user.name,
      avatarURL: user.picture 
    }
  }
}
