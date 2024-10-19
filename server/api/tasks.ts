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
      console.log('Connected to the database successfully:tasks');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }
}

// Get all Tasks
async function getTasks() {
  const query = `
    SELECT * FROM task
  `;
  const res = await client!.query(query);

  // Map the results to match the ListItem interface
  return res.rows.map((row) => ({
    type: 'task', // Set the type to 'Task'
    label: row.name,
    description: row.description, // Include description if needed
    uuid: row.uuid,
    graph: row.processing_graph
  }));
}

// Event handler
export default defineEventHandler(async (event) => {
  await initializeClient();
  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      return await getTasks();
    } catch (error) {
      console.error('Error fetching Tasks:', error);
      throw error;
    }
  }
});
