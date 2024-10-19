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
      console.log('Connected to the database successfully');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }
}

async function getAllServersWithStats() {
  const query = `
    SELECT s.uuid, s.address, s.port, ss.cpu, ss.gpu, ss.ram, ss.timestamp, s.is_active, s.is_non_responsive, s.is_blocked
    FROM server s
    LEFT JOIN server_snapshot ss ON ss.server_id = s.uuid
    WHERE ss.timestamp = (
      SELECT MAX(ss2.timestamp)
      FROM server_snapshot ss2
      WHERE ss2.server_id = s.uuid
    )
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
      return await getAllServersWithStats();
    } catch (error) {
      console.error('Error fetching server stats:', error);
      throw error;
    }
  }
});
