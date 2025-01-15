import { initializeClient } from '~/server/api/utils';
import pg from 'pg';

let client: pg.Client | null = null;

async function getRoutine(routineId: string) {
  console.log('Fetching routine with ID:', routineId); // Add logging
  const query = `
    SELECT *
    FROM routine
    WHERE uuid = $1;
  `;
  const result = await client!.query(query, [routineId]);
  console.log('Query result:', result.rows); // Add logging
  return result.rows;
}

export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method } = event.node.req;
  const routineId = event.context.params?.id ?? '';
  console.log('Request method:', method); // Add logging
  console.log('Extracted routine ID:', routineId); // Add logging

  if (method === 'GET') {
    try {
      return await getRoutine(routineId);
    } catch (error) {
      console.error('Error fetching routine:', error);
      throw error;
    }
  }
});
