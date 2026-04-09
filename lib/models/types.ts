/**
 * ============================================================
 * MODELO - Definiciones de Tipos (MVC)
 * ============================================================
 * Cumplimiento de normas:
 * - ISO 9001: Documentación clara de estructuras de datos
 * - IEEE 730: Trazabilidad de requisitos
 * - ISO/IEC 25000: Calidad del producto - Funcionalidad
 * - ISO/IEC 12207: Ciclo de vida - Fase de diseño
 * ============================================================
 */

// ============================================================
// TABLA ROL
// ============================================================
export interface Rol {
  id_rol: string;
  nombre: string;
}

// ============================================================
// TABLA USUARIO
// ============================================================
export interface Usuario {
  id_usuario: string;
  nombreusuario: string;
  emailusuario: string;
  telefono: string;
  clave: string;
  id_rol: string;
}

// Usuario sin clave para respuestas seguras
export interface UsuarioSeguro {
  id_usuario: string;
  nombreusuario: string;
  emailusuario: string;
  telefono: string;
  id_rol: string;
  rol?: Rol;
}

// ============================================================
// TABLA CARRITO
// ============================================================
export interface Carrito {
  id_carrito: string;
  id_usuario: string;
}

// ============================================================
// TABLA CATEGORIA
// ============================================================
export interface Categoria {
  id_categoria: string;
  nombre: string;
  imagen?: string;
}

// ============================================================
// TABLA PRODUCTO
// ============================================================
export interface Producto {
  id_producto: string;
  nombre: string;
  descripcion: string;
  precio: number;
  id_categoria: string;
  imagen?: string;
  categoria?: Categoria;
}

// ============================================================
// TABLA INVENTARIO
// ============================================================
export interface Inventario {
  id_inventario: string;
  stock: number;
  id_producto: string;
  producto?: Producto;
}

// ============================================================
// TABLA DETALLE_CARRITO
// ============================================================
export interface DetalleCarrito {
  id_detalle: string;
  cantidad: number;
  id_carrito: string;
  id_producto: string;
  producto?: Producto;
}

// ============================================================
// TABLA PEDIDO
// ============================================================
export interface Pedido {
  id_pedido: string;
  fecha: string;
  id_usuario: string;
  usuario?: UsuarioSeguro;
  detalles?: DetallePedido[];
  pago?: Pago;
  total?: number;
}

// ============================================================
// TABLA DETALLE_PEDIDO
// ============================================================
export interface DetallePedido {
  id_detalle: string;
  cantidad: number;
  precio: number;
  id_pedido: string;
  id_producto: string;
  producto?: Producto;
}

// ============================================================
// TABLA PAGO
// ============================================================
export type MetodoPago = 'tarjeta' | 'paypal' | 'transferencia';
export type EstadoPago = 'pendiente' | 'completado' | 'fallido' | 'reembolsado';

export interface Pago {
  id_pago: string;
  metodo: MetodoPago;
  estado: EstadoPago;
  id_pedido: string;
}

// ============================================================
// TIPOS ADICIONALES PARA LA APLICACIÓN
// ============================================================

// Carrito extendido con productos
export interface CarritoCompleto {
  id_carrito: string;
  id_usuario: string;
  items: DetalleCarrito[];
  total: number;
  cantidad_items: number;
}

// Datos para registro de usuario
export interface RegistroUsuario {
  nombreusuario: string;
  emailusuario: string;
  telefono: string;
  clave: string;
}

// Datos para login
export interface LoginCredenciales {
  emailusuario: string;
  clave: string;
}

// Respuesta de autenticación
export interface AuthResponse {
  success: boolean;
  message: string;
  usuario?: UsuarioSeguro;
  token?: string;
}

// Datos de pago para checkout
export interface DatosPago {
  metodo: MetodoPago;
  // Tarjeta
  numero_tarjeta?: string;
  nombre_titular?: string;
  fecha_expiracion?: string;
  cvv?: string;
  // PayPal
  email_paypal?: string;
  // Transferencia
  banco?: string;
  referencia?: string;
}

// Estadísticas del dashboard admin
export interface EstadisticasDashboard {
  total_ventas: number;
  pedidos_hoy: number;
  productos_total: number;
  usuarios_registrados: number;
  productos_bajo_stock: number;
  ventas_por_categoria: { categoria: string; ventas: number }[];
  pedidos_recientes: Pedido[];
}

// Filtros de productos
export interface FiltrosProducto {
  categoria?: string;
  precio_min?: number;
  precio_max?: number;
  busqueda?: string;
  orden?: 'precio_asc' | 'precio_desc' | 'nombre' | 'reciente';
}

// Respuesta genérica de API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
