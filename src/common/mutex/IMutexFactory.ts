import IMutex from "./IMutex"

export default interface IMutexFactory {
  makeMutex(): Promise<IMutex>
}
