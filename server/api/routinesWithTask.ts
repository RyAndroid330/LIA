import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all routines
async function getRoutineMap(taskId: string) {
  const query = `
    SELECT
    r.name,
    r.uuid,
    r.description
    FROM routine r
    JOIN task_to_routine_map trm ON r.uuid = trm.routine_id
    JOIN task t ON trm.task_id = t.uuid
    WHERE t.uuid = $1;
  `;
  const result = await client!.query(query, [taskId]);
  return result.rows;
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method, url } = event.node.req;
  const taskId = url?.split('=')[1];

  if (method === 'GET') {
    try {
      return await getRoutineMap(taskId ?? '');
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw error;
    }
  }
});
