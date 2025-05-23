import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export async function initializeClient() {
  const client = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10)
  });

  try {
    await client.connect();
    console.log('Connected to the database successfully');
    return client;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

export async function sleep( number: number ) {
  await new Promise((resolve) => setTimeout(resolve, number));
}
