import { IDB } from "@/common"

interface IGuestRepository {
  getProjectsForEmail(email: string): Promise<string[]>
}

export default class GuestRepositoryAccessDataSource {
  private readonly db: IDB
  private readonly guestRepository: IGuestRepository
  
  constructor(config: { db: IDB, guestRepository: IGuestRepository }) {
    this.db = config.db
    this.guestRepository = config.guestRepository
  }
  
  async getRepositoryNames(userId: string): Promise<string[]> {
    const query = `SELECT email FROM users where id = $1`
    const results = await this.db.query(query, [userId])
    if (results.rows.length == 0) {
      throw new Error("User not found")
    }
    const row = results.rows[0]
    if (!row.email || row.email.length == 0) {
      throw new Error("User does not have an e-mail")
    }
    return await this.guestRepository.getProjectsForEmail(row.email)
  }
}
