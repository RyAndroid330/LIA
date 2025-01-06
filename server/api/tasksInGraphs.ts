import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

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
  if ( !client ) {
    client = await initializeClient();
  }

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
