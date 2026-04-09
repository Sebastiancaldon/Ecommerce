/**
 * MODELO - Base de Datos en Memoria
 * 
 * NOTA: Esta base de datos en memoria simula las tablas del
 * script SQL proporcionado. Para produccion, conectar a MySQL.
 */

import type {
  Rol,
  Usuario,
  Carrito,
  Categoria,
  Producto,
  Inventario,
  DetalleCarrito,
  Pedido,
  DetallePedido,
  Pago,
} from './types';

// ============================================================
// TABLA ROL - Datos iniciales
// ============================================================
export const roles: Rol[] = [
  { id_rol: 'ROL001', nombre: 'Cliente' },
  { id_rol: 'ROL002', nombre: 'Administrador' },
];

// ============================================================
// TABLA USUARIO - Datos de prueba
// ============================================================
export const usuarios: Usuario[] = [
  {
    id_usuario: 'USR001',
    nombreusuario: 'Administrador',
    emailusuario: 'admin@tienda.com',
    telefono: '3001234567',
    clave: 'admin123', // En produccion usar bcrypt
    id_rol: 'ROL002',
  },
  {
    id_usuario: 'USR002',
    nombreusuario: 'Cliente Demo',
    emailusuario: 'cliente@test.com',
    telefono: '3009876543',
    clave: 'cliente123',
    id_rol: 'ROL001',
  },
  {
    id_usuario: 'USR003',
    nombreusuario: 'Maria Garcia',
    emailusuario: 'maria@email.com',
    telefono: '3005551234',
    clave: 'maria123',
    id_rol: 'ROL001',
  },
];

