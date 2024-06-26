import { Pool, PoolClient, QueryResult } from "pg"
import IDB, { IDBConnection, IDBQueryResult, IDBRow } from "./IDB"


export class PostgreSQLDBConnection implements IDBConnection {
  private readonly client: PoolClient
  
  constructor(config: { client: PoolClient }) {
    this.client = config.client
  }
  
  async disconnect(): Promise<void> {
    this.client.release()
  }
  
  async query<T extends IDBRow>(query: string, values: any[] = []): Promise<IDBQueryResult<T>> {
    const result: QueryResult<T> = await this.client.query(query, values)
    return { rows: result.rows }
  }
}

interface PostgreSQLDBConfig {
  readonly pool: Pool
}

export default class PostgreSQLDB implements IDB {
  private readonly pool: Pool
  
  constructor(config: PostgreSQLDBConfig) {
    this.pool = config.pool
  }
  
  async connect(): Promise<IDBConnection> {
    const client = await this.pool.connect()
    return new PostgreSQLDBConnection({ client })
  }
  
  async query<T extends IDBRow>(query: string, values: any[] = []): Promise<IDBQueryResult<T>> {
    const connection = await this.connect()
    const result = await connection.query<T>(query, values)
    connection.disconnect()
    return result
  }
}
