import ILogInHandler from "./ILogInHandler"

export interface IMetadataUpdater {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  updateMetadata(userId: string, metadata: {[key: string]: any}): Promise<void>
}

export default class RemoveInvitedFlagLogInHandler implements ILogInHandler {
  private readonly metadataUpdater: IMetadataUpdater
  
  constructor(metadataUpdater: IMetadataUpdater) {
    this.metadataUpdater = metadataUpdater
  }
  
  async handleLogIn(userId: string): Promise<void> {
    await this.metadataUpdater.updateMetadata(userId, {
      has_pending_invitation: false
    })
  }
}
