import { IUserDetails } from './IUserDetails'

export interface IUserDetailsProvider {
  getUserDetails(): Promise<IUserDetails>
}
