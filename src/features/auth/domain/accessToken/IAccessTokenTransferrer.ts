export default interface IAccessTokenTransferrer {
  transferAccessToken(): Promise<string>
}
