import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all Tasks
async function getTasks() {
  console.log('Fetching all tasks'); // Add logging
  const query = `
    SELECT * FROM task
  `;
  const res = await client!.query(query);
  console.log('Query result:', res.rows); // Add logging

  // Map the results to match the ListItem interface
  return res.rows.map((row) => ({
    type: 'task', // Set the type to 'Task'
    label: row.name,
    description: row.description, // Include description if needed
    uuid: row.uuid,
    graph: row.processing_graph
  }));
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method } = event.node.req;
  console.log('Request method:', method); // Add logging

  if (method === 'GET') {
    try {
      return await getTasks();
    } catch (error) {
      console.error('Error fetching Tasks:', error);
      throw error;
    }
  }
});
