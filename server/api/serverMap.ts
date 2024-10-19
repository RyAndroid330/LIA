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

// Get all servers
async function getAllServers() {
  const query = `
    SELECT s.uuid AS server_id, s2s.server_client_id AS client_id, s.is_active, s.is_blocked, s.is_non_responsive, s.address, s.port
    FROM server s
    LEFT JOIN server_to_server_communication_map s2s ON s.uuid = s2s.server_id;
  `;
  const result = await client!.query(query);
  return result.rows;
}

// Event handler
export default defineEventHandler(async (event) => {
  await initializeClient();
  const { method } = event.node.req;
  const { serverId } = event.context.params || {};

  if (method === 'GET') {
    return getAllServers();
  }
});
