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
  } catch (error) {
    throw error;
  }
})();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, email, password } = body;

    if (!username || !email || !password) {
      const response = { success: false, message: 'Missing required fields' };
      return response;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the AuthDB
    const query =
      'INSERT INTO auth.users (username, email, password_hash) VALUES ($1, $2, $3)';
    const values = [username, email, hashedPassword];

    await authDbClient.query(query, values);

    const response = { success: true, message: 'User registered successfully' };
    return response;
  } catch (error) {
    const response = {
      success: false,
      message: 'An error occurred during signup',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    return response;
  }
});
