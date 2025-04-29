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

export type HandleLoginParams = {
  readonly user: IUser
  readonly account: IAccount | null | undefined 
}

export default interface ILogInHandler {
  handleLogIn(params: HandleLoginParams): Promise<boolean | string>
}
