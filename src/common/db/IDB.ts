export interface IDBRow {
  readonly [column: string]: any;
}

export interface IDBQueryResult<T> {
  readonly rows: T[]
}

export interface IDBConnection {
  query<T extends IDBRow>(query: string, values: any[]): Promise<IDBQueryResult<T>>
  query<T extends IDBRow>(query: string): Promise<IDBQueryResult<T>>
  disconnect(): Promise<void>
}

export default interface IDB {
  connect(): Promise<IDBConnection>
  query<T extends IDBRow>(query: string, values: any[]): Promise<IDBQueryResult<T>>
  query<T extends IDBRow>(query: string): Promise<IDBQueryResult<T>>
}
