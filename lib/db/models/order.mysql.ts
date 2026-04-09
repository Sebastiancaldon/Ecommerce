/**
 * ============================================================
 * MODELO - Pedido y Pago con MySQL (MVC)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001:2015 - Gestión de pedidos documentada
 * - IEEE 730 - Validación de transacciones
 * - ISO/IEC 25000 (SQuaRE) - Integridad de datos
 * - ISO/IEC 20000 - Gestión de servicios
 * - ISO/IEC 27001 - Seguridad en transacciones
 * - PCI-DSS - Estándares de seguridad en pagos (referencia)
 * ============================================================
 */

import { query, transaction } from '../mysql';
import type {
  Pedido,
  DetallePedido,
  Pago,
  DatosPago,
  UsuarioSeguro,
} from '@/lib/models/types';
import { CartModelMySQL } from './cart.mysql';
import { UserModelMySQL } from './user.mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Interfaces para resultados de MySQL
 */
interface PedidoRow extends RowDataPacket {
  id_pedido: string;
  fecha: string;
  id_usuario: string;
}

interface DetallePedidoRow extends RowDataPacket {
  id_detalle: string;
  cantidad: number;
  precio: number;
  id_pedido: string;
  id_producto: string;
  producto_nombre?: string;
  producto_imagen?: string;
}

interface PagoRow extends RowDataPacket {
  id_pago: string;
  metodo: string;
  estado: string;
  id_pedido: string;
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
 * Clase OrderModel - Operaciones de pedidos con MySQL
 */
export class OrderModelMySQL {
  /**
   * Crear pedido desde carrito
   */
  static async createFromCart(
    id_usuario: string,
    datosPago: DatosPago
  ): Promise<{ success: boolean; pedido?: Pedido; message: string }> {
    // Obtener carrito del usuario
    const carrito = await CartModelMySQL.getCartCompleto(id_usuario);

    if (carrito.items.length === 0) {
      return { success: false, message: 'El carrito está vacío' };
    }

    // Validar stock de todos los productos
    for (const item of carrito.items) {
      const inventario = await query<RowDataPacket[]>(
        'SELECT stock FROM inventario WHERE id_producto = ?',
        [item.id_producto]
      );

      if (inventario.length === 0 || inventario[0].stock < item.cantidad) {
        return {
          success: false,
          message: `Stock insuficiente para: ${item.producto?.nombre}`,
        };
      }
    }

    const id_pedido = generarId('PED');

    try {
      // Iniciar transacción
      const queries: { sql: string; params: unknown[] }[] = [];

      // Crear pedido
      queries.push({
        sql: 'INSERT INTO pedido (id_pedido, id_usuario) VALUES (?, ?)',
        params: [id_pedido, id_usuario],
      });

      // Crear detalles y actualizar inventario
      for (const item of carrito.items) {
        const id_detalle = generarId('DTP');

        queries.push({
          sql: `INSERT INTO detalle_pedido (id_detalle, cantidad, precio, id_pedido, id_producto)
                VALUES (?, ?, ?, ?, ?)`,
          params: [id_detalle, item.cantidad, item.producto?.precio || 0, id_pedido, item.id_producto],
        });

        queries.push({
          sql: 'UPDATE inventario SET stock = stock - ? WHERE id_producto = ?',
          params: [item.cantidad, item.id_producto],
        });
      }

      await transaction(queries);

      // Procesar pago
      const resultadoPago = await PaymentModelMySQL.processPayment(id_pedido, datosPago);

      if (!resultadoPago.success) {
        // Revertir pedido si el pago falla
        await this.delete(id_pedido);
        return { success: false, message: resultadoPago.message };
      }

      // Vaciar carrito
      await CartModelMySQL.clearCart(id_usuario);

      // Retornar pedido completo
      const pedido = await this.findById(id_pedido);

      return {
        success: true,
        pedido: pedido || undefined,
        message: 'Pedido creado exitosamente',
      };
    } catch (error) {
      console.error('[OrderModel] Error al crear pedido:', error);
      return { success: false, message: 'Error al procesar el pedido' };
    }
  }

