export type AccountProviderType = "github" | "email"

export default interface ISession {
  getIsAuthenticated(): Promise<boolean>
  getUserId(): Promise<string>
  getAccountProviderType(): Promise<AccountProviderType>
}
