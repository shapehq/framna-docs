export default interface ISession {
  getIsAuthenticated(): Promise<boolean>
  getUserId(): Promise<string>
}
