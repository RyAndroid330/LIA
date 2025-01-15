import { initializeClient } from '~/server/api/utils';
import pg from 'pg';

let client: pg.Client | null = null;

async function getTask(taskId: string) {
  console.log('Fetching task with ID:', taskId); // Add logging
  const query = `
    SELECT *
    FROM task
    WHERE uuid = $1;
  `;
  const result = await client!.query(query, [taskId]);
  console.log('Query result:', result.rows); // Add logging
  return result.rows;
}

export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method } = event.node.req;
  const taskId = event.context.params?.id ?? '';
  console.log('Request method:', method); // Add logging
  console.log('Extracted task ID:', taskId); // Add logging

  if (method === 'GET') {
    try {
      return await getTask(taskId);
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }
});
