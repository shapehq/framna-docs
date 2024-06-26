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

export interface IEmail {
  readonly verificationRequest?: boolean
}

export default interface ILogInHandler {
  handleLogIn(user: IUser, account: IAccount | null, email?: IEmail): Promise<boolean | string>
}
