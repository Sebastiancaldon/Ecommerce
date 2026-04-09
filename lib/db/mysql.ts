/**
 * ============================================================
 * CONFIGURACIÓN DE CONEXIÓN A MYSQL
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001:2015 - Gestión de calidad en configuración
 * - ISO/IEC 27001 - Seguridad de la información
 * - ISO/IEC 25000 (SQuaRE) - Calidad del producto software
 * - CMMI Nivel 2 - Gestión de configuración
 * ============================================================
 * 
 * CONFIGURACIÓN:
 * Establece las siguientes variables de entorno en tu archivo .env.local:
 * 
 * MYSQL_HOST=localhost
 * MYSQL_PORT=3306
 * MYSQL_USER=tu_usuario
 * MYSQL_PASSWORD=tu_contraseña
 * MYSQL_DATABASE=ecommerce_ropa
 * 
 * ============================================================
 */

import mysql from 'mysql2/promise';

/**
 * Configuración del pool de conexiones MySQL
 * Implementa el patrón Singleton para gestión eficiente de conexiones
 */
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'ecommerce_ropa',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Ejecutar una consulta SQL con parámetros
 * @param sql - Consulta SQL parametrizada
 * @param params - Parámetros de la consulta
 * @returns Resultado de la consulta
 */
export async function query<T>(sql: string, params?: unknown[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('[MySQL Error]:', error);
    throw error;
  }
}

/**
 * Obtener una conexión individual del pool
 * Útil para transacciones
 */
export async function getConnection() {
  return await pool.getConnection();
}

/**
 * Ejecutar múltiples consultas en una transacción
 * @param queries - Array de objetos con sql y params
 * @returns Resultados de todas las consultas
 */
export async function transaction<T>(
  queries: { sql: string; params?: unknown[] }[]
): Promise<T[]> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results: T[] = [];
    for (const q of queries) {
      const [rows] = await connection.execute(q.sql, q.params);
      results.push(rows as T);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('[MySQL Transaction Error]:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Verificar conexión a la base de datos
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('[MySQL] Conexión exitosa a la base de datos');
    return true;
  } catch (error) {
    console.error('[MySQL] Error de conexión:', error);
    return false;
  }
}

/**
 * Cerrar el pool de conexiones (para cleanup)
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
