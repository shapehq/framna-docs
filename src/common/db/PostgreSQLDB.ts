import { Pool, PoolClient } from "pg"
import IDB, { IDBConnection, IDBQueryResult } from "./IDB"


export class PostgreSQLDBConnection implements IDBConnection {
  private readonly client: PoolClient
  
  constructor(config: { client: PoolClient }) {
    this.client = config.client
  }
  
  async disconnect(): Promise<void> {
    this.client.release()
  }
  
  async query(query: string, values: any[] = []): Promise<IDBQueryResult> {
    const result = await this.client.query(query, values)
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
  
  async query(query: string, values: any[] = []): Promise<IDBQueryResult> {
    const connection = await this.connect()
    const result = await connection.query(query, values)
    connection.disconnect()
    return result
  }
}
