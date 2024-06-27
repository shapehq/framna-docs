export interface IUser {
  readonly id?: string
  readonly email?: string | null
}

export interface IAccount {
  readonly provider: string
  readonly providerAccountId: string
  readonly access_token?: string
  readonly refresh_token?: string
}

export default interface ILogInHandler {
  handleLogIn(params: { user: IUser, account: IAccount | null }): Promise<boolean | string>
}
