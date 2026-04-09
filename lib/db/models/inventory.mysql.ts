/**
 * ============================================================
 * MODELO - Inventario con MySQL (MVC)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001:2015 - Control de inventario documentado
 * - ISO/IEC 25000 (SQuaRE) - Gestión de recursos
 * - CMMI Nivel 2 - Gestión de requisitos
 * - ISO/IEC 12207 - Procesos del ciclo de vida
 * ============================================================
 */

import { query } from '../mysql';
import type { Inventario, EstadisticasDashboard, Pedido } from '@/lib/models/types';
import { ProductModelMySQL, CategoryModelMySQL } from './product.mysql';
import { OrderModelMySQL } from './order.mysql';
import { UserModelMySQL } from './user.mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Interfaces para resultados de MySQL
 */
interface InventarioRow extends RowDataPacket {
  id_inventario: string;
  stock: number;
  id_producto: string;
  producto_nombre?: string;
  producto_precio?: number;
  producto_imagen?: string;
  id_categoria?: string;
}

/**
 * Clase InventoryModel - Gestión de inventario con MySQL
 */
export class InventoryModelMySQL {
  /**
   * Obtener todo el inventario con productos
   */
  static async getAll(): Promise<Inventario[]> {
    const rows = await query<InventarioRow[]>(
      `SELECT i.*, p.nombre as producto_nombre, p.precio as producto_precio,
              p.imagen as producto_imagen, p.id_categoria
       FROM inventario i
       LEFT JOIN producto p ON i.id_producto = p.id_producto
       ORDER BY p.nombre`
    );

    return rows.map((row) => ({
      id_inventario: row.id_inventario,
      stock: row.stock,
      id_producto: row.id_producto,
      producto: row.producto_nombre
        ? {
            id_producto: row.id_producto,
            nombre: row.producto_nombre,
            descripcion: '',
            precio: Number(row.producto_precio),
            id_categoria: row.id_categoria || '',
            imagen: row.producto_imagen,
          }
        : undefined,
    }));
  }

  /**
   * Obtener inventario por ID de producto
   */
  static async findByProducto(id_producto: string): Promise<Inventario | null> {
    const rows = await query<InventarioRow[]>(
      `SELECT i.*, p.nombre as producto_nombre, p.precio as producto_precio,
              p.imagen as producto_imagen, p.id_categoria
       FROM inventario i
       LEFT JOIN producto p ON i.id_producto = p.id_producto
       WHERE i.id_producto = ?`,
      [id_producto]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id_inventario: row.id_inventario,
      stock: row.stock,
      id_producto: row.id_producto,
      producto: row.producto_nombre
        ? {
            id_producto: row.id_producto,
            nombre: row.producto_nombre,
            descripcion: '',
            precio: Number(row.producto_precio),
            id_categoria: row.id_categoria || '',
            imagen: row.producto_imagen,
          }
        : undefined,
    };
  }

  /**
   * Actualizar stock
   */
  static async updateStock(
    id_producto: string,
    nuevoStock: number
  ): Promise<{ success: boolean; inventario?: Inventario; message: string }> {
    if (nuevoStock < 0) {
      return { success: false, message: 'El stock no puede ser negativo' };
    }

    const result = await query<ResultSetHeader>(
      'UPDATE inventario SET stock = ? WHERE id_producto = ?',
      [nuevoStock, id_producto]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Producto no encontrado en inventario' };
    }

    const inventario = await this.findByProducto(id_producto);

    return {
      success: true,
      inventario: inventario || undefined,
      message: 'Stock actualizado',
    };
  }

  /**
   * Agregar stock
   */
  static async addStock(
    id_producto: string,
    cantidad: number
  ): Promise<{ success: boolean; inventario?: Inventario; message: string }> {
    if (cantidad <= 0) {
      return { success: false, message: 'La cantidad debe ser mayor a 0' };
    }

    const result = await query<ResultSetHeader>(
      'UPDATE inventario SET stock = stock + ? WHERE id_producto = ?',
      [cantidad, id_producto]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Producto no encontrado en inventario' };
    }

    const inventario = await this.findByProducto(id_producto);

    return {
      success: true,
      inventario: inventario || undefined,
      message: `Se agregaron ${cantidad} unidades`,
    };
  }

  /**
   * Restar stock
   */
  static async removeStock(
    id_producto: string,
    cantidad: number
  ): Promise<{ success: boolean; inventario?: Inventario; message: string }> {
    if (cantidad <= 0) {
      return { success: false, message: 'La cantidad debe ser mayor a 0' };
    }

    // Verificar stock actual
    const inventario = await this.findByProducto(id_producto);
    if (!inventario) {
      return { success: false, message: 'Producto no encontrado en inventario' };
    }

    if (inventario.stock < cantidad) {
      return { success: false, message: 'Stock insuficiente' };
    }

    await query<ResultSetHeader>(
      'UPDATE inventario SET stock = stock - ? WHERE id_producto = ?',
      [cantidad, id_producto]
    );

    const inventarioActualizado = await this.findByProducto(id_producto);

    return {
      success: true,
      inventario: inventarioActualizado || undefined,
      message: `Se restaron ${cantidad} unidades`,
    };
  }

