export interface IUserDetails {
  readonly identities: {provider: string, accessToken: string}[]
}
