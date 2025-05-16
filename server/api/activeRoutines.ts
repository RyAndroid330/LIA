import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all routines
async function getRoutines(id?: string) {
  if (!client) {
    client = await initializeClient();
  }

  const query = `
  SELECT
      re.uuid,
      re.description,
      re.server_id,
      re.routine_id,
      re.is_running,
      re.is_complete,
      re.errored,
      re.failed,
      re.previous_routine_execution,
      re.progress,
      re.created,
      re.ended,
      re.contract_id,
      re.context_id,
      re.is_running,
      ctx.uuid AS context_id,
      ctx2.uuid AS result_context_id,
      ctx.context AS input_context,
      ctx2.context AS output_context,
      s.processing_graph,
      s.address,
      s.port,
      pre.routine_id AS previous_routine_id,
      r.name AS routine_name,
      r.description AS routine_description
  FROM routine_execution AS re
  LEFT JOIN server s on re.server_id = s.uuid
  LEFT JOIN routine r ON re.routine_id = r.uuid
  LEFT JOIN routine_execution pre on re.previous_routine_execution = pre.uuid
    LEFT JOIN context ctx ON re.context_id = ctx.uuid
    LEFT JOIN context ctx2 ON re.result_context_id = ctx2.uuid
  `;
  const whereQuery = id ? `WHERE re.routine_id = '${id}'` : '';

  const orderQuery = `ORDER BY re.created DESC`;

  const fullQuery = query + whereQuery + orderQuery;

  try {
    const res = await client.query(fullQuery);

    // Map the results to match the ListItem interface
    return res.rows.map((row) => ({
      id: row.uuid,
      name: row.routine_name, // Corrected field mapping
      type: 'routine',
      label: row.description,
      routineDescription: row.routine_description,
      serverId: row.server_id,
      routineId: row.routine_id,
      status: row.errored
        ? 'Errored'
        : row.failed
          ? 'Failed'
          : row.is_running
            ? 'Running'
            : row.is_complete
              ? 'Completed'
              : 'Unknown',
      previousRoutineExecution: row.previous_routine_execution,
      progress:
        row.progress !== null && row.progress !== undefined
          ? `${Math.round(row.progress * 100)}%`
          : 'N/A',
      started: row.created,
      ended: row.ended,
      uuid: row.uuid,
      serverName: row.processing_graph + '@' + row.address + ':' + row.port,
      previousRoutineName: row.routine_name,
      contract_id: row.contract_id,
      processingGraph: row.processing_graph,
      inputContext: row.input_context,
      outputContext: row.output_context,
      isRunning: row.is_running,
      referer: row.errored ? 'Errored' : null
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
  const { method, url } = event.node.req || {};

  if (method === 'GET') {
    const urlParams = url
      ? new URLSearchParams(url.split('?')[1])
      : new URLSearchParams();
    const id = urlParams.get('id') || undefined;
    try {
      return await getRoutines(id);
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw error;
    }
  }
});
