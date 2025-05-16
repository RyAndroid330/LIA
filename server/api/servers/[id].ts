import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

async function getServersByGraph(client: pg.Client, graphId: string) {
  const query = `
    SELECT
      s.uuid,
      s.address,
      s.port,
      s.process_pid,
      s.is_primary,
      s.processing_graph,
      s.is_active
    FROM server s
    WHERE s.processing_graph = $1
      AND s.deleted = false
      AND s.is_non_responsive = false
      AND s.is_blocked = false;
  `;

  const result = await client.query(query, [graphId]);
  return result.rows;
}

export default defineEventHandler(async (event) => {
  const client = await initializeClient();

  const rawId = event.context.params?.id;
  if (!rawId) {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: 'id parameter is required'
    };
  }

  const graphId = decodeURIComponent(rawId);
  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      const result = await getServersByGraph(client, graphId);

      return {
        statusCode: 200,
        data: result
      };
    } catch (error: any) {
      console.error('Error fetching servers:', error);

      return {
        statusCode: 500,
        error: 'Internal Server Error',
        message: error.message
      };
    }
  } else {
    return {
      statusCode: 405,
      error: 'Method Not Allowed'
    };
  }
});
