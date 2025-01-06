import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;


// Get all routines
async function getRoutineMap( routineId: string ) {
  const query = `
    SELECT 
        te.uuid,
        te.routine_execution_id,
        te.task_id,
        te.context_id,
        te.result_context_id,
        te.is_running,
        te.is_complete,
        te.errored,
        te.failed,
        te.progress,
        te.created AS scheduled,
        te.started,
        te.ended,
        tem.previous_task_execution_id,
        t.name,
        t.description,
        t.layer_index,
        t.processing_graph,
        t.is_unique,
        re.server_id
    FROM task_execution te
    LEFT JOIN task_execution_map tem ON te.uuid = tem.task_execution_id
    LEFT JOIN task t ON te.task_id = t.uuid
    LEFT JOIN routine_execution re ON te.routine_execution_id = re.uuid
    WHERE te.routine_execution_id = $1 ORDER BY te.started;
  `;
  const result = await client!.query(query, [routineId]);
  return result.rows;
}

// Event handler
export default defineEventHandler(async (event) => {
  if ( !client ) {
    client = await initializeClient();
  }

  const { method, url } = event.node.req;
  const routineId = url?.split( '=' )[ 1 ];

  if (method === 'GET') {
    try {
      return await getRoutineMap( routineId ?? '' );
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw error;
    }
  }
});
