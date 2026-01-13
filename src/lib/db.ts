import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não encontrado. Defina no .env.local.");
}

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const pool = global.pgPool ?? new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();
