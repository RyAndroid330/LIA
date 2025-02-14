import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all TaskExecutions
async function getTaskExecution() {
  const query = `
    SELECT
        te.uuid,
        te.routine_execution_id,
        te.task_id,
        te.is_running,
        te.is_complete,
        te.errored,
        te.failed,
        te.progress,
        te.created AS scheduled,
        te.started,
        te.ended,
        tem.previous_task_execution_id,
        re.server_id,
        re.description AS routine_name,
        ctx.uuid AS context_id,
        ctx2.uuid AS result_context_id,
        te.routine_execution_id,
        ctx.context AS input_context,
        ctx2.context AS output_context,
        t.name,
        t.description,
        t.is_unique,
        t.function_string
    FROM task_execution te
    LEFT JOIN task_execution_map tem ON te.uuid = tem.task_execution_id
    LEFT JOIN routine_execution re ON te.routine_execution_id = re.uuid
    LEFT JOIN context ctx ON te.context_id = ctx.uuid
    LEFT JOIN context ctx2 ON te.result_context_id = ctx2.uuid
    LEFT JOIN task t ON te.task_id = t.uuid
  `;
  const result = await client!.query(query);
  return result.rows;
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }
  const { method, url } = event.node.req;
  const taskExecutionId = url?.split('=')[1] ?? '';

  if (method === 'GET') {
    try {
      return await getTaskExecution();
    } catch (error) {
      console.error('Error fetching TaskExecutions:', error);
      throw error;
    }
  }
});
