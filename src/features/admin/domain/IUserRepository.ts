import User from "./User"

export default interface IUserRepository {
  findByEmail(email: string): Promise<User | undefined>
}
