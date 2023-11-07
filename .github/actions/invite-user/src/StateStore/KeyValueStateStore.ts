import IStateStore from "./IStateStore"

export interface KeyValueStateWriterReader {
  getState(name: string): string | null
  saveState(name: string, value: any | null): void
}

const KEY = {
  IS_POST: "isPost"
}

export default class KeyValueStateStore implements IStateStore {
  private writerReader: KeyValueStateWriterReader
  
  constructor(writerReader: KeyValueStateWriterReader) {
    this.writerReader = writerReader
    this.isPost = false
  }
  
  get isPost(): boolean {
    return !!this.writerReader.getState(KEY.IS_POST)
  }
  
  set isPost(isPost: boolean) {
    this.writerReader.saveState(KEY.IS_POST, isPost)
  }
}
