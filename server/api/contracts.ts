import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

// Get all contracts
async function getContracts() {
  const query = `
    SELECT contract.*, agent.name AS agent_name
    FROM contract
    LEFT JOIN agent ON contract.agent_id = agent.uuid
  `;
  const res = await client!.query(query);

  // Map the results to include all fields
  return res.rows.map((row) => ({
    uuid: row.uuid,
    agent_id: row.agent_id,
    agent_name: row.agent_name,
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
  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      return await getContracts();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }
});
