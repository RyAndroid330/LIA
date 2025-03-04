import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

async function getClient() {
  if (!client) {
    client = await initializeClient();
  }
  return client;
}

// Get routineExecutions by routine_id
async function getRoutineMap(routineId: string) {
  const query = `
SELECT
    COUNT(*) as executions,
    SUM(CASE WHEN errored THEN 1 ELSE 0 END) as errored,
    SUM(CASE WHEN failed THEN 1 ELSE 0 END) as failed,
    SUM(CASE WHEN reached_timeout THEN 1 ELSE 0 END) as reached_timeout,
    SUM(CASE WHEN is_complete THEN 1 ELSE 0 END)as is_complete
FROM
    routine_execution
WHERE
    routine_id = $1
  `;
  const client = await getClient();
  const result = await client.query(query, [routineId]);
  return result.rows;
}

// Event handler
export default defineEventHandler(async (event) => {
  const { method } = event.node.req;
  const url = new URL(
    event.node.req.url ?? '',
    `http://${event.node.req.headers.host}`
  );
  const routineId = url.searchParams.get('routineId');

  console.log('Request method:', method);
  console.log('routine ID:', routineId);
  console.log('Event context:', event.context);

  if (method === 'GET' && routineId) {
    try {
      return await getRoutineMap(routineId);
    } catch (error) {
      console.error('Error fetching routineExecutions:', error);
      throw error;
    }
  } else {
    console.error('Invalid request:', { method, routineId });
    return { error: 'Invalid request' };
  }
});
