import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all TaskExecutions
async function getTaskExecution(taskExecutionId: string) {
  try {
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
    te.split_group,
    prev.previous_task_execution_ids,
    prev.previous_task_names,
    nxt.next_task_execution_ids,
    nxt.next_task_names,
    re.server_id,
    re.description AS routine_name,
    re.contract_id,
    ctx.uuid AS context_id,
    ctx2.uuid AS result_contextx,
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

-- Subquery for previous tasks
LEFT JOIN LATERAL (
    SELECT
        ARRAY_AGG(tem.previous_task_execution_id) AS previous_task_execution_ids,
        ARRAY_AGG(t_prev.name) AS previous_task_names
    FROM task_execution_map tem
    LEFT JOIN task_execution te_prev ON tem.previous_task_execution_id = te_prev.uuid
    LEFT JOIN task t_prev ON te_prev.task_id = t_prev.uuid
    WHERE tem.task_execution_id = te.uuid
) prev ON TRUE

-- Subquery for next tasks
LEFT JOIN LATERAL (
    SELECT
        ARRAY_AGG(tem2.task_execution_id) AS next_task_execution_ids,
        ARRAY_AGG(t_next.name) AS next_task_names
    FROM task_execution_map tem2
    LEFT JOIN task_execution te_next ON tem2.task_execution_id = te_next.uuid
    LEFT JOIN task t_next ON te_next.task_id = t_next.uuid
    WHERE tem2.previous_task_execution_id = te.uuid
) nxt ON TRUE

-- The rest of the joins
LEFT JOIN routine_execution re ON te.routine_execution_id = re.uuid
LEFT JOIN context ctx ON te.context_id = ctx.uuid
LEFT JOIN context ctx2 ON te.result_context_id = ctx2.uuid
LEFT JOIN task t ON te.task_id = t.uuid
LEFT JOIN server s ON re.server_id = s.uuid

WHERE te.uuid = $1

GROUP BY te.uuid, re.server_id, re.contract_id, ctx.uuid, ctx2.uuid, t.name, re.description, t.description, t.is_unique, t.function_string, s.processing_graph, s.address, s.port,
         prev.previous_task_execution_ids, prev.previous_task_names,
         nxt.next_task_execution_ids, nxt.next_task_names
`;
    const result = await client!.query(query, [taskExecutionId]);
    return result.rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error('Failed to fetch TaskExecution from the database.');
  }
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }
  const { method, url } = event.node.req;
  const taskExecutionId = url?.split('=')[1] ?? '';

  if (!taskExecutionId) {
    throw new Error('TaskExecution ID is required.');
  }

  if (method === 'GET') {
    try {
      return await getTaskExecution(taskExecutionId);
    } catch (error) {
      console.error('Error fetching TaskExecutions:', error);
      throw error;
    }
  }
});
