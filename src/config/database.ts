import pg from "pg";
import { env } from "./env";

const sslConfig = env.DB_SSL ? { rejectUnauthorized: false } : undefined;

const poolConfig: pg.PoolConfig = env.DATABASE_URL? { connectionString: env.DATABASE_URL, ssl: sslConfig }: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      ssl: sslConfig,
    };

export const pool = new pg.Pool(poolConfig);

export const db = {
  async execute<T = any>(sql: string, params?: any[]): Promise<[T, any]> {
    const res = await pool.query(sql, params);
    return [res.rows as unknown as T, res.fields];
  },
  async query<T = any>(sql: string, params?: any[]): Promise<[T, any]> {
    const res = await pool.query(sql, params);
    return [res.rows as unknown as T, res.fields];
  },
  async getClient(): Promise<pg.PoolClient> {
    return await pool.connect();
  },
  async end(): Promise<void> {
    await pool.end();
  }
};

export async function verifyDatabaseConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}



