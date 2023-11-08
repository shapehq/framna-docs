export default interface IIsUserGuestReader {
  getIsUserGuest(userId: string): Promise<boolean>
}