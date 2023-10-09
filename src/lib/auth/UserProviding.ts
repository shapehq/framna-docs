import { User } from './User'

export interface UserProviding {
  getUser(): Promise<User>
}
