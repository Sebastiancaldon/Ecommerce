-- ============================================================
-- SCRIPT COMPLETO - E-COMMERCE ROPA
-- ============================================================
-- Este script crea la base de datos, tablas y datos iniciales
-- Ejecutar este script una sola vez
-- ============================================================

-- CREAR BASE DE DATOS
-- ========================================
CREATE DATABASE IF NOT EXISTS ecommerce_ropa;
USE ecommerce_ropa;

-- ========================================
-- ELIMINAR TABLAS SI EXISTEN (para reinstalación)
-- ========================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS pago;
DROP TABLE IF EXISTS detalle_pedido;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS detalle_carrito;
DROP TABLE IF EXISTS inventario;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS carrito;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS rol;
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- TABLA ROL
-- ========================================
CREATE TABLE rol (
    id_rol VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- ========================================
-- TABLA USUARIO
-- ========================================
CREATE TABLE usuario (
    id_usuario VARCHAR(20) PRIMARY KEY,
    nombreusuario VARCHAR(50) NOT NULL,
    emailusuario VARCHAR(80) NOT NULL UNIQUE,
    telefono VARCHAR(15) NOT NULL,
    clave VARCHAR(100) NOT NULL,
    id_rol VARCHAR(10) NOT NULL,

    CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- ========================================
-- TABLA CARRITO
-- ========================================
CREATE TABLE carrito (
    id_carrito VARCHAR(20) PRIMARY KEY,
    id_usuario VARCHAR(20) NOT NULL,

    CONSTRAINT fk_carrito_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ========================================
-- TABLA CATEGORIA
-- ========================================
CREATE TABLE categoria (
    id_categoria VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- ========================================
-- TABLA PRODUCTO (con imagen)
-- ========================================
CREATE TABLE producto (
    id_producto VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    imagen VARCHAR(500),
    id_categoria VARCHAR(10) NOT NULL,

    CONSTRAINT fk_producto_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- ========================================
-- TABLA INVENTARIO
-- ========================================
CREATE TABLE inventario (
    id_inventario VARCHAR(20) PRIMARY KEY,
    stock INT NOT NULL,
    id_producto VARCHAR(20) NOT NULL UNIQUE,

    CONSTRAINT fk_inventario_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ========================================
-- TABLA DETALLE_CARRITO
-- ========================================
CREATE TABLE detalle_carrito (
    id_detalle VARCHAR(20) PRIMARY KEY,
    cantidad INT NOT NULL,
    id_carrito VARCHAR(20) NOT NULL,
    id_producto VARCHAR(20) NOT NULL,

    CONSTRAINT fk_detallecarrito_carrito
    FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito),

    CONSTRAINT fk_detallecarrito_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ========================================
-- TABLA PEDIDO
-- ========================================
CREATE TABLE pedido (
    id_pedido VARCHAR(20) PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario VARCHAR(20) NOT NULL,

    CONSTRAINT fk_pedido_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ========================================
-- TABLA DETALLE_PEDIDO
-- ========================================
CREATE TABLE detalle_pedido (
    id_detalle VARCHAR(20) PRIMARY KEY,
    cantidad INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    id_pedido VARCHAR(20) NOT NULL,
    id_producto VARCHAR(20) NOT NULL,

    CONSTRAINT fk_detallepedido_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),

    CONSTRAINT fk_detallepedido_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ========================================
-- TABLA PAGO
-- ========================================
CREATE TABLE pago (
    id_pago VARCHAR(20) PRIMARY KEY,
    metodo VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_pedido VARCHAR(20) NOT NULL UNIQUE,

    CONSTRAINT fk_pago_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- ========================================
-- INSERTAR ROLES (REQUERIDO PARA REGISTRO)
-- ========================================
INSERT INTO rol (id_rol, nombre) VALUES
('ROL001', 'Cliente'),
('ROL002', 'Administrador');

-- ========================================
-- INSERTAR USUARIOS DE PRUEBA
-- ========================================
INSERT INTO usuario (id_usuario, nombreusuario, emailusuario, telefono, clave, id_rol) VALUES
('USR001', 'Administrador', 'admin@tienda.com', '3001234567', 'admin123', 'ROL002'),
('USR002', 'Cliente Demo', 'cliente@test.com', '3009876543', 'cliente123', 'ROL001');

-- ========================================
-- INSERTAR CATEGORÍAS
-- ========================================
INSERT INTO categoria (id_categoria, nombre) VALUES
('CAT001', 'Camisetas'),
('CAT002', 'Pantalones'),
('CAT003', 'Vestidos'),
('CAT004', 'Zapatos'),
('CAT005', 'Accesorios'),
('CAT006', 'Chaquetas'),
('CAT007', 'Faldas');

-- ========================================
-- INSERTAR PRODUCTOS
-- ========================================
INSERT INTO producto (id_producto, nombre, descripcion, precio, imagen, id_categoria) VALUES
('PRD001', 'Camiseta Basica Blanca', 'Camiseta de algodon 100% en color blanco, perfecta para el dia a dia.', 59900.00, '/images/products/camiseta-blanca.jpg', 'CAT001'),
('PRD002', 'Camiseta Estampada Urban', 'Camiseta con diseno urbano moderno, tejido suave y resistente.', 79900.00, '/images/products/camiseta-urban.jpg', 'CAT001'),
('PRD003', 'Camiseta Polo Classic', 'Polo elegante de pique con cuello y botones.', 99900.00, '/images/products/polo-classic.jpg', 'CAT001'),
('PRD004', 'Jeans Slim Fit Azul', 'Jeans de corte slim en denim premium azul oscuro.', 159900.00, '/images/products/jeans-slim.jpg', 'CAT002'),
('PRD005', 'Pantalon Chino Beige', 'Pantalon chino clasico en color beige.', 119900.00, '/images/products/chino-beige.jpg', 'CAT002'),
('PRD006', 'Jogger Deportivo Negro', 'Jogger comodo en tela tecnica.', 89900.00, '/images/products/jogger-negro.jpg', 'CAT002'),
('PRD007', 'Vestido Floral Verano', 'Vestido ligero con estampado floral.', 139900.00, '/images/products/vestido-floral.jpg', 'CAT003'),
('PRD008', 'Vestido Elegante Negro', 'Vestido negro de corte elegante.', 259900.00, '/images/products/vestido-negro.jpg', 'CAT003'),
('PRD009', 'Sneakers Blancos Classic', 'Zapatillas blancas de estilo clasico.', 179900.00, '/images/products/sneakers-blancos.jpg', 'CAT004'),
('PRD010', 'Botas Chelsea Negras', 'Botas estilo Chelsea en cuero sintetico negro.', 239900.00, '/images/products/botas-chelsea.jpg', 'CAT004');

-- ========================================
-- INSERTAR INVENTARIO
-- ========================================
INSERT INTO inventario (id_inventario, stock, id_producto) VALUES
('INV001', 50, 'PRD001'),
('INV002', 35, 'PRD002'),
('INV003', 25, 'PRD003'),
('INV004', 40, 'PRD004'),
('INV005', 30, 'PRD005'),
('INV006', 45, 'PRD006'),
('INV007', 20, 'PRD007'),
('INV008', 15, 'PRD008'),
('INV009', 60, 'PRD009'),
('INV010', 22, 'PRD010');

-- ========================================
-- INSERTAR CARRITOS DE USUARIOS
-- ========================================
INSERT INTO carrito (id_carrito, id_usuario) VALUES
('CRT001', 'USR001'),
('CRT002', 'USR002');

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================
SELECT '=== INSTALACIÓN COMPLETADA ===' as mensaje;
SELECT CONCAT('Roles: ', COUNT(*)) as resultado FROM rol
UNION ALL
SELECT CONCAT('Usuarios: ', COUNT(*)) FROM usuario
UNION ALL
SELECT CONCAT('Categorias: ', COUNT(*)) FROM categoria
UNION ALL
SELECT CONCAT('Productos: ', COUNT(*)) FROM producto
UNION ALL
SELECT CONCAT('Inventario: ', COUNT(*)) FROM inventario;
