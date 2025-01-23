import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all routines
async function getRoutines() {
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
      s.processing_graph,
      pre.routine_id AS previous_routine_id,
      r.name AS routine_name,
      r.description AS routine_description
  FROM routine_execution AS re
      LEFT JOIN server s on re.server_id = s.uuid
      LEFT JOIN routine r ON re.routine_id = r.uuid
      LEFT JOIN routine_execution pre on re.previous_routine_execution = pre.uuid
  ORDER BY re.created DESC
`;
  const res = await client!.query(query);

  // Map the results to match the ListItem interface
  return res.rows.map((row) => ({
    id: row.uuid,
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
    progress: `${Math.round(row.progress * 100)}%`,
    started: row.created,
    ended: row.ended,
    uuid: row.uuid,
    serverName: row.processing_graph,
    previousRoutineName: row.routine_name,
    contract_id: row.contract_id
  }));
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      return await getRoutines();
    } catch (error) {
      console.error('Error fetching routines:', error);
      throw error;
    }
  }
});
