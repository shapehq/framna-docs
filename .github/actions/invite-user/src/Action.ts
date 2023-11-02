import IStateStore from "./StateStore/IStateStore"
import ILogger from "./Logger/ILogger"
import IUserClient from "./UserClient/IUserClient"
import IPasswordGenerator from "./PasswordGenerator/IPasswordGenerator"
import IRoleNameParser from "./RoleNameParser/IRoleNameParser"

export interface ActionOptions {
  readonly name: string
  readonly email: string
  readonly roles: string
}

export interface ActionConfig {
  readonly stateStore: IStateStore
  readonly logger: ILogger
  readonly userClient: IUserClient
  readonly passwordGenerator: IPasswordGenerator
  readonly roleNameParser: IRoleNameParser
}

export default class Action {
  private readonly stateStore: IStateStore
  private readonly logger: ILogger
  private readonly userClient: IUserClient
  private readonly passwordGenerator: IPasswordGenerator
  private readonly roleNameParser: IRoleNameParser
  
  constructor(config: ActionConfig) {
    this.stateStore = config.stateStore
    this.logger = config.logger
    this.userClient = config.userClient
    this.passwordGenerator = config.passwordGenerator
    this.roleNameParser = config.roleNameParser
  }

  async run(options: ActionOptions) {
    if (!this.stateStore.isPost) {
      await this.runMain(options)
      this.stateStore.isPost = true
    }
  }
  
  private async runMain(options: ActionOptions) {
    if (!options.name || options.name.length == 0) {
      throw new Error("No name supplied.")
    }
    if (!options.email || options.email.length == 0) {
      throw new Error("No e-mail supplied.")
    }
    if (!options.roles || options.roles.length == 0) {
      throw new Error("No roles supplied.")
    }
    const roleNames = this.roleNameParser.parse(options.roles)
    if (roleNames.length == 0) {
      throw new Error("No roles supplied.")
    }
    const existingUser = await this.userClient.getUser({ email: options.email })
    let user = existingUser
    if (!existingUser) {
      const password = this.passwordGenerator.generatePassword()
      const newUser = await this.userClient.createUser({
        name: options.name,
        email: options.email,
        password: password
      })
      user = newUser
    }
    if (!user) {
      throw new Error("Could not get an existing user or create a new user.")
    }
    const roles = await this.userClient.createRoles({ roleNames })
    if (roles.length == 0) {
      throw new Error("Received an empty set of roles.")
    }
    const roleIDs = roles.map(e => e.id)
    await this.userClient.assignRolesToUser({
      userID: user.id,
      roleIDs: roleIDs
    })
    if (!existingUser) {
      await this.userClient.sendChangePasswordEmail({ email: user.email })
      this.logger.log(`${options.name} (${user.email}) has been invited.`)
    } else {
      this.logger.log(`${options.name} (${user.email}) has been updated.`)
    }
  }
}
