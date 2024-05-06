export default interface IGuestInviter {
  inviteGuestByEmail: (email: string) => Promise<void>
}
