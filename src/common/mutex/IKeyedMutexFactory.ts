import IMutex from "./IMutex"

export default interface IKeyedMutexFactory {
  makeMutex(key: string): IMutex
}
