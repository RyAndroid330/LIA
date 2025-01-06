import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;


async function getAllServersWithStats() {
  const query = `
    SELECT 
        s.uuid, 
        s.address, 
        s.port, 
        s.process_pid,
        s.is_primary,
        s.is_active, 
        s.is_non_responsive, 
        s.is_blocked, 
        s.processing_graph
    FROM server s;
  `;
  const result = await client!.query(query);
  return result.rows.map( row => ( {
    uuid: row.uuid,
    graph: row.processing_graph,
    address: row.address,
    port: row.port,
    isPrimary: row.is_primary,
    processPid: row.process_pid,
    status: row.is_active && !row.is_non_responsive ? 'Active' : 'Offline',
  } ) );
}

// Event handler
export default defineEventHandler(async (event) => {
  if ( !client ) {
    client = await initializeClient();
  }
  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      return await getAllServersWithStats();
    } catch (error) {
      console.error('Error fetching server stats:', error);
      throw error;
    }
  }
});
