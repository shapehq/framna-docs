import IMutex from "./IMutex"

export default interface IMutexFactory {
  makeMutex(key: string): IMutex
}
