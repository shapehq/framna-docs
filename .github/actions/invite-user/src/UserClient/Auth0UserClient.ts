import axios from "axios"
import { ManagementClient } from "auth0"
import IUserClient, { User, Role } from "./IUserClient"

export interface Auth0UserClientConfig {
  domain: string
  clientId: string
  clientSecret: string
}

export default class Auth0UserClient implements IUserClient {
  private readonly config: Auth0UserClientConfig
  private readonly managementClient: ManagementClient
  
  constructor(config: Auth0UserClientConfig) {
    this.config = config
    this.managementClient = new ManagementClient({
      domain: config.domain,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    })
  }
  
  async getUser(request: { email: string }): Promise<User | null> {
    const response = await this.managementClient.usersByEmail.getByEmail({
      email: request.email
    })
    if (response.data.length == 0) {
      return null
    }
    const user = response.data[0]
    return {
      id: user.user_id,
      email: user.email
    }
  }
  
  async createUser(request: { name: string, email: string, password: string }): Promise<User> {
    const response = await this.managementClient.users.create({
      connection: "Username-Password-Authentication",
      name: request.name,
      email: request.email,
      email_verified: true,
      password: request.password,
      app_metadata: {
        has_pending_invitation: true
      }
    })
    return {
      id: response.data.user_id,
      email: response.data.email
    }
  }
  
  async createRoles(request: { roleNames: string[] }): Promise<Role[]> {
    const allRolesResponse = await this.managementClient.roles.getAll()
    const allRoles = allRolesResponse.data
    const existingRoles = allRoles.filter((role: Role) => {
      return request.roleNames.includes(role.name)
    }).map(role => {
      return { id: role.id, name: role.name }
    })
    const roleNamesToAdd = request.roleNames.filter(roleName => {
      const existingRole = existingRoles.find(role => {
        return role.name == roleName
      })
      return existingRole == null
    })
    const responses = await Promise.all(roleNamesToAdd.map(roleName => {
      return this.managementClient.roles.create({ name: roleName })
    }))
    const addedRoles = responses.map(response => {
      return {
        id: response.data.id,
        name: response.data.name
      }
    })
    return existingRoles.concat(addedRoles)
  }
  
  async assignRolesToUser(request: { userID: string, roleIDs: string[] }): Promise<void> {
    await this.managementClient.users.assignRoles({
      id: request.userID
    }, {
      roles: request.roleIDs
    })
  }
  
  async sendChangePasswordEmail(request: { email: string }): Promise<void> {
    const token = await this.getToken()
    await axios.post(this.getURL("/dbconnections/change_password"), {
      email: request.email,
      connection: "Username-Password-Authentication"
    }, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
  }
  
  private async getToken(): Promise<string> {
    const response = await axios.post(this.getURL("/oauth/token"), {
      "grant_type": "client_credentials",
      "client_id": this.config.clientId,
      "client_secret": this.config.clientSecret,
      "audience": `https://${this.config.domain}/api/v2/`
    }, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    return response.data.access_token
  }
  
  private getURL(path: string): string {
    return `https://${this.config.domain}${path}`
  }
}
