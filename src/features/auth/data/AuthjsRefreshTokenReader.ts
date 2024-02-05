import { UnauthorizedError } from "@/common"

export default class AuthjsRefreshTokenReader {
  constructor() {}
  
  async getRefreshToken(userId: string): Promise<string> {
    // const userResponse = await this.managementClient.users.get({ id: userId })
    // const identity = userResponse.data.identities.find(identity => {
    //   return identity.connection.toLowerCase() == this.connection.toLowerCase()
    // })
    // if (!identity) {
    //   throw new UnauthorizedError(`No identity found for connection "${this.connection}"`)
    // }
    // return identity.refresh_token
    throw new UnauthorizedError("Not implemented")
  }
}
