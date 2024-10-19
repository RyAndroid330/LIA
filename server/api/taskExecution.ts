import pg from 'pg';

let client: pg.Client | null = null;

async function initializeClient() {
  if (!client) {
    client = new pg.Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'password',
      port: 5432
    });

    try {
      await client.connect();
      console.log('Connected to the database successfully: TaskExecutions');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }
}

// Get all TaskExecutions
async function getTaskExecutions() {
  const query = `
    SELECT * FROM task_execution_map
  `;
  const result = await client!.query(query);
  return result.rows;
}

// Event handler
export default defineEventHandler(async (event) => {
  await initializeClient();
  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      return await getTaskExecutions();
    } catch (error) {
      console.error('Error fetching TaskExecutions:', error);
      throw error;
    }
  }
});
