import IIsUserGuestReader from "./IIsUserGuestReader"

export default class IsUserGuestReader implements IIsUserGuestReader {  
  constructor() {}
  
  async getIsUserGuest(userId: string): Promise<boolean> {
    return false
  }
}
