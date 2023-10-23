export default interface IRefreshTokenReader {
  getRefreshToken(userId: string): Promise<string>
}
