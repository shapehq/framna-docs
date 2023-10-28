export default interface IMutex {
  acquire(): Promise<void>
  release(): Promise<void>
}
