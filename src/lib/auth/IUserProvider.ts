import { IUser } from './IUser'

export interface IUserProvider {
  getUser(): Promise<IUser>
}
