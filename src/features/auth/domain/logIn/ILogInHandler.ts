export interface IAccount {
  provider: string
  providerAccountId: string
  access_token?: string
  refresh_token?: string
}

export default interface ILogInHandler {
  handleLogIn(userId: string, account?: IAccount): Promise<boolean>
}
