import Account from "./Account"

type User = {
  readonly id: number
  readonly name: string | null
  readonly email: string | null
  readonly image: string | null
  readonly accounts: Account[]
}

export default User
