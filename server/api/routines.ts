import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;


// Get all routines
async function getRoutines() {
  const query = `
    SELECT * FROM routine LIMIT 100;
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
  if ( !client ) {
    client = await initializeClient();
  }
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
