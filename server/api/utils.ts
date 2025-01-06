import pg from 'pg';


export async function initializeClient() {
  const client = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'processing_graph_test',
    password: 'password',
    port: 5432
  });

  try {
    await client.connect();
    console.log('Connected to the database successfully:routines');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }

  return client;
}
