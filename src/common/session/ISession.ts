export default interface ISession {
  getUserId(): Promise<string>
  getIsGuest(): Promise<boolean>
}
