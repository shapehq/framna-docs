import ICredentialsTransferrer from "./ICredentialsTransferrer"

export default class NullObjectCredentialsTransferrer implements ICredentialsTransferrer {
  async transferCredentials(_userId: string): Promise<void> {}
}
