import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all TaskExecutions
async function getTaskExecution(id?: string) {
  if (!client) {
    client = await initializeClient();
  }

  let query = '';

  if (id) {
    query = `
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
        ARRAY_AGG(tem.task_execution_id) AS previous_task_execution_ids,
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
    LEFT JOIN routine_execution re ON te.routine_execution_id = re.uuid
    LEFT JOIN context ctx ON te.context_id = ctx.uuid
    LEFT JOIN context ctx2 ON te.result_context_id = ctx2.uuid
    LEFT JOIN task t ON te.task_id = t.uuid
    LEFT JOIN server s ON re.server_id = s.uuid
    WHERE te.task_id = $1
    GROUP BY te.uuid, re.server_id, ctx.uuid, ctx2.uuid, t.name, re.description, t.description, t.is_unique, t.function_string, s.processing_graph, s.address, s.port
    `;
  } else {
    query = `
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
    LEFT JOIN routine_execution re ON te.routine_execution_id = re.uuid
    LEFT JOIN context ctx ON te.context_id = ctx.uuid
    LEFT JOIN context ctx2 ON te.result_context_id = ctx2.uuid
    LEFT JOIN task t ON te.task_id = t.uuid
    LEFT JOIN server s ON re.server_id = s.uuid
    `;
  }

  const result = await client.query(query, id ? [id] : []);
  return result.rows.map((row) => ({
    id: row.uuid,
    type: 'task',
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
    previousTaskExecutionIds: row.previous_task_execution_ids,
    previousTaskNames: row.previous_task_names,
    serverId: row.server_id,
    routineName: row.routine_name,
    contextId: row.context_id,
    resultContextId: row.result_context_id,
    inputContext: row.input_context,
    outputContext: row.output_context,
    name: row.name,
    description: row.description,
    isUnique: row.is_unique,
    functionString: row.function_string,
    serverName: row.processing_graph + '@' + row.address + ':' + row.port,
    layerIndex: row.layer_index,
    previousTaskName: row.previous_task_name
  }));
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }
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