  /**
   * Obtener productos con bajo stock (menos de threshold)
   */
  static async getLowStock(threshold: number = 10): Promise<Inventario[]> {
    const rows = await query<InventarioRow[]>(
      `SELECT i.*, p.nombre as producto_nombre, p.precio as producto_precio,
              p.imagen as producto_imagen, p.id_categoria
       FROM inventario i
       LEFT JOIN producto p ON i.id_producto = p.id_producto
       WHERE i.stock < ?
       ORDER BY i.stock ASC`,
      [threshold]
    );

    return rows.map((row) => ({
      id_inventario: row.id_inventario,
      stock: row.stock,
      id_producto: row.id_producto,
      producto: row.producto_nombre
        ? {
            id_producto: row.id_producto,
            nombre: row.producto_nombre,
            descripcion: '',
            precio: Number(row.producto_precio),
            id_categoria: row.id_categoria || '',
            imagen: row.producto_imagen,
          }
        : undefined,
    }));
  }

  /**
   * Obtener productos sin stock
   */
  static async getOutOfStock(): Promise<Inventario[]> {
    return this.getLowStock(1);
  }

  /**
   * Verificar disponibilidad
   */
  static async checkAvailability(
    id_producto: string,
    cantidadRequerida: number
  ): Promise<boolean> {
    const rows = await query<RowDataPacket[]>(
      'SELECT stock FROM inventario WHERE id_producto = ?',
      [id_producto]
    );

    return rows.length > 0 && rows[0].stock >= cantidadRequerida;
  }
}

/**
 * Clase DashboardModel - Estadísticas para admin con MySQL
 */
export class DashboardModelMySQL {
  /**
   * Obtener todas las estadísticas del dashboard
   */
  static async getStats(): Promise<EstadisticasDashboard> {
    // Total de ventas
    const total_ventas = await OrderModelMySQL.getTotalSales();

    // Pedidos de hoy
    const pedidosHoy = await OrderModelMySQL.getTodayOrders();
    const pedidos_hoy = pedidosHoy.length;

    // Total de productos
    const productos_total = await ProductModelMySQL.count();

    // Usuarios registrados
    const usuarios_registrados = await UserModelMySQL.count();

    // Productos con bajo stock
    const productosBajoStock = await InventoryModelMySQL.getLowStock();
    const productos_bajo_stock = productosBajoStock.length;

    // Ventas por categoría
    const ventas_por_categoria = await this.getSalesByCategory();

    // Pedidos recientes (últimos 5)
    const todosPedidos = await OrderModelMySQL.getAll();
    const pedidos_recientes = todosPedidos.slice(0, 5);

    return {
      total_ventas,
      pedidos_hoy,
      productos_total,
      usuarios_registrados,
      productos_bajo_stock,
      ventas_por_categoria,
      pedidos_recientes,
    };
  }

  /**
   * Obtener ventas por categoría
   */
  static async getSalesByCategory(): Promise<{ categoria: string; ventas: number }[]> {
    const rows = await query<RowDataPacket[]>(
      `SELECT c.nombre as categoria, COALESCE(SUM(dp.precio * dp.cantidad), 0) as ventas
       FROM categoria c
       LEFT JOIN producto p ON c.id_categoria = p.id_categoria
       LEFT JOIN detalle_pedido dp ON p.id_producto = dp.id_producto
       LEFT JOIN pago pg ON dp.id_pedido = pg.id_pedido AND pg.estado = 'completado'
       GROUP BY c.id_categoria, c.nombre
       ORDER BY ventas DESC`
    );

    return rows.map((row) => ({
      categoria: row.categoria,
      ventas: Number(row.ventas) || 0,
    }));
  }

  /**
   * Obtener productos más vendidos
   */
  static async getTopProducts(limit: number = 5): Promise<{ producto: string; cantidad: number }[]> {
    const rows = await query<RowDataPacket[]>(
      `SELECT p.nombre as producto, COALESCE(SUM(dp.cantidad), 0) as cantidad
       FROM producto p
       LEFT JOIN detalle_pedido dp ON p.id_producto = dp.id_producto
       LEFT JOIN pago pg ON dp.id_pedido = pg.id_pedido AND pg.estado = 'completado'
       GROUP BY p.id_producto, p.nombre
       HAVING cantidad > 0
       ORDER BY cantidad DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map((row) => ({
      producto: row.producto,
      cantidad: Number(row.cantidad) || 0,
    }));
  }
}
