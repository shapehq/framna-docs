import { UserDetails } from './UserDetails'

export interface UserDetailsProviding {
  getUserDetails(): Promise<UserDetails>
}
