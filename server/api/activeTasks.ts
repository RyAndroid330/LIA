import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all TaskExecutions
async function getTaskExecution(id?: string) {
  if (!client) {
    client = await initializeClient();
  }

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
  const whereQuery = id ? `WHERE te.task_id = '${id}'` : '';

  const orderQuery = `ORDER BY te.created DESC`;

  const fullQuery = query + whereQuery + orderQuery;

  try {
    const result = await client.query(fullQuery);
    return result.rows.map((row) => ({
      id: row.uuid,
      routineExecutionId: row.routine_execution_id,
      taskId: row.task_id,
      isRunning: row.is_running,
      isComplete: row.is_complete,
      errored: row.errored,
      failed: row.failed,
      progress:
        row.progress !== null && row.progress !== undefined
          ? `${Math.round(row.progress * 100)}%`
          : 'N/A',
      scheduled: row.scheduled,
      started: row.started,
      ended: row.ended,
      previousTaskExecutionId: row.previous_task_execution_id,
      serverId: row.server_id,
      routineName: row.routine_name,
      contextId: row.context_id,
      resultContextId: row.result_context_id,
      inputContext: row.input_context,
      outputContext: row.output_context,
      name: row.name,
      description: row.description,
      isUnique: row.is_unique,
      functionString: row.function_string
    }));
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }
  console.log('event', event);
  const { method, url } = event.node.req;

  if (method === 'GET' && url) {
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const id = urlParams.get('id') || undefined;
    try {
      return await getTaskExecution(id);
    } catch (error) {
      console.error('Error fetching TaskExecutions:', error);
      throw error;
    }
  }
});
