export type AccountProviderType = "github" | "email"

export default interface ISession {
  getIsAuthenticated(): Promise<boolean>
  getUserId(): Promise<string>
  getEmail(): Promise<string>
  getAccountProviderType(): Promise<AccountProviderType>
}
