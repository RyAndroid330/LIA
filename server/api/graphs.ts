import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

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
  if (!client) {
    client = await initializeClient();
  }
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
