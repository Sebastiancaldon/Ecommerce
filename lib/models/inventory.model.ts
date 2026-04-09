/**
 * ============================================================
 * MODELO - Inventario (MVC)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001: Control de inventario
 * - ISO/IEC 25000: Gestión de recursos
 * - CMMI: Nivel 2 - Gestión de requisitos
 * ============================================================
 */

import type { Inventario, Producto, EstadisticasDashboard } from './types';
import { inventarios, productos, categorias, pedidos, detallesPedido, usuarios, pagos } from './database';
import { ProductModel } from './product.model';
import { OrderModel } from './order.model';

/**
 * Clase InventoryModel - Gestión de inventario
 */
export class InventoryModel {
  /**
   * Obtener todo el inventario con productos
   */
  static getAll(): Inventario[] {
    return inventarios.map((inv) => ({
      ...inv,
      producto: productos.find((p) => p.id_producto === inv.id_producto),
    }));
  }

  /**
   * Obtener inventario por ID de producto
   */
  static findByProducto(id_producto: string): Inventario | undefined {
    const inventario = inventarios.find((i) => i.id_producto === id_producto);
    if (inventario) {
      return {
        ...inventario,
        producto: productos.find((p) => p.id_producto === id_producto),
      };
    }
    return undefined;
  }

  /**
   * Actualizar stock
   */
  static updateStock(
    id_producto: string,
    nuevoStock: number
  ): { success: boolean; inventario?: Inventario; message: string } {
    const inventario = inventarios.find((i) => i.id_producto === id_producto);

    if (!inventario) {
      return { success: false, message: 'Producto no encontrado en inventario' };
    }

    if (nuevoStock < 0) {
      return { success: false, message: 'El stock no puede ser negativo' };
    }

    inventario.stock = nuevoStock;

    return {
      success: true,
      inventario: this.findByProducto(id_producto),
      message: 'Stock actualizado',
    };
  }

  /**
   * Agregar stock
   */
  static addStock(
    id_producto: string,
    cantidad: number
  ): { success: boolean; inventario?: Inventario; message: string } {
    const inventario = inventarios.find((i) => i.id_producto === id_producto);

    if (!inventario) {
      return { success: false, message: 'Producto no encontrado en inventario' };
    }

    if (cantidad <= 0) {
      return { success: false, message: 'La cantidad debe ser mayor a 0' };
    }

    inventario.stock += cantidad;

    return {
      success: true,
      inventario: this.findByProducto(id_producto),
      message: `Se agregaron ${cantidad} unidades`,
    };
  }

  /**
   * Restar stock
   */
  static removeStock(
    id_producto: string,
    cantidad: number
  ): { success: boolean; inventario?: Inventario; message: string } {
    const inventario = inventarios.find((i) => i.id_producto === id_producto);

    if (!inventario) {
      return { success: false, message: 'Producto no encontrado en inventario' };
    }

    if (cantidad <= 0) {
      return { success: false, message: 'La cantidad debe ser mayor a 0' };
    }

    if (inventario.stock < cantidad) {
      return { success: false, message: 'Stock insuficiente' };
    }

    inventario.stock -= cantidad;

    return {
      success: true,
      inventario: this.findByProducto(id_producto),
      message: `Se restaron ${cantidad} unidades`,
    };
  }

  /**
   * Obtener productos con bajo stock (menos de 10)
   */
  static getLowStock(threshold: number = 10): Inventario[] {
    return this.getAll().filter((inv) => inv.stock < threshold);
  }

  /**
   * Obtener productos sin stock
   */
  static getOutOfStock(): Inventario[] {
    return this.getAll().filter((inv) => inv.stock === 0);
  }

  /**
   * Verificar disponibilidad
   */
  static checkAvailability(
    id_producto: string,
    cantidadRequerida: number
  ): boolean {
    const inventario = inventarios.find((i) => i.id_producto === id_producto);
    return inventario ? inventario.stock >= cantidadRequerida : false;
  }
}

/**
 * Clase DashboardModel - Estadísticas para admin
 */
export class DashboardModel {
  /**
   * Obtener todas las estadísticas del dashboard
   */
  static getStats(): EstadisticasDashboard {
    // Total de ventas
    const total_ventas = OrderModel.getTotalSales();

    // Pedidos de hoy
    const pedidos_hoy = OrderModel.getTodayOrders().length;

    // Total de productos
    const productos_total = ProductModel.count();

    // Usuarios registrados
    const usuarios_registrados = usuarios.length;

    // Productos con bajo stock
    const productos_bajo_stock = InventoryModel.getLowStock().length;

    // Ventas por categoría
    const ventas_por_categoria = this.getSalesByCategory();

    // Pedidos recientes (últimos 5)
    const pedidos_recientes = OrderModel.getAll().slice(0, 5);

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
  static getSalesByCategory(): { categoria: string; ventas: number }[] {
    const ventasPorCategoria: { [key: string]: number } = {};

    // Inicializar categorías
    categorias.forEach((cat) => {
      ventasPorCategoria[cat.nombre] = 0;
    });

    // Sumar ventas
    detallesPedido.forEach((detalle) => {
      const pedido = pedidos.find((p) => p.id_pedido === detalle.id_pedido);
      const pago = pagos.find((pg) => pg.id_pedido === detalle.id_pedido);
      
      if (pago?.estado === 'completado') {
        const producto = productos.find(
          (p) => p.id_producto === detalle.id_producto
        );
        if (producto) {
          const categoria = categorias.find(
            (c) => c.id_categoria === producto.id_categoria
          );
          if (categoria) {
            ventasPorCategoria[categoria.nombre] += detalle.precio * detalle.cantidad;
          }
        }
      }
    });

    return Object.entries(ventasPorCategoria).map(([categoria, ventas]) => ({
      categoria,
      ventas,
    }));
  }

  /**
   * Obtener productos más vendidos
   */
  static getTopProducts(limit: number = 5): { producto: string; cantidad: number }[] {
    const ventasPorProducto: { [key: string]: { nombre: string; cantidad: number } } = {};

    detallesPedido.forEach((detalle) => {
      const pago = pagos.find(
        (pg) => pg.id_pedido === detalle.id_pedido
      );
      
      if (pago?.estado === 'completado') {
        const producto = productos.find(
          (p) => p.id_producto === detalle.id_producto
        );
        if (producto) {
          if (!ventasPorProducto[producto.id_producto]) {
            ventasPorProducto[producto.id_producto] = {
              nombre: producto.nombre,
              cantidad: 0,
            };
          }
          ventasPorProducto[producto.id_producto].cantidad += detalle.cantidad;
        }
      }
    });

    return Object.values(ventasPorProducto)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limit)
      .map((v) => ({ producto: v.nombre, cantidad: v.cantidad }));
  }
}
