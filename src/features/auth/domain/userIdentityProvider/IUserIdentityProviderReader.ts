import UserIdentityProvider from "./UserIdentityProvider"

export default interface IUserIdentityProviderReader {
  getUserIdentityProvider(userId: string): Promise<UserIdentityProvider>
}
