import { defineEventHandler, readBody, getMethod } from 'h3';
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
  const method = getMethod(event);

  if (method !== 'POST') {
    console.error('Login API: HTTP method not allowed');
    return {
      success: false,
      message: 'HTTP method is not allowed.'
    };
  }

  console.log('Login API: Starting login process');

  try {
    const body = await readBody(event);
    const { username, password } = body;

    console.log('Login API: Received input', {
      username,
      password: password ? '***' : 'null'
    });

    if (!username || !password) {
      console.error('Login API: Missing required fields');
      return { success: false, message: 'Missing required fields' };
    }

    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];

    console.log('Login API: Executing query', { query, values });
    const result = await authDbClient.query(query, values);

    console.log('Login API: Query result', result.rows);

    if (result.rows.length === 0) {
      console.error('Login API: User not found');
      return { success: false, message: 'Invalid username or password' };
    }

    const user = result.rows[0];
    console.log('Login API: Retrieved user', {
      id: user.id,
      username: user.username
    });

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Login API: Password validation result', isPasswordValid);

    if (!isPasswordValid) {
      console.error('Login API: Invalid password');
      return { success: false, message: 'Invalid username or password' };
    }

    console.log('Login API: User authenticated successfully');
    return {
      success: true,
      user: { id: user.id, username: user.username, email: user.email }
    };
  } catch (error) {
    console.error('Login API: Error during login process', error);
    return {
      success: false,
      message: 'An error occurred during login',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});
