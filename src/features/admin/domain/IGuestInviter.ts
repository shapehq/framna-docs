export interface IGuestInviter {
    inviteGuestByEmail: (email: string) => Promise<void>
}
