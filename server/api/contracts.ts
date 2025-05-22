import pg from 'pg';
import { initializeClient } from '~/server/api/utils';
import { getQuery } from 'h3'; // Ensure getQuery is imported

let client: pg.Client | null = null;

// Get all contracts
async function getContracts(
  page: number = 1,
  limit: number = 100,
  uuid?: string
) {
  const offset = (page - 1) * limit;
  let query = `
    SELECT contract.*, agent.name AS agent_name,
      ctx_in.context AS input_context,
      ctx_out.context AS output_context
    FROM contract
    LEFT JOIN agent ON contract.agent_id = agent.uuid
    LEFT JOIN context AS ctx_in ON contract.context = ctx_in.uuid
    LEFT JOIN context AS ctx_out ON contract.result_context = ctx_out.uuid
  `;
  const params: any[] = [];
  if (uuid) {
    query += ' WHERE contract.uuid = $1';
    params.push(uuid);
  } else {
    query += ' LIMIT $1 OFFSET $2';
    params.push(limit, offset);
  }
  const res = await client!.query(query, params);

  // Map the results to include all fields, keeping input and output context as objects
  return res.rows.map((row) => ({
    uuid: row.uuid,
    agent_id: row.agent_id,
    agent_name: row.agent_name,
    input_context: row.input_context, // now an object
    output_context: row.output_context, // now an object
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
      const uuid = query.uuid as string | undefined;

      // Fetch contracts and total count
      let contracts, totalContracts;
      if (uuid) {
        contracts = await getContracts(1, 1, uuid);
        totalContracts = 1;
      } else {
        [contracts, totalContracts] = await Promise.all([
          getContracts(page, limit),
          getTotalContracts()
        ]);
      }

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
