export type User = {
  readonly id: string
  readonly email: string
}

export type Role = {
  readonly id: string
  readonly name: string
}

export default interface IUserClient {
  getUser(request: { email: string }): Promise<User | null>
  createUser(request: { name: string, email: string, password: string }): Promise<User>
  createRoles(request: { roleNames: string[] }): Promise<Role[]>
  assignRolesToUser(request: { userID: string, roleIDs: string[] }): Promise<void>
  sendChangePasswordEmail(request: { email: string }): Promise<void>
}
