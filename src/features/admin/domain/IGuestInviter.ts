export interface IGuestInviter {
    inviteGuest: (invitee: string) => Promise<void>
}
