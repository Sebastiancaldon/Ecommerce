/**
 * ============================================================
 * MODELO - Carrito de Compras (MVC)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001: Gestión de carrito documentada
 * - IEEE 730: Validación de cantidades y stock
 * - ISO/IEC 25000: Funcionalidad completa
 * ============================================================
 */

import type { Carrito, DetalleCarrito, CarritoCompleto, Producto } from './types';
import { carritos, detallesCarrito, productos, inventarios, generarId } from './database';

/**
 * Clase CartModel - Operaciones del carrito de compras
 */
export class CartModel {
  /**
   * Obtener o crear carrito de usuario
   */
  static getOrCreateCart(id_usuario: string): Carrito {
    let carrito = carritos.find((c) => c.id_usuario === id_usuario);
    
    if (!carrito) {
      carrito = {
        id_carrito: generarId('CRT'),
        id_usuario: id_usuario,
      };
      carritos.push(carrito);
    }
    
    return carrito;
  }

  /**
   * Obtener carrito completo con detalles
   */
  static getCartCompleto(id_usuario: string): CarritoCompleto {
    const carrito = this.getOrCreateCart(id_usuario);
    
    const items = detallesCarrito
      .filter((d) => d.id_carrito === carrito.id_carrito)
      .map((d) => {
        const producto = productos.find((p) => p.id_producto === d.id_producto);
        return {
          ...d,
          producto: producto,
        };
      });

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
  static addItem(
    id_usuario: string,
    id_producto: string,
    cantidad: number = 1
  ): { success: boolean; carrito?: CarritoCompleto; message: string } {
    // Validar producto
    const producto = productos.find((p) => p.id_producto === id_producto);
    if (!producto) {
      return { success: false, message: 'Producto no encontrado' };
    }

    // Validar stock
    const inventario = inventarios.find((i) => i.id_producto === id_producto);
    if (!inventario || inventario.stock < cantidad) {
      return { success: false, message: 'Stock insuficiente' };
    }

    const carrito = this.getOrCreateCart(id_usuario);

    // Buscar si ya existe el producto en el carrito
    const detalleExistente = detallesCarrito.find(
      (d) => d.id_carrito === carrito.id_carrito && d.id_producto === id_producto
    );

    if (detalleExistente) {
      // Validar nuevo total con stock
      if (inventario.stock < detalleExistente.cantidad + cantidad) {
        return { success: false, message: 'Stock insuficiente' };
      }
      detalleExistente.cantidad += cantidad;
    } else {
      // Agregar nuevo item
      const nuevoDetalle: DetalleCarrito = {
        id_detalle: generarId('DTC'),
        cantidad,
        id_carrito: carrito.id_carrito,
        id_producto,
      };
      detallesCarrito.push(nuevoDetalle);
    }

    return {
      success: true,
      carrito: this.getCartCompleto(id_usuario),
      message: 'Producto agregado al carrito',
    };
  }

  /**
   * Actualizar cantidad de un item
   */
  static updateQuantity(
    id_usuario: string,
    id_producto: string,
    cantidad: number
  ): { success: boolean; carrito?: CarritoCompleto; message: string } {
    const carrito = this.getOrCreateCart(id_usuario);

    const detalle = detallesCarrito.find(
      (d) => d.id_carrito === carrito.id_carrito && d.id_producto === id_producto
    );

    if (!detalle) {
      return { success: false, message: 'Producto no está en el carrito' };
    }

    if (cantidad <= 0) {
      return this.removeItem(id_usuario, id_producto);
    }

    // Validar stock
    const inventario = inventarios.find((i) => i.id_producto === id_producto);
    if (!inventario || inventario.stock < cantidad) {
      return { success: false, message: 'Stock insuficiente' };
    }

    detalle.cantidad = cantidad;

    return {
      success: true,
      carrito: this.getCartCompleto(id_usuario),
      message: 'Cantidad actualizada',
    };
  }

  /**
   * Eliminar item del carrito
   */
  static removeItem(
    id_usuario: string,
    id_producto: string
  ): { success: boolean; carrito?: CarritoCompleto; message: string } {
    const carrito = this.getOrCreateCart(id_usuario);

    const index = detallesCarrito.findIndex(
      (d) => d.id_carrito === carrito.id_carrito && d.id_producto === id_producto
    );

    if (index === -1) {
      return { success: false, message: 'Producto no está en el carrito' };
    }

    detallesCarrito.splice(index, 1);

    return {
      success: true,
      carrito: this.getCartCompleto(id_usuario),
      message: 'Producto eliminado del carrito',
    };
  }

  /**
   * Vaciar carrito
   */
  static clearCart(id_usuario: string): { success: boolean; message: string } {
    const carrito = this.getOrCreateCart(id_usuario);

    // Eliminar todos los items del carrito
    const indices: number[] = [];
    detallesCarrito.forEach((d, index) => {
      if (d.id_carrito === carrito.id_carrito) {
        indices.push(index);
      }
    });

    // Eliminar en orden inverso para no afectar los índices
    indices.reverse().forEach((index) => {
      detallesCarrito.splice(index, 1);
    });

    return { success: true, message: 'Carrito vaciado' };
  }

  /**
   * Contar items en carrito
   */
  static countItems(id_usuario: string): number {
    const carrito = carritos.find((c) => c.id_usuario === id_usuario);
    if (!carrito) return 0;

    return detallesCarrito
      .filter((d) => d.id_carrito === carrito.id_carrito)
      .reduce((sum, d) => sum + d.cantidad, 0);
  }

  /**
   * Obtener total del carrito
   */
  static getTotal(id_usuario: string): number {
    const carritoCompleto = this.getCartCompleto(id_usuario);
    return carritoCompleto.total;
  }
}