// ============================================================
// TABLA CATEGORIA - Categorias de ropa
// ============================================================
export const categorias: Categoria[] = [
  { id_categoria: 'CAT001', nombre: 'Camisetas', imagen: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop' },
  { id_categoria: 'CAT002', nombre: 'Pantalones', imagen: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop' },
  { id_categoria: 'CAT003', nombre: 'Vestidos', imagen: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop' },
  { id_categoria: 'CAT004', nombre: 'Zapatos', imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop' },
  { id_categoria: 'CAT005', nombre: 'Accesorios', imagen: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=400&h=500&fit=crop' },
  { id_categoria: 'CAT006', nombre: 'Chaquetas', imagen: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop' },
  { id_categoria: 'CAT007', nombre: 'Faldas', imagen: 'https://images.unsplash.com/photo-1583496661160-fb5886a0edd9?w=400&h=500&fit=crop' },
];

// ============================================================
// TABLA PRODUCTO - Productos de ropa (Precios en COP)
// ============================================================
export const productos: Producto[] = [
  // Camisetas
  {
    id_producto: 'PRD001',
    nombre: 'Camiseta Basica Blanca',
    descripcion: 'Camiseta de algodon 100% en color blanco, perfecta para el dia a dia. Corte clasico y comodo.',
    precio: 59900,
    id_categoria: 'CAT001',
    imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD002',
    nombre: 'Camiseta Estampada Urban',
    descripcion: 'Camiseta con diseno urbano moderno, tejido suave y resistente. Ideal para looks casuales.',
    precio: 79900,
    id_categoria: 'CAT001',
    imagen: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD003',
    nombre: 'Camiseta Polo Classic',
    descripcion: 'Polo elegante de pique con cuello y botones. Perfecto para ocasiones semi-formales.',
    precio: 99900,
    id_categoria: 'CAT001',
    imagen: 'https://images.unsplash.com/photo-1625910513413-5fc4e5e6e1b0?w=500&h=500&fit=crop',
  },
  // Pantalones
  {
    id_producto: 'PRD004',
    nombre: 'Jeans Slim Fit Azul',
    descripcion: 'Jeans de corte slim en denim premium azul oscuro. Comodos y con gran durabilidad.',
    precio: 159900,
    id_categoria: 'CAT002',
    imagen: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD005',
    nombre: 'Pantalon Chino Beige',
    descripcion: 'Pantalon chino clasico en color beige. Versatil para trabajo o casual.',
    precio: 119900,
    id_categoria: 'CAT002',
    imagen: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD006',
    nombre: 'Jogger Deportivo Negro',
    descripcion: 'Jogger comodo en tela tecnica. Ideal para deporte o uso diario.',
    precio: 89900,
    id_categoria: 'CAT002',
    imagen: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=500&fit=crop',
  },
  // Vestidos
  {
    id_producto: 'PRD007',
    nombre: 'Vestido Floral Verano',
    descripcion: 'Vestido ligero con estampado floral. Perfecto para dias calidos.',
    precio: 139900,
    id_categoria: 'CAT003',
    imagen: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD008',
    nombre: 'Vestido Elegante Negro',
    descripcion: 'Vestido negro de corte elegante. Ideal para eventos y cenas especiales.',
    precio: 259900,
    id_categoria: 'CAT003',
    imagen: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD009',
    nombre: 'Vestido Casual Midi',
    descripcion: 'Vestido midi en tono neutro. Comodo y versatil para cualquier ocasion.',
    precio: 179900,
    id_categoria: 'CAT003',
    imagen: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop',
  },
  // Zapatos
  {
    id_producto: 'PRD010',
    nombre: 'Sneakers Blancos Classic',
    descripcion: 'Zapatillas blancas de estilo clasico. Comodas y combinables con todo.',
    precio: 179900,
    id_categoria: 'CAT004',
    imagen: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD011',
    nombre: 'Tacones Elegantes Nude',
    descripcion: 'Tacones de 8cm en color nude. Elegantes para ocasiones especiales.',
    precio: 199900,
    id_categoria: 'CAT004',
    imagen: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD012',
    nombre: 'Botas Chelsea Negras',
    descripcion: 'Botas estilo Chelsea en cuero sintetico negro. Modernas y duraderas.',
    precio: 239900,
    id_categoria: 'CAT004',
    imagen: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&h=500&fit=crop',
  },
  // Accesorios
  {
    id_producto: 'PRD013',
    nombre: 'Cinturon Cuero Marron',
    descripcion: 'Cinturon de cuero genuino en marron. Hebilla clasica en metal.',
    precio: 69900,
    id_categoria: 'CAT005',
    imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD014',
    nombre: 'Gorra Baseball Negra',
    descripcion: 'Gorra de baseball en algodon negro. Ajustable y comoda.',
    precio: 49900,
    id_categoria: 'CAT005',
    imagen: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD015',
    nombre: 'Bufanda Lana Gris',
    descripcion: 'Bufanda de lana suave en gris melange. Perfecta para el invierno.',
    precio: 79900,
    id_categoria: 'CAT005',
    imagen: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500&h=500&fit=crop',
  },
  // Chaquetas
  {
    id_producto: 'PRD016',
    nombre: 'Chaqueta Denim Classic',
    descripcion: 'Chaqueta de jean clasica en azul medio. Estilo atemporal.',
    precio: 179900,
    id_categoria: 'CAT006',
    imagen: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD017',
    nombre: 'Blazer Negro Formal',
    descripcion: 'Blazer negro de corte formal. Ideal para trabajo o eventos.',
    precio: 299900,
    id_categoria: 'CAT006',
    imagen: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD018',
    nombre: 'Bomber Jacket Verde',
    descripcion: 'Bomber jacket en verde militar. Estilo casual y moderno.',
    precio: 219900,
    id_categoria: 'CAT006',
    imagen: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop',
  },
  // Faldas
  {
    id_producto: 'PRD019',
    nombre: 'Falda Plisada Midi',
    descripcion: 'Falda plisada elegante en tono neutro. Versatil y femenina.',
    precio: 109900,
    id_categoria: 'CAT007',
    imagen: 'https://images.unsplash.com/photo-1583496661160-fb5886a0edd9?w=500&h=500&fit=crop',
  },
  {
    id_producto: 'PRD020',
    nombre: 'Mini Falda Denim',
    descripcion: 'Mini falda de jean con bolsillos. Look casual y juvenil.',
    precio: 89900,
    id_categoria: 'CAT007',
    imagen: 'https://images.unsplash.com/photo-1592301933927-35b597393c0a?w=500&h=500&fit=crop',
  },
];

// ============================================================
// TABLA INVENTARIO - Stock de productos
// ============================================================
export const inventarios: Inventario[] = [
  { id_inventario: 'INV001', stock: 50, id_producto: 'PRD001' },
  { id_inventario: 'INV002', stock: 35, id_producto: 'PRD002' },
  { id_inventario: 'INV003', stock: 25, id_producto: 'PRD003' },
  { id_inventario: 'INV004', stock: 40, id_producto: 'PRD004' },
  { id_inventario: 'INV005', stock: 30, id_producto: 'PRD005' },
  { id_inventario: 'INV006', stock: 45, id_producto: 'PRD006' },
  { id_inventario: 'INV007', stock: 20, id_producto: 'PRD007' },
  { id_inventario: 'INV008', stock: 15, id_producto: 'PRD008' },
  { id_inventario: 'INV009', stock: 25, id_producto: 'PRD009' },
  { id_inventario: 'INV010', stock: 60, id_producto: 'PRD010' },
  { id_inventario: 'INV011', stock: 18, id_producto: 'PRD011' },
  { id_inventario: 'INV012', stock: 22, id_producto: 'PRD012' },
  { id_inventario: 'INV013', stock: 40, id_producto: 'PRD013' },
  { id_inventario: 'INV014', stock: 55, id_producto: 'PRD014' },
  { id_inventario: 'INV015', stock: 30, id_producto: 'PRD015' },
  { id_inventario: 'INV016', stock: 28, id_producto: 'PRD016' },
  { id_inventario: 'INV017', stock: 12, id_producto: 'PRD017' },
  { id_inventario: 'INV018', stock: 20, id_producto: 'PRD018' },
  { id_inventario: 'INV019', stock: 3, id_producto: 'PRD019' }, // Bajo stock
  { id_inventario: 'INV020', stock: 5, id_producto: 'PRD020' }, // Bajo stock
];

// ============================================================
// TABLA CARRITO - Carritos de usuarios
// ============================================================
export const carritos: Carrito[] = [
  { id_carrito: 'CRT001', id_usuario: 'USR002' },
  { id_carrito: 'CRT002', id_usuario: 'USR003' },
];

// ============================================================
// TABLA DETALLE_CARRITO - Items en carritos
// ============================================================
export const detallesCarrito: DetalleCarrito[] = [];

// ============================================================
// TABLA PEDIDO - Pedidos realizados
// ============================================================
export const pedidos: Pedido[] = [
  {
    id_pedido: 'PED001',
    fecha: '2024-01-15T10:30:00Z',
    id_usuario: 'USR002',
  },
  {
    id_pedido: 'PED002',
    fecha: '2024-01-16T14:45:00Z',
    id_usuario: 'USR003',
  },
  {
    id_pedido: 'PED003',
    fecha: '2024-01-17T09:15:00Z',
    id_usuario: 'USR002',
  },
];

// ============================================================
// TABLA DETALLE_PEDIDO - Items de pedidos (Precios en COP)
// ============================================================
export const detallesPedido: DetallePedido[] = [
  { id_detalle: 'DTP001', cantidad: 2, precio: 59900, id_pedido: 'PED001', id_producto: 'PRD001' },
  { id_detalle: 'DTP002', cantidad: 1, precio: 159900, id_pedido: 'PED001', id_producto: 'PRD004' },
  { id_detalle: 'DTP003', cantidad: 1, precio: 139900, id_pedido: 'PED002', id_producto: 'PRD007' },
  { id_detalle: 'DTP004', cantidad: 2, precio: 179900, id_pedido: 'PED002', id_producto: 'PRD010' },
  { id_detalle: 'DTP005', cantidad: 1, precio: 299900, id_pedido: 'PED003', id_producto: 'PRD017' },
  { id_detalle: 'DTP006', cantidad: 1, precio: 69900, id_pedido: 'PED003', id_producto: 'PRD013' },
];

// ============================================================
// TABLA PAGO - Pagos de pedidos
// ============================================================
export const pagos: Pago[] = [
  { id_pago: 'PAG001', metodo: 'tarjeta', estado: 'completado', id_pedido: 'PED001' },
  { id_pago: 'PAG002', metodo: 'paypal', estado: 'completado', id_pedido: 'PED002' },
  { id_pago: 'PAG003', metodo: 'transferencia', estado: 'pendiente', id_pedido: 'PED003' },
];

// ============================================================
// FUNCIONES AUXILIARES DE BASE DE DATOS
// ============================================================

// Generador de IDs unicos
export function generarId(prefijo: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefijo}${timestamp}${random}`.toUpperCase();
}

// Obtener fecha actual en formato ISO
export function obtenerFechaActual(): string {
  return new Date().toISOString();
}