  /**
   * Obtener pedido por ID con detalles
   */
  static async findById(id: string): Promise<Pedido | null> {
    const pedidos = await query<PedidoRow[]>(
      'SELECT * FROM pedido WHERE id_pedido = ?',
      [id]
    );

    if (pedidos.length === 0) return null;

    const pedido = pedidos[0];

    // Obtener detalles
    const detalles = await query<DetallePedidoRow[]>(
      `SELECT dp.*, p.nombre as producto_nombre, p.imagen as producto_imagen
       FROM detalle_pedido dp
       LEFT JOIN producto p ON dp.id_producto = p.id_producto
       WHERE dp.id_pedido = ?`,
      [id]
    );

    // Obtener pago
    const pagos = await query<PagoRow[]>(
      'SELECT * FROM pago WHERE id_pedido = ?',
      [id]
    );

    // Obtener usuario
    const usuario = await UserModelMySQL.findById(pedido.id_usuario);
    const usuarioSeguro = usuario ? await UserModelMySQL.toSafeUser(usuario) : undefined;

    const detallesFormateados: DetallePedido[] = detalles.map((d) => ({
      id_detalle: d.id_detalle,
      cantidad: d.cantidad,
      precio: Number(d.precio),
      id_pedido: d.id_pedido,
      id_producto: d.id_producto,
      producto: d.producto_nombre
        ? {
            id_producto: d.id_producto,
            nombre: d.producto_nombre,
            descripcion: '',
            precio: Number(d.precio),
            id_categoria: '',
            imagen: d.producto_imagen,
          }
        : undefined,
    }));

    const total = detallesFormateados.reduce(
      (sum, d) => sum + d.precio * d.cantidad,
      0
    );

    return {
      id_pedido: pedido.id_pedido,
      fecha: pedido.fecha,
      id_usuario: pedido.id_usuario,
      detalles: detallesFormateados,
      pago: pagos.length > 0
        ? {
            id_pago: pagos[0].id_pago,
            metodo: pagos[0].metodo as Pago['metodo'],
            estado: pagos[0].estado as Pago['estado'],
            id_pedido: pagos[0].id_pedido,
          }
        : undefined,
      total,
      usuario: usuarioSeguro,
    };
  }

  /**
   * Obtener pedidos de un usuario
   */
  static async getByUsuario(id_usuario: string): Promise<Pedido[]> {
    const rows = await query<PedidoRow[]>(
      'SELECT * FROM pedido WHERE id_usuario = ? ORDER BY fecha DESC',
      [id_usuario]
    );

    const pedidos: Pedido[] = [];
    for (const row of rows) {
      const pedido = await this.findById(row.id_pedido);
      if (pedido) pedidos.push(pedido);
    }

    return pedidos;
  }

  /**
   * Obtener todos los pedidos (admin)
   */
  static async getAll(): Promise<Pedido[]> {
    const rows = await query<PedidoRow[]>(
      'SELECT * FROM pedido ORDER BY fecha DESC'
    );

    const pedidos: Pedido[] = [];
    for (const row of rows) {
      const pedido = await this.findById(row.id_pedido);
      if (pedido) pedidos.push(pedido);
    }

    return pedidos;
  }

  /**
   * Obtener pedidos de hoy
   */
  static async getTodayOrders(): Promise<Pedido[]> {
    const rows = await query<PedidoRow[]>(
      'SELECT * FROM pedido WHERE DATE(fecha) = CURDATE() ORDER BY fecha DESC'
    );

    const pedidos: Pedido[] = [];
    for (const row of rows) {
      const pedido = await this.findById(row.id_pedido);
      if (pedido) pedidos.push(pedido);
    }

    return pedidos;
  }

