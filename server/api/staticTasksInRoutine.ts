import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all routines
async function getRoutineMap(routineId: string) {
  const query = `
SELECT
    ttrm.routine_id,
    ttrm.task_id AS uuid,
    t.name,
    t.layer_index,
    dtm.task_id,
    dtm.predecessor_task_id AS previous_task_execution_id
FROM task_to_routine_map ttrm
LEFT OUTER JOIN task t ON ttrm.task_id = t.uuid
LEFT OUTER JOIN directional_task_graph_map dtm ON ttrm.task_id = dtm.task_id
Where routine_id = $1 ;
  `;
  const result = await client!.query(query, [routineId]);
  return result.rows;
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method, url } = event.node.req;
  const routineId = url?.split('=')[1];

  if (method === 'GET') {
    try {
      return await getRoutineMap(routineId ?? '');
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw error;
    }
  }
});
