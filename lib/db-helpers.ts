import { query } from "./db";

// Helper to convert Supabase-style queries to PostgreSQL
export async function dbSelect(table: string, conditions?: { where?: string; params?: any[]; orderBy?: string }) {
  let sql = `SELECT * FROM ${table}`;
  const params = conditions?.params || [];
  
  if (conditions?.where) {
    sql += ` WHERE ${conditions.where}`;
  }
  if (conditions?.orderBy) {
    sql += ` ORDER BY ${conditions.orderBy}`;
  }
  
  const result = await query(sql, params);
  return { data: result.rows, error: null };
}

export async function dbInsert(table: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const columns = keys.join(", ");
  
  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await query(sql, values);
  return { data: result.rows[0], error: null };
}

export async function dbUpdate(table: string, id: number | string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
  const values = [...Object.values(data), id];
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
  const result = await query(sql, values);
  return { data: result.rows[0], error: null };
}