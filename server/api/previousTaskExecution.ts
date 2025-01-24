import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all graphs
async function getPreviousExecutions() {
  const query = `
    SELECT task_execution_id AS next_id FROM task_execution_map
    WHERE previous_task_execution_id = $1;
    SELECT previous_task_execution_id AS previous_id FROM task_execution_map
    WHERE task_execution_id = $1;
  `;
  const res = await client!.query(query);

  // Map the results to match the ListItem interface
  return res.rows.map((row) => ({
    type: 'graph',
    next_id: row.next_id,
    previous_id: row.previous_id
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
      return await getPreviousExecutions();
    } catch (error) {
      console.error('Error fetching graphs:', error);
      throw error;
    }
  }
});
