export default interface IUserDataRepository<T> {
  get(userId: string): Promise<T | null>
  set(userId: string, value: T): Promise<void>
  setExpiring(userId: string, value: T, timeToLive: number): Promise<void>
  delete(userId: string): Promise<void>
}
