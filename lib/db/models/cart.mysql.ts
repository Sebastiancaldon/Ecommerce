/**
 * ============================================================
 * MODELO - Carrito de Compras con MySQL (MVC)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001:2015 - Gestión de carrito documentada
 * - IEEE 730 - Validación de cantidades y stock
 * - ISO/IEC 25000 (SQuaRE) - Funcionalidad completa
 * - ISO/IEC 20000 - Gestión de servicios IT
 * - CMMI Nivel 2 - Control de proceso de compra
 * ============================================================
 */

import { query, transaction } from '../mysql';
import type { Carrito, DetalleCarrito, CarritoCompleto, Producto } from '@/lib/models/types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Interfaces para resultados de MySQL
 */
interface CarritoRow extends Carrito, RowDataPacket {}
interface DetalleCarritoRow extends DetalleCarrito, RowDataPacket {
  producto_nombre?: string;
  producto_precio?: number;
  producto_imagen?: string;
  producto_descripcion?: string;
  id_categoria?: string;
}
interface InventarioRow extends RowDataPacket {
  stock: number;
}

/**
 * Generador de IDs únicos (máximo 10 caracteres para MySQL VARCHAR(10))
 */
function generarId(prefijo: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 7; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefijo.substring(0, 3)}${random}`;
}

/**
 * Clase CartModel - Operaciones del carrito de compras con MySQL
 */
export class CartModelMySQL {
  /**
   * Obtener o crear carrito de usuario
   */
  static async getOrCreateCart(id_usuario: string): Promise<Carrito> {
    const rows = await query<CarritoRow[]>(
      'SELECT * FROM carrito WHERE id_usuario = ?',
      [id_usuario]
    );

    if (rows.length > 0) {
      return rows[0];
    }

    const id_carrito = generarId('CRT');
    await query<ResultSetHeader>(
      'INSERT INTO carrito (id_carrito, id_usuario) VALUES (?, ?)',
      [id_carrito, id_usuario]
    );

    return { id_carrito, id_usuario };
  }

  /**
   * Obtener carrito completo con detalles
   */
  static async getCartCompleto(id_usuario: string): Promise<CarritoCompleto> {
    const carrito = await this.getOrCreateCart(id_usuario);

    const rows = await query<DetalleCarritoRow[]>(
      `SELECT dc.*, p.nombre as producto_nombre, p.precio as producto_precio,
              p.imagen as producto_imagen, p.descripcion as producto_descripcion,
              p.id_categoria
       FROM detalle_carrito dc
       LEFT JOIN producto p ON dc.id_producto = p.id_producto
       WHERE dc.id_carrito = ?`,
      [carrito.id_carrito]
    );

    const items: DetalleCarrito[] = rows.map((row) => ({
      id_detalle: row.id_detalle,
      cantidad: row.cantidad,
      id_carrito: row.id_carrito,
      id_producto: row.id_producto,
      producto: row.producto_nombre
        ? {
            id_producto: row.id_producto,
            nombre: row.producto_nombre,
            descripcion: row.producto_descripcion || '',
            precio: Number(row.producto_precio),
            id_categoria: row.id_categoria || '',
            imagen: row.producto_imagen,
          }
        : undefined,
    }));

    const total = items.reduce((sum, item) => {
      return sum + (item.producto?.precio || 0) * item.cantidad;
    }, 0);

    const cantidad_items = items.reduce((sum, item) => sum + item.cantidad, 0);

    return {
      id_carrito: carrito.id_carrito,
      id_usuario: carrito.id_usuario,
      items,
      total,
      cantidad_items,
    };
  }

  /**
   * Agregar producto al carrito
   */
  static async addItem(
    id_usuario: string,
    id_producto: string,
    cantidad: number = 1
  ): Promise<{ success: boolean; carrito?: CarritoCompleto; message: string }> {
    // Validar producto
    const productos = await query<RowDataPacket[]>(
      'SELECT * FROM producto WHERE id_producto = ?',
      [id_producto]
    );

    if (productos.length === 0) {
      return { success: false, message: 'Producto no encontrado' };
    }

    // Validar stock
    const inventario = await query<InventarioRow[]>(
      'SELECT stock FROM inventario WHERE id_producto = ?',
      [id_producto]
    );

    if (inventario.length === 0 || inventario[0].stock < cantidad) {
      return { success: false, message: 'Stock insuficiente' };
    }

    const carrito = await this.getOrCreateCart(id_usuario);

    // Buscar si ya existe el producto en el carrito
    const detalleExistente = await query<DetalleCarritoRow[]>(
      'SELECT * FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ?',
      [carrito.id_carrito, id_producto]
    );

    if (detalleExistente.length > 0) {
      const nuevaCantidad = detalleExistente[0].cantidad + cantidad;

      // Validar nuevo total con stock
      if (inventario[0].stock < nuevaCantidad) {
        return { success: false, message: 'Stock insuficiente' };
      }

      await query<ResultSetHeader>(
        'UPDATE detalle_carrito SET cantidad = ? WHERE id_detalle = ?',
        [nuevaCantidad, detalleExistente[0].id_detalle]
      );
    } else {
      const id_detalle = generarId('DTC');
      await query<ResultSetHeader>(
        'INSERT INTO detalle_carrito (id_detalle, cantidad, id_carrito, id_producto) VALUES (?, ?, ?, ?)',
        [id_detalle, cantidad, carrito.id_carrito, id_producto]
      );
    }

    const carritoActualizado = await this.getCartCompleto(id_usuario);

    return {
      success: true,
      carrito: carritoActualizado,
      message: 'Producto agregado al carrito',
    };
  }

  /**
   * Actualizar cantidad de un item
   */
  static async updateQuantity(
    id_usuario: string,
    id_producto: string,
    cantidad: number
  ): Promise<{ success: boolean; carrito?: CarritoCompleto; message: string }> {
    const carrito = await this.getOrCreateCart(id_usuario);

    const detalle = await query<DetalleCarritoRow[]>(
      'SELECT * FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ?',
      [carrito.id_carrito, id_producto]
    );

    if (detalle.length === 0) {
      return { success: false, message: 'Producto no está en el carrito' };
    }

    if (cantidad <= 0) {
      return this.removeItem(id_usuario, id_producto);
    }

    // Validar stock
    const inventario = await query<InventarioRow[]>(
      'SELECT stock FROM inventario WHERE id_producto = ?',
      [id_producto]
    );

    if (inventario.length === 0 || inventario[0].stock < cantidad) {
      return { success: false, message: 'Stock insuficiente' };
    }

    await query<ResultSetHeader>(
      'UPDATE detalle_carrito SET cantidad = ? WHERE id_detalle = ?',
      [cantidad, detalle[0].id_detalle]
    );

    const carritoActualizado = await this.getCartCompleto(id_usuario);

    return {
      success: true,
      carrito: carritoActualizado,
      message: 'Cantidad actualizada',
    };
  }

  /**
   * Eliminar item del carrito
   */
  static async removeItem(
    id_usuario: string,
    id_producto: string
  ): Promise<{ success: boolean; carrito?: CarritoCompleto; message: string }> {
    const carrito = await this.getOrCreateCart(id_usuario);

    const result = await query<ResultSetHeader>(
      'DELETE FROM detalle_carrito WHERE id_carrito = ? AND id_producto = ?',
      [carrito.id_carrito, id_producto]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Producto no está en el carrito' };
    }

    const carritoActualizado = await this.getCartCompleto(id_usuario);

    return {
      success: true,
      carrito: carritoActualizado,
      message: 'Producto eliminado del carrito',
    };
  }

  /**
   * Vaciar carrito
   */
  static async clearCart(id_usuario: string): Promise<{ success: boolean; message: string }> {
    const carrito = await this.getOrCreateCart(id_usuario);

    await query<ResultSetHeader>(
      'DELETE FROM detalle_carrito WHERE id_carrito = ?',
      [carrito.id_carrito]
    );

    return { success: true, message: 'Carrito vaciado' };
  }

  /**
   * Contar items en carrito
   */
  static async countItems(id_usuario: string): Promise<number> {
    const rows = await query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(dc.cantidad), 0) as total
       FROM carrito c
       LEFT JOIN detalle_carrito dc ON c.id_carrito = dc.id_carrito
       WHERE c.id_usuario = ?`,
      [id_usuario]
    );

    return rows[0]?.total || 0;
  }

  /**
   * Obtener total del carrito
   */
  static async getTotal(id_usuario: string): Promise<number> {
    const carritoCompleto = await this.getCartCompleto(id_usuario);
    return carritoCompleto.total;
  }
}
