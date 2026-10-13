require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validarCliente({ nombre, email, telefono }) {
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return 'El campo "nombre" es obligatorio';
  }
  if (nombre.length > 100) return 'El "nombre" no puede superar 100 caracteres';
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    return 'El campo "email" es obligatorio y debe tener un formato válido';
  }
  if (email.length > 150) return 'El "email" no puede superar 150 caracteres';
  if (telefono !== undefined && telefono !== null) {
    if (typeof telefono !== 'string' || telefono.length > 20) {
      return 'El "telefono" debe ser texto de máximo 20 caracteres';
    }
  }
  return null;
}

function idValido(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

app.post('/clientes', async (req, res) => {
  const error = validarCliente(req.body);
  if (error) return res.status(400).json({ error });

  const { nombre, email, telefono = null } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO cliente (nombre, email, telefono) VALUES (?, ?, ?)',
      [nombre.trim(), email.trim(), telefono]
    );
    res.status(201).json({
      mensaje: 'Cliente creado correctamente',
      id_cliente: result.insertId,
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un cliente con ese email' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/clientes', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM cliente');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM cliente WHERE id_cliente = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ error: 'ID inválido' });

  const error = validarCliente(req.body);
  if (error) return res.status(400).json({ error });

  const { nombre, email, telefono = null } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE cliente SET nombre = ?, email = ?, telefono = ? WHERE id_cliente = ?',
      [nombre.trim(), email.trim(), telefono, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe un cliente con ese email' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const [result] = await pool.execute(
      'DELETE FROM cliente WHERE id_cliente = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON mal formado' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});