import pg from 'pg';
import { initializeClient } from '~/server/api/utils';
import { getQuery } from 'h3'; // Ensure getQuery is imported

let client: pg.Client | null = null;

// Get all contracts
async function getContracts(page: number = 1, limit: number = 100) {
  const offset = (page - 1) * limit;
  console.log('Fetching contracts with page:', page, 'and limit:', limit);
  const query = `
    SELECT contract.*, agent.name AS agent_name
    FROM contract
    LEFT JOIN agent ON contract.agent_id = agent.uuid
    LIMIT $1 OFFSET $2
  `;
  const res = await client!.query(query, [limit, offset]);

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
    referer: row.referer,
    description: row.description
  }));
}

// Get the total number of contracts
async function getTotalContracts() {
  const query = 'SELECT COUNT(*) FROM contract';
  const res = await client!.query(query);
  return parseInt(res.rows[0].count, 10);
}

// Event handler
export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }
  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      const query = getQuery(event);
      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 100;

      // Fetch contracts and total count
      const [contracts, totalContracts] = await Promise.all([
        getContracts(page, limit),
        getTotalContracts()
      ]);

      const lastPage = Math.ceil(totalContracts / limit);

      return {
        contracts,
        lastPage
      };
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }
});
