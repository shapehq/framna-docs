export default interface ISessionDataRepository<T> {
  get(): Promise<T | null>
  set(value: T): Promise<void>
  delete(): Promise<void>
}
