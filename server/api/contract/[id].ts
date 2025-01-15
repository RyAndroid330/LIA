import { initializeClient } from '~/server/api/utils';
import pg from 'pg';

let client: pg.Client | null = null;

async function getcontract(contractId: string) {
  console.log('Fetching contract with ID:', contractId); // Add logging
  const query = `
    SELECT *
    FROM contract
    WHERE uuid = $1;
  `;
  const result = await client!.query(query, [contractId]);
  console.log('Query result:', result.rows); // Add logging
  return result.rows;
}

export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method } = event.node.req;
  const contractId = event.context.params?.id ?? '';
  console.log('Request method:', method); // Add logging
  console.log('Extracted contract ID:', contractId); // Add logging

  if (method === 'GET') {
    try {
      return await getcontract(contractId);
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  }
});
