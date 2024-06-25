export interface IAccount {
  readonly provider: string
  readonly providerAccountId: string
  readonly access_token?: string
  readonly refresh_token?: string
}

export default interface ILogInHandler {
  handleLogIn(userId: string, account?: IAccount): Promise<boolean>
}
