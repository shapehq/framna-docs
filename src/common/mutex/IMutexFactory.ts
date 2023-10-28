export default interface IMutexFactory {
  withMutex<T>(key: string, f: () => Promise<T>): Promise<T>
}
