/**
 * ============================================================
 * MODELO - Pedido y Pago (MVC)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001: Gestión de pedidos documentada
 * - IEEE 730: Validación de transacciones
 * - ISO/IEC 25000: Integridad de datos
 * - ISO/IEC 20000: Gestión de servicios
 * ============================================================
 */

import type {
  Pedido,
  DetallePedido,
  Pago,
  MetodoPago,
  DatosPago,
  UsuarioSeguro,
} from './types';
import {
  pedidos,
  detallesPedido,
  pagos,
  productos,
  inventarios,
  usuarios,
  generarId,
  obtenerFechaActual,
} from './database';
import { CartModel } from './cart.model';
import { UserModel } from './user.model';

/**
 * Clase OrderModel - Operaciones de pedidos
 */
export class OrderModel {
  /**
   * Crear pedido desde carrito
   */
  static createFromCart(
    id_usuario: string,
    datosPago: DatosPago
  ): { success: boolean; pedido?: Pedido; message: string } {
    // Obtener carrito del usuario
    const carrito = CartModel.getCartCompleto(id_usuario);

    if (carrito.items.length === 0) {
      return { success: false, message: 'El carrito está vacío' };
    }

    // Validar stock de todos los productos
    for (const item of carrito.items) {
      const inventario = inventarios.find(
        (i) => i.id_producto === item.id_producto
      );
      if (!inventario || inventario.stock < item.cantidad) {
        return {
          success: false,
          message: `Stock insuficiente para: ${item.producto?.nombre}`,
        };
      }
    }

    // Crear pedido
    const nuevoPedido: Pedido = {
      id_pedido: generarId('PED'),
      fecha: obtenerFechaActual(),
      id_usuario,
    };
    pedidos.push(nuevoPedido);

    // Crear detalles del pedido y actualizar inventario
    for (const item of carrito.items) {
      const detalle: DetallePedido = {
        id_detalle: generarId('DTP'),
        cantidad: item.cantidad,
        precio: item.producto?.precio || 0,
        id_pedido: nuevoPedido.id_pedido,
        id_producto: item.id_producto,
      };
      detallesPedido.push(detalle);

      // Actualizar inventario
      const inventario = inventarios.find(
        (i) => i.id_producto === item.id_producto
      );
      if (inventario) {
        inventario.stock -= item.cantidad;
      }
    }

    // Procesar pago (simulado)
    const resultadoPago = PaymentModel.processPayment(
      nuevoPedido.id_pedido,
      datosPago
    );

    if (!resultadoPago.success) {
      // Revertir pedido si el pago falla
      this.delete(nuevoPedido.id_pedido);
      return { success: false, message: resultadoPago.message };
    }

    // Vaciar carrito
    CartModel.clearCart(id_usuario);

    // Retornar pedido completo
    return {
      success: true,
      pedido: this.findById(nuevoPedido.id_pedido),
      message: 'Pedido creado exitosamente',
    };
  }

  /**
   * Obtener pedido por ID con detalles
   */
  static findById(id: string): Pedido | undefined {
    const pedido = pedidos.find((p) => p.id_pedido === id);
    if (!pedido) return undefined;

    const detalles = detallesPedido
      .filter((d) => d.id_pedido === id)
      .map((d) => ({
        ...d,
        producto: productos.find((p) => p.id_producto === d.id_producto),
      }));

    const pago = pagos.find((p) => p.id_pedido === id);
    const usuario = usuarios.find((u) => u.id_usuario === pedido.id_usuario);

    const total = detalles.reduce(
      (sum, d) => sum + d.precio * d.cantidad,
      0
    );

    return {
      ...pedido,
      detalles,
      pago,
      total,
      usuario: usuario ? UserModel.toSafeUser(usuario) : undefined,
    };
  }

  /**
   * Obtener pedidos de un usuario
   */
  static getByUsuario(id_usuario: string): Pedido[] {
    return pedidos
      .filter((p) => p.id_usuario === id_usuario)
      .map((p) => this.findById(p.id_pedido)!)
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
  }

  /**
   * Obtener todos los pedidos (admin)
   */
  static getAll(): Pedido[] {
    return pedidos
      .map((p) => this.findById(p.id_pedido)!)
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
  }

  /**
   * Obtener pedidos de hoy
   */
  static getTodayOrders(): Pedido[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll().filter(
      (p) => p.fecha.split('T')[0] === today
    );
  }

  /**
   * Calcular total de ventas
   */
  static getTotalSales(): number {
    return this.getAll()
      .filter((p) => p.pago?.estado === 'completado')
      .reduce((sum, p) => sum + (p.total || 0), 0);
  }

  /**
   * Eliminar pedido (revertir)
   */
  static delete(id: string): { success: boolean; message: string } {
    // Restaurar inventario
    const detalles = detallesPedido.filter((d) => d.id_pedido === id);
    for (const detalle of detalles) {
      const inventario = inventarios.find(
        (i) => i.id_producto === detalle.id_producto
      );
      if (inventario) {
        inventario.stock += detalle.cantidad;
      }
    }

    // Eliminar detalles
    const detalleIndices: number[] = [];
    detallesPedido.forEach((d, index) => {
      if (d.id_pedido === id) detalleIndices.push(index);
    });
    detalleIndices.reverse().forEach((i) => detallesPedido.splice(i, 1));

    // Eliminar pago
    const pagoIndex = pagos.findIndex((p) => p.id_pedido === id);
    if (pagoIndex !== -1) pagos.splice(pagoIndex, 1);

    // Eliminar pedido
    const pedidoIndex = pedidos.findIndex((p) => p.id_pedido === id);
    if (pedidoIndex !== -1) pedidos.splice(pedidoIndex, 1);

    return { success: true, message: 'Pedido eliminado' };
  }

  /**
   * Contar pedidos
   */
  static count(): number {
    return pedidos.length;
  }
}

/**
 * Clase PaymentModel - Operaciones de pagos
 */
export class PaymentModel {
  /**
   * Procesar pago (simulado)
   */
  static processPayment(
    id_pedido: string,
    datosPago: DatosPago
  ): { success: boolean; pago?: Pago; message: string } {
    // Validar datos según método
    const validacion = this.validatePaymentData(datosPago);
    if (!validacion.success) {
      return validacion;
    }

    // Simular procesamiento (90% éxito)
    const exito = Math.random() > 0.1;

    const nuevoPago: Pago = {
      id_pago: generarId('PAG'),
      metodo: datosPago.metodo,
      estado: exito ? 'completado' : 'fallido',
      id_pedido,
    };

    pagos.push(nuevoPago);

    if (!exito) {
      return {
        success: false,
        pago: nuevoPago,
        message: 'El pago fue rechazado. Por favor, intente nuevamente.',
      };
    }

    return {
      success: true,
      pago: nuevoPago,
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
  static findByPedido(id_pedido: string): Pago | undefined {
    return pagos.find((p) => p.id_pedido === id_pedido);
  }

  /**
   * Actualizar estado de pago
   */
  static updateStatus(
    id_pago: string,
    estado: Pago['estado']
  ): { success: boolean; message: string } {
    const pago = pagos.find((p) => p.id_pago === id_pago);
    if (!pago) {
      return { success: false, message: 'Pago no encontrado' };
    }

    pago.estado = estado;
    return { success: true, message: 'Estado actualizado' };
  }
}
