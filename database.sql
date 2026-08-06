-- =========================================================
-- Script de Base de Datos para Stock Manager (QA Portfolio)
-- Compatible con phpMyAdmin, MySQL Workbench y MAMP/XAMPP
-- =========================================================

CREATE DATABASE IF NOT EXISTS stock_manager;
USE stock_manager;

-- Eliminar tablas existentes para permitir re-importación limpia
DROP TABLE IF EXISTS movimientos;
DROP TABLE IF EXISTS productos;

-- Tabla de Productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Movimientos de Stock
CREATE TABLE movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo ENUM('ENTRADA', 'SALIDA') NOT NULL,
    cantidad INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Insertar Datos de Prueba (Seed Data)
INSERT INTO productos (nombre, cantidad, precio) VALUES
('Teclado Mecánico RGB', 15, 4500.50),
('Mouse Inalámbrico Ergonómico', 30, 2300.00),
('Monitor Gaming 24" 144Hz', 8, 35000.99),
('Auriculares Gamer 7.1', 5, 8900.00);

INSERT INTO movimientos (producto_id, tipo, cantidad, fecha) VALUES
(1, 'ENTRADA', 15, NOW() - INTERVAL 2 DAY),
(2, 'ENTRADA', 30, NOW() - INTERVAL 2 DAY),
(3, 'ENTRADA', 8, NOW() - INTERVAL 1 DAY),
(4, 'ENTRADA', 5, NOW());
