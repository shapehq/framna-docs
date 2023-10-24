export default interface IKeyValueStore {
  get(key: string): Promise<string | null>
  set(key: string, data: string | number | Buffer): Promise<void>
  delete(key: string): Promise<void>
}
