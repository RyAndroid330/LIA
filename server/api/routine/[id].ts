import { initializeClient } from '~/server/api/utils';
import pg from 'pg';

let client: pg.Client | null = null;

async function getRoutine(routineId: string) {
  const query = `
    SELECT *
    FROM routine
    WHERE uuid = $1;
  `;
  const result = await client!.query(query, [routineId]);
  return result.rows;
}

export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method } = event.node.req;
  const routineId = event.context.params?.id ?? '';

  if (method === 'GET') {
    try {
      return await getRoutine(routineId);
    } catch (error) {
      console.error('Error fetching routine:', error);
      throw error;
    }
  }
});
