export default interface IUserDataRepository<T> {
  get(userId: string): Promise<T | null>
  set(userId: string, value: T): Promise<void>
  delete(userId: string): Promise<void>
}
