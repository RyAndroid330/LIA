import { initializeClient } from '~/server/api/utils';
import pg from 'pg';

let client: pg.Client | null = null;

async function getServer(serverId: string) {
  const query = `
    SELECT *
    FROM routine_Execution
    LEFT JOIN server s ON routine_Execution.server_id = s.uuid
    WHERE s.uuid = $1;
  `;
  const result = await client!.query(query, [serverId]);
  return result.rows;
}

export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method } = event.node.req;
  const serverId = event.context.params?.id ?? '';

  if (method === 'GET') {
    try {
      return await getServer(serverId);
    } catch (error) {
      console.error('Error fetching routine:', error);
      throw error;
    }
  }
});
