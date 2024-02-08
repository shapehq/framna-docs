export interface IDBQueryResult {
  readonly rows: any[]
}

export interface IDBConnection {
  query(query: string, values: any[]): Promise<IDBQueryResult>
  query(query: string): Promise<IDBQueryResult>
  disconnect(): Promise<void>
}

export default interface IDB {
  connect(): Promise<IDBConnection>
  query(query: string, values: any[]): Promise<IDBQueryResult>
  query(query: string): Promise<IDBQueryResult>
}
