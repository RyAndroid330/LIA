import { initializeClient } from '~/server/api/utils';
import pg from 'pg';

let client: pg.Client | null = null;

async function getGraph(graphId: string) {
  console.log('Fetching graph with ID:', graphId); // Add logging
  const query = `
    SELECT * FROM processing_graph
    WHERE name = $1;
  `;
  const result = await client!.query(query, [graphId]);
  console.log('Query result:', result.rows); // Add logging
  return result.rows;
}

export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method } = event.node.req;
  const graphId = decodeURIComponent(event.context.params?.id ?? '');
  console.log('Request method:', method); // Add logging
  console.log('Extracted graph ID:', graphId); // Add logging

  if (method === 'GET') {
    try {
      return await getGraph(graphId);
    } catch (error) {
      console.error('Error fetching graph:', error);
      throw error;
    }
  }
});