  /**
   * Calcular total de ventas
   */
  static async getTotalSales(): Promise<number> {
    const result = await query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(dp.precio * dp.cantidad), 0) as total
       FROM detalle_pedido dp
       INNER JOIN pago p ON dp.id_pedido = p.id_pedido
       WHERE p.estado = 'completado'`
    );

    return Number(result[0]?.total) || 0;
  }

  /**
   * Eliminar pedido (revertir)
   */
  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Restaurar inventario
      const detalles = await query<DetallePedidoRow[]>(
        'SELECT * FROM detalle_pedido WHERE id_pedido = ?',
        [id]
      );

      const queries: { sql: string; params: unknown[] }[] = [];

      for (const detalle of detalles) {
        queries.push({
          sql: 'UPDATE inventario SET stock = stock + ? WHERE id_producto = ?',
          params: [detalle.cantidad, detalle.id_producto],
        });
      }

      // Eliminar pago
      queries.push({
        sql: 'DELETE FROM pago WHERE id_pedido = ?',
        params: [id],
      });

      // Eliminar detalles
      queries.push({
        sql: 'DELETE FROM detalle_pedido WHERE id_pedido = ?',
        params: [id],
      });

      // Eliminar pedido
      queries.push({
        sql: 'DELETE FROM pedido WHERE id_pedido = ?',
        params: [id],
      });

      await transaction(queries);

      return { success: true, message: 'Pedido eliminado' };
    } catch (error) {
      console.error('[OrderModel] Error al eliminar pedido:', error);
      return { success: false, message: 'Error al eliminar pedido' };
    }
  }

  /**
   * Contar pedidos
   */
  static async count(): Promise<number> {
    const result = await query<RowDataPacket[]>('SELECT COUNT(*) as count FROM pedido');
    return result[0]?.count || 0;
  }
}

/**
 * Clase PaymentModel - Operaciones de pagos con MySQL
 */
export class PaymentModelMySQL {
  /**
   * Procesar pago (simulado)
   */
  static async processPayment(
    id_pedido: string,
    datosPago: DatosPago
  ): Promise<{ success: boolean; pago?: Pago; message: string }> {
    // Validar datos según método
    const validacion = this.validatePaymentData(datosPago);
    if (!validacion.success) {
      return validacion;
    }

    // Simular procesamiento (90% éxito)
    const exito = Math.random() > 0.1;

    const id_pago = generarId('PAG');
    const estado = exito ? 'completado' : 'fallido';

    await query<ResultSetHeader>(
      'INSERT INTO pago (id_pago, metodo, estado, id_pedido) VALUES (?, ?, ?, ?)',
      [id_pago, datosPago.metodo, estado, id_pedido]
    );

    const pago: Pago = {
      id_pago,
      metodo: datosPago.metodo,
      estado: estado as Pago['estado'],
      id_pedido,
    };

    if (!exito) {
      return {
        success: false,
        pago,
        message: 'El pago fue rechazado. Por favor, intente nuevamente.',
      };
    }

    return {
      success: true,
      pago,
      message: 'Pago procesado exitosamente',
    };
  }

  /**
   * Validar datos de pago
   */
  static validatePaymentData(
    datos: DatosPago
  ): { success: boolean; message: string } {
    switch (datos.metodo) {
      case 'tarjeta':
        if (!datos.numero_tarjeta || datos.numero_tarjeta.length < 16) {
          return { success: false, message: 'Número de tarjeta inválido' };
        }
        if (!datos.nombre_titular) {
          return { success: false, message: 'Nombre del titular requerido' };
        }
        if (!datos.fecha_expiracion) {
          return { success: false, message: 'Fecha de expiración requerida' };
        }
        if (!datos.cvv || datos.cvv.length < 3) {
          return { success: false, message: 'CVV inválido' };
        }
        break;

      case 'paypal':
        if (!datos.email_paypal) {
          return { success: false, message: 'Email de PayPal requerido' };
        }
        break;

      case 'transferencia':
        if (!datos.banco) {
          return { success: false, message: 'Seleccione un banco' };
        }
        break;
    }

    return { success: true, message: 'Datos válidos' };
  }

  /**
   * Obtener pago por ID de pedido
   */
  static async findByPedido(id_pedido: string): Promise<Pago | null> {
    const rows = await query<PagoRow[]>(
      'SELECT * FROM pago WHERE id_pedido = ?',
      [id_pedido]
    );

    if (rows.length === 0) return null;

    return {
      id_pago: rows[0].id_pago,
      metodo: rows[0].metodo as Pago['metodo'],
      estado: rows[0].estado as Pago['estado'],
      id_pedido: rows[0].id_pedido,
    };
  }

  /**
   * Actualizar estado de pago
   */
  static async updateStatus(
    id_pago: string,
    estado: Pago['estado']
  ): Promise<{ success: boolean; message: string }> {
    const result = await query<ResultSetHeader>(
      'UPDATE pago SET estado = ? WHERE id_pago = ?',
      [estado, id_pago]
    );

    if (result.affectedRows === 0) {
      return { success: false, message: 'Pago no encontrado' };
    }

    return { success: true, message: 'Estado actualizado' };
  }
}
