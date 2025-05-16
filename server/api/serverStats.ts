import pg from 'pg';
import { initializeClient } from '~/server/api/utils';

let client: pg.Client | null = null;

async function getAllServersWithStats(
  processingGraph?: string,
  page: number = 1,
  limit: number = 100
) {
  if (page < 1 || limit < 1) {
    throw new Error('Page and limit must be positive integers.');
  }

  const offset = (page - 1) * limit;
  let query = `
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
    FROM server s
    WHERE s.is_active = true
  `;
  const values: (string | number)[] = [];

  if (processingGraph) {
    query += ` AND s.processing_graph = $1`;
    values.push(processingGraph);
  } else {
    query += ` LIMIT $1 OFFSET $2`;
    values.push(limit, offset);
  }

  const result = await client!.query(query, values);
  return {
    servers: result.rows.map((row) => ({
      uuid: row.uuid,
      graph: row.processing_graph,
      address: row.address,
      port: row.port,
      isPrimary: row.is_primary,
      processPid: row.process_pid,
      status: row.is_active ? 'check' : 'schedule'
    }))
  };
}

export default defineEventHandler(async (event) => {
  if (!client) {
    client = await initializeClient();
  }

  const { method } = event.node.req;

  if (method === 'GET') {
    try {
      const processingGraph = getQuery(event).processingGraph as
        | string
        | undefined;
      const page = parseInt(getQuery(event).page as string) || 1;
      const limit = parseInt(getQuery(event).limit as string) || 100;
      return await getAllServersWithStats(processingGraph, page, limit);
    } catch (error) {
      console.error('Error fetching server stats:', error);
      throw error;
    }
  }
});
