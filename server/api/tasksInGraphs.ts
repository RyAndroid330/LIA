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
    }); // Added a comma for consistency

    try {
      await client.connect();
      console.log('Connected to the database successfully:tasks');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }
}

// Get all tasks
async function gettasks() {
  const query = `
    SELECT * FROM directional_task_graph_map
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
      return await gettasks();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }
});
