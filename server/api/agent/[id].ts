import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all contracts
async function getContracts(agentId: string) {
  const query = `
    SELECT * FROM contract
    WHERE agent_id = $1
  `;
  const res = await client!.query(query, [agentId]);

  // Map the results to include all fields
  return res.rows.map((row) => ({
    uuid: row.uuid,
    agent_id: row.agent_id,
    context: row.context,
    product: row.product,
    issued_at: row.issued_at,
    created: row.created,
    fulfilled: row.fulfilled,
    fulfilled_at: row.fulfilled_at,
    result_context: row.result_context,
    from_url: row.from_url,
    headers: row.headers,
    method: row.method,
    credentials: row.credentials,
    mode: row.mode,
    referer: row.referer
  }));
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }
  const { method, url } = event.node.req;
  const agentId = url?.split('/').pop() ?? '';

  if (method === 'GET') {
    try {
      return await getContracts(agentId);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }
});
