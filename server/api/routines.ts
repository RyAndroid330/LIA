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
      console.log('Connected to the database successfully:routines');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }
}

// Get all routines
async function getRoutines() {
  const query = `
    SELECT * FROM routine LIMIT 100
  `;
  const res = await client!.query(query);

  // Map the results to match the ListItem interface
  return res.rows.map((row) => ({
    type: 'routine',
    label: row.name,
    uuid: row.uuid,
    description: row.description
  }));
}

// Event handler
export default defineEventHandler(async (event) => {
  await initializeClient();
  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      return await getRoutines();
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw error;
    }
  }
});
