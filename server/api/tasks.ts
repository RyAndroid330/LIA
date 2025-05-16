import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all Tasks
async function getTasks(page: number = 1, limit: number = 100) {
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM task
    LIMIT $1 OFFSET $2
  `;
  const res = await client!.query(query, [limit, offset]);

  // Map the results to match the ListItem interface
  return res.rows.map((row) => ({
    type: 'task',
    label: row.name,
    description: row.description,
    uuid: row.uuid,
    graph: row.processing_graph,
    unique: row.is_unique,
    concurrency: row.concurrency
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
      return await getTasks();
    } catch (error) {
      console.error('Error fetching Tasks:', error);
      throw error;
    }
  }
});
