
-- CREAR BASE DE DATOS
-- ========================================
CREATE DATABASE ecommerce_ropa;
USE ecommerce_ropa;

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
    id_usuario VARCHAR(10) PRIMARY KEY,
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
    id_carrito VARCHAR(10) PRIMARY KEY,
    id_usuario VARCHAR(10) NOT NULL,

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
-- TABLA PRODUCTO
-- ========================================
CREATE TABLE producto (
    id_producto VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,

    precio DECIMAL(10,2) NOT NULL,
    id_categoria VARCHAR(10) NOT NULL,
    imagen VARCHAR(255),

    CONSTRAINT fk_producto_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- ========================================
-- TABLA INVENTARIO
-- ========================================
CREATE TABLE inventario (
    id_inventario VARCHAR(10) PRIMARY KEY,
    stock INT NOT NULL,
    id_producto VARCHAR(10) NOT NULL UNIQUE,

    CONSTRAINT fk_inventario_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ========================================
-- TABLA DETALLE_CARRITO
-- ========================================
CREATE TABLE detalle_carrito (
    id_detalle VARCHAR(10) PRIMARY KEY,
    cantidad INT NOT NULL,
    id_carrito VARCHAR(10) NOT NULL,
    id_producto VARCHAR(10) NOT NULL,

    CONSTRAINT fk_detallecarrito_carrito
    FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito),

    CONSTRAINT fk_detallecarrito_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ========================================
-- TABLA PEDIDO
-- ========================================
CREATE TABLE pedido (
    id_pedido VARCHAR(10) PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario VARCHAR(10) NOT NULL,

    CONSTRAINT fk_pedido_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ========================================
-- TABLA DETALLE_PEDIDO
-- ========================================
CREATE TABLE detalle_pedido (
    id_detalle VARCHAR(10) PRIMARY KEY,
    cantidad INT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    id_pedido VARCHAR(10) NOT NULL,
    id_producto VARCHAR(10) NOT NULL,

    CONSTRAINT fk_detallepedido_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),

    CONSTRAINT fk_detallepedido_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ========================================
-- TABLA PAGO
-- ========================================
CREATE TABLE pago (
    id_pago VARCHAR(10) PRIMARY KEY,
    metodo VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_pedido VARCHAR(10) NOT NULL UNIQUE,

    CONSTRAINT fk_pago_pedido
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);

