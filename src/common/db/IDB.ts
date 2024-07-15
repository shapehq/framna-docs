export interface IDBRow {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly [column: string]: any
}

export interface IDBQueryResult<T> {
  readonly rows: T[]
}

export interface IDBConnection {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  query<T extends IDBRow>(query: string, values: any[]): Promise<IDBQueryResult<T>>
  query<T extends IDBRow>(query: string): Promise<IDBQueryResult<T>>
  disconnect(): Promise<void>
}

export default interface IDB {
  connect(): Promise<IDBConnection>
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  query<T extends IDBRow>(query: string, values: any[]): Promise<IDBQueryResult<T>>
  query<T extends IDBRow>(query: string): Promise<IDBQueryResult<T>>
}
