import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new pg.Pool({
  host: process.env.DB_HOST || 'database',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'travel_Organizer',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err);
});