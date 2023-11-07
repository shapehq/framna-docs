export default interface ISessionValidator {
  validateSession(): Promise<boolean>
}
