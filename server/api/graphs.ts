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
      console.log('Connected to the database successfully: graphs');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }
}

// Get all graphs
async function getgraphs() {
  const query = `
    SELECT * FROM processing_graph
  `;
  const res = await client!.query(query);

  // Map the results to match the ListItem interface
  return res.rows.map((row) => ({
    type: 'graph',
    label: row.name,
    description: row.description,
    uuid: row.name
  }));
}

// Event handler
export default defineEventHandler(async (event) => {
  await initializeClient();
  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      return await getgraphs();
    } catch (error) {
      console.error('Error fetching graphs:', error);
      throw error;
    }
  }
});
