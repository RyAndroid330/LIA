import pg from 'pg';

const { Client } = pg;

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5432
});

async function connectClient() {
  try {
    await client.connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

connectClient();

export default client;
