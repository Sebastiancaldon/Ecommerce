/**
 * ============================================================
 * EXPORTACIÓN DE MODELOS MySQL
 * ============================================================
 * Este archivo centraliza la exportación de todos los modelos
 * para facilitar las importaciones en la aplicación.
 * 
 * Cumplimiento de normas:
 * - ISO 9001:2015 - Documentación centralizada
 * - CMMI Nivel 2 - Gestión de configuración
 * - ISO/IEC 12207 - Organización del código
 * ============================================================
 * 
 * USO:
 * import { UserModelMySQL, ProductModelMySQL } from '@/lib/db/models';
 * 
 * ============================================================
 */

// Modelos de Usuario
export { UserModelMySQL } from './user.mysql';

// Modelos de Producto y Categoría
export { ProductModelMySQL, CategoryModelMySQL } from './product.mysql';

// Modelos de Carrito
export { CartModelMySQL } from './cart.mysql';

// Modelos de Pedido y Pago
export { OrderModelMySQL, PaymentModelMySQL } from './order.mysql';

// Modelos de Inventario y Dashboard
export { InventoryModelMySQL, DashboardModelMySQL } from './inventory.mysql';
