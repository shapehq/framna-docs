export default interface ILogInHandler {
  handleLogIn(userId: string): Promise<void>
}
