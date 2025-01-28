import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all agents
async function getAgents() {
  const query = `
    SELECT * FROM agent
  `;
  const res = await client!.query(query);

  // Map the results to include all fields
  return res.rows.map((row) => ({
    uuid: row.uuid,
    name: row.name,
    description: row.description,
    created: row.created,
    deleted: row.deleted
  }));
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }
  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      return await getAgents();
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }
});
