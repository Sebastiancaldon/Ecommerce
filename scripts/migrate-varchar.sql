-- ============================================================
-- SCRIPT DE MIGRACION - Aumentar tamaño de campos VARCHAR
-- ============================================================
-- Este script modifica las columnas VARCHAR(10) a VARCHAR(20)
-- para permitir IDs más largos generados por el sistema
-- ============================================================

USE ecommerce_ropa;

-- Desactivar verificación de llaves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- INSERTAR ROLES SI NO EXISTEN
-- ========================================
INSERT IGNORE INTO rol (id_rol, nombre) VALUES
('ROL001', 'Cliente'),
('ROL002', 'Administrador');

-- ========================================
-- MODIFICAR COLUMNAS DE ID
-- ========================================

-- Tabla usuario
ALTER TABLE usuario MODIFY COLUMN id_usuario VARCHAR(20);

-- Tabla carrito
ALTER TABLE carrito MODIFY COLUMN id_carrito VARCHAR(20);
ALTER TABLE carrito MODIFY COLUMN id_usuario VARCHAR(20);

-- Tabla producto
ALTER TABLE producto MODIFY COLUMN id_producto VARCHAR(20);
-- Agregar columna imagen si no existe
ALTER TABLE producto ADD COLUMN IF NOT EXISTS imagen VARCHAR(500);

-- Tabla inventario
ALTER TABLE inventario MODIFY COLUMN id_inventario VARCHAR(20);
ALTER TABLE inventario MODIFY COLUMN id_producto VARCHAR(20);

-- Tabla detalle_carrito
ALTER TABLE detalle_carrito MODIFY COLUMN id_detalle VARCHAR(20);
ALTER TABLE detalle_carrito MODIFY COLUMN id_carrito VARCHAR(20);
ALTER TABLE detalle_carrito MODIFY COLUMN id_producto VARCHAR(20);

-- Tabla pedido
ALTER TABLE pedido MODIFY COLUMN id_pedido VARCHAR(20);
ALTER TABLE pedido MODIFY COLUMN id_usuario VARCHAR(20);

-- Tabla detalle_pedido
ALTER TABLE detalle_pedido MODIFY COLUMN id_detalle VARCHAR(20);
ALTER TABLE detalle_pedido MODIFY COLUMN id_pedido VARCHAR(20);
ALTER TABLE detalle_pedido MODIFY COLUMN id_producto VARCHAR(20);

-- Tabla pago
ALTER TABLE pago MODIFY COLUMN id_pago VARCHAR(20);
ALTER TABLE pago MODIFY COLUMN id_pedido VARCHAR(20);

-- Reactivar verificación de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- VERIFICACIÓN
-- ========================================
SELECT '=== MIGRACIÓN COMPLETADA ===' as mensaje;
SELECT 'Los campos VARCHAR han sido actualizados a VARCHAR(20)' as detalle;
SELECT 'Los roles ROL001 y ROL002 han sido verificados' as roles;
