export default interface ICredentialsTransferrer {
  transferCredentials(userId: string): Promise<void>
}
