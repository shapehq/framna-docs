import { IDB } from "@/common"
import { User, IUserRepository } from "../domain"

type UserRow = {
  readonly id: number
  readonly name: string | null
  readonly email: string | null
  readonly image: string | null
  readonly account_provider: string | null
}

export default class DbUserRepository implements IUserRepository {
  private readonly db: IDB

  constructor(config: { db: IDB }) {
    this.db = config.db
  }
    
  async findByEmail(email: string): Promise<User | undefined> {
    const sql = `
    SELECT u.id, u.name, u.email, u.image, a.provider as account_provider
    FROM users u
    LEFT JOIN accounts a ON u.id = a."userId"
    WHERE u.email = $1
    `
    const result = await this.db.query<UserRow>(sql, [email])
    const users = this.groupUserRows(result.rows)
    if (users.length == 0) {
      return undefined
    }
    return users[0]
  }
  
  private groupUserRows(rows: UserRow[]): User[] {
    const userMap = new Map<number, User>()
    for (const row of rows) {
      let user = userMap.get(row.id)
      if (!user) {
        user = {
          id: row.id,
          name: row.name,
          email: row.email,
          image: row.image,
          accounts: []
        }
        userMap.set(row.id, user)
      }
      if (row.account_provider) {
        user.accounts.push({ provider: row.account_provider })
      }
    }
    return Array.from(userMap.values())
  }
}