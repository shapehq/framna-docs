import { IUser } from './IUser'
import { IUserProvider } from './IUserProvider'
import { getSession } from '@auth0/nextjs-auth0'

export class Auth0UserProvider implements IUserProvider {
  async getUser(): Promise<IUser> {
    const session = await getSession()
    const user = session?.user
    if (!user) {
      throw new Error("User is not authenticated")
    }
    return {
      id: user.sub,
      name: user.name,
      userName: user.nickname,
      avatarURL: user.picture
    }
  }
}
