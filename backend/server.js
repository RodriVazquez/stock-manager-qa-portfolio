const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración del Pool de Conexiones a MySQL (Compatible con MAMP / XAMPP)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'stock_manager',
    port: parseInt(process.env.DB_PORT || '8889', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión inicial
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexión exitosa a MySQL (Base de datos: stock_manager)');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Error conectando a MySQL:', err.message);
        console.log('💡 Sugerencia: Revisa la contraseña y el puerto en backend/.env (MAMP usa puerto 8889 o 3306).');
    });

// ==========================================
// ENDPOINTS DE LA API
// ==========================================

// 1. GET /api/productos - Obtener catálogo de productos
app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener productos.' });
    }
});

// 2. POST /api/productos - Crear producto
// BUG 3 INTENCIONAL (Persistencia/Decimales): Se trunca la parte decimal del precio ingresado.
// Ejemplo: Si el usuario ingresa 150.99, se calcula Math.floor(150.99) = 150 y se guarda como 150.00 en la BD.
app.post('/api/productos', async (req, res) => {
    try {
        const { nombre, cantidad, precio } = req.body;

        if (!nombre || cantidad === undefined || precio === undefined) {
            return res.status(400).json({ error: 'Todos los campos (nombre, cantidad, precio) son obligatorios.' });
        }

        const parsedCantidad = parseInt(cantidad, 10);
        const rawPrecio = parseFloat(precio);

        if (isNaN(parsedCantidad) || isNaN(rawPrecio)) {
            return res.status(400).json({ error: 'Cantidad y precio deben ser valores numéricos válidos.' });
        }

        // BUG 3: Truncamiento intencional del precio (se elimina el decimal)
        const precioTruncado = Math.floor(rawPrecio);

        const [result] = await pool.query(
            'INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?)',
            [nombre, parsedCantidad, precioTruncado]
        );

        // Si la cantidad inicial es mayor a 0, registramos el movimiento de ENTRADA inicial
        if (parsedCantidad > 0) {
            await pool.query(
                'INSERT INTO movimientos (producto_id, tipo, cantidad, fecha) VALUES (?, ?, ?, NOW())',
                [result.insertId, 'ENTRADA', parsedCantidad]
            );
        }

        const [newProduct] = await pool.query('SELECT * FROM productos WHERE id = ?', [result.insertId]);

        res.status(201).json({
            message: 'Producto creado exitosamente.',
            producto: newProduct[0]
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error interno del servidor al crear producto.' });
    }
});

// 3. PUT /api/productos/:id/stock - Actualizar stock y registrar el movimiento
// BUG 1 INTENCIONAL (Lógica de Negocio): Al hacer una SALIDA, el backend NO valida si el stock resultante
// queda en negativo y permite la transacción sin arrojar error.
app.put('/api/productos/:id/stock', async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, cantidad } = req.body;

        if (!tipo || !['ENTRADA', 'SALIDA'].includes(tipo)) {
            return res.status(400).json({ error: 'El tipo de movimiento debe ser ENTRADA o SALIDA.' });
        }

        const cantNum = parseInt(cantidad, 10);
        if (isNaN(cantNum) || cantNum <= 0) {
            return res.status(400).json({ error: 'La cantidad debe ser un número entero mayor a 0.' });
        }

        // Verificar que el producto exista
        const [productos] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
        if (productos.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const producto = productos[0];
        let nuevoStock = producto.cantidad;

        if (tipo === 'ENTRADA') {
            nuevoStock += cantNum;
        } else if (tipo === 'SALIDA') {
            // BUG 1: NO SE VERIFICA SI (producto.cantidad - cantNum < 0).
            // Se calcula directamente el nuevo stock permitiendo números negativos (ej. 5 - 10 = -5).
            nuevoStock -= cantNum;
        }

        // Actualizar stock en la tabla productos
        await pool.query('UPDATE productos SET cantidad = ? WHERE id = ?', [nuevoStock, id]);

        // Registrar movimiento en el historial
        await pool.query(
            'INSERT INTO movimientos (producto_id, tipo, cantidad, fecha) VALUES (?, ?, ?, NOW())',
            [id, tipo, cantNum]
        );

        const [updatedProduct] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);

        res.json({
            message: `Movimiento de ${tipo} registrado correctamente.`,
            producto: updatedProduct[0]
        });
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar stock.' });
    }
});

// 4. GET /api/movimientos - Obtener historial de movimientos
app.get('/api/movimientos', async (req, res) => {
    try {
        const query = `
            SELECT 
                m.id,
                m.producto_id,
                p.nombre AS producto_nombre,
                m.tipo,
                m.cantidad,
                m.fecha
            FROM movimientos m
            JOIN productos p ON m.producto_id = p.id
            ORDER BY m.fecha DESC, m.id DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener movimientos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener el historial de movimientos.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor API de Stock Manager ejecutándose en el puerto ${PORT}`);
    console.log(`📡 Base URL: http://localhost:${PORT}`);
});
