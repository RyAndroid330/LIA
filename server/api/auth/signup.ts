import { defineEventHandler, readBody } from 'h3';
import bcrypt from 'bcrypt';
import pg from 'pg';

const authDbClient = new pg.Client({
  user: process.env.AUTH_DB_USER,
  host: process.env.AUTH_DB_HOST,
  database: process.env.AUTH_DB_NAME,
  password: process.env.AUTH_DB_PASSWORD,
  port: parseInt(process.env.AUTH_DB_PORT || '5432', 10)
});

(async () => {
  try {
    await authDbClient.connect();
    console.log('Connected to the AuthDB successfully');
  } catch (error) {
    console.error('Error connecting to the AuthDB:', error);
    throw error;
  }
})();

export default defineEventHandler(async (event) => {
  console.log('Signup API: Received signup request');

  try {
    const body = await readBody(event);
    const { username, email, password } = body;

    console.log('Signup API: Validating input', { username, email });

    if (!username || !email || !password) {
      console.error('Signup API: Missing required fields');
      const response = { success: false, message: 'Missing required fields' };
      console.log('Signup API: Sending response', response);
      return response;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Signup API: Password hashed successfully');

    // Insert user into the AuthDB
    console.log('Signup API: Inserting user into AuthDB', { username, email });
    const query =
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)';
    const values = [username, email, hashedPassword];

    await authDbClient.query(query, values);
    console.log('Signup API: User inserted into AuthDB successfully');

    const response = { success: true, message: 'User registered successfully' };
    console.log('Signup API: Sending response', response);
    return response;
  } catch (error) {
    console.error('Signup API: Error during signup process', error);
    const response = {
      success: false,
      message: 'An error occurred during signup',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    console.log('Signup API: Sending response', response);
    return response;
  }
});
