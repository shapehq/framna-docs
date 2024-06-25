export type AccountProvider = "github" | "email"

export default interface ISession {
  getIsAuthenticated(): Promise<boolean>
  getUserId(): Promise<string>
  getEmail(): Promise<string>
  getAccountProvider(): Promise<AccountProvider>
}
