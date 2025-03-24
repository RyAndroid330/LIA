import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all TaskExecutions
async function getTaskExecution(taskExecutionId: string) {
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
      ARRAY_AGG(tem.previous_task_execution_id) AS previous_task_execution_ids,
      ARRAY_AGG(tem2.task_execution_id) AS next_task_execution_ids,
      re.server_id,
      re.description AS routine_name,
      ctx.uuid AS context_id,
      ctx2.uuid AS result_context_id,
      ctx.context AS input_context,
      ctx2.context AS output_context,
      t.name,
      t.description,
      t.is_unique,
      t.function_string,
      s.processing_graph,
      s.address,
      s.port
  FROM task_execution te
  LEFT JOIN task_execution_map tem ON te.uuid = tem.task_execution_id
  LEFT JOIN task_execution_map tem2 ON te.uuid = tem2.previous_task_execution_id
  LEFT JOIN routine_execution re ON te.routine_execution_id = re.uuid
  LEFT JOIN context ctx ON te.context_id = ctx.uuid
  LEFT JOIN context ctx2 ON te.result_context_id = ctx2.uuid
  LEFT JOIN task t ON te.task_id = t.uuid
  LEFT JOIN server s ON re.server_id = s.uuid
  WHERE te.uuid = $1
  GROUP BY te.uuid, re.server_id, ctx.uuid, ctx2.uuid, t.name, re.description, t.description, t.is_unique, t.function_string, s.processing_graph, s.address, s.port
`;
  const result = await client!.query(query, [taskExecutionId]);
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
      return await getTaskExecution(taskExecutionId);
    } catch (error) {
      console.error('Error fetching TaskExecutions:', error);
      throw error;
    }
  }
});
