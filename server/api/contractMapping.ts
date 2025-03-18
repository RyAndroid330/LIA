import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

async function getClient() {
  if (!client) {
    client = await initializeClient();
  }
  return client;
}

// Get contractExecutions by contract_id
async function getcontractMap(contractId: string) {
  const query = `
    SELECT
      DATE_TRUNC('day', created) as date,
      EXTRACT(hour FROM created) as hour,
      COUNT(*) as executions,
      SUM(CASE WHEN errored THEN 1 ELSE 0 END) +
      SUM(CASE WHEN failed THEN 1 ELSE 0 END) +
      SUM(CASE WHEN reached_timeout THEN 1 ELSE 0 END) as errors
    FROM routine_execution
    WHERE contract_id = $1
    GROUP BY date, hour
    ORDER BY date, hour
  `;
  const client = await getClient();
  const result = await client.query(query, [contractId]);
  return result.rows;
}

// Event handler
export default defineEventHandler(async (event) => {
  const { method } = event.node.req;
  const url = new URL(
    event.node.req.url ?? '',
    `http://${event.node.req.headers.host}`
  );
  const contractId = url.searchParams.get('contractId');

  if (method === 'GET' && contractId) {
    try {
      return await getcontractMap(contractId);
    } catch (error) {
      console.error('Error fetching contractExecutions:', error);
      throw error;
    }
  } else {
    console.error('Invalid request:', { method, contractId });
    return { error: 'Invalid request' };
  }
});
