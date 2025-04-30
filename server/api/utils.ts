import pg from 'pg';

export async function initializeClient() {
  const client = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'password',
    port: 5432
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
