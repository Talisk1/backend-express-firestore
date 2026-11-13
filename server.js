require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Valida los datos de entrada; devuelve un mensaje de error o '' si todo esta bien
function validar({ nombre, descripcion } = {}) {
  if (typeof nombre !== 'string' || nombre.trim().length < 3) {
    return 'El nombre debe tener al menos 3 caracteres.';
  }
  if (typeof descripcion !== 'string' || descripcion.trim().length < 10) {
    return 'La descripcion debe tener al menos 10 caracteres.';
  }
  return '';
}

// Listar todos los atractivos
app.get('/atractivos', async (_, res) => {
  res.json(await db.all());
});

// Consultar un atractivo por id
app.get('/atractivos/:id', async (req, res) => {
  const item = await db.findById(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Atractivo no encontrado' });
  res.json(item);
});

// Crear un atractivo
app.post('/atractivos', async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  const nuevo = await db.create(req.body);
  res.status(201).json(nuevo);
});

// Actualizar un atractivo
app.put('/atractivos/:id', async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  const actualizado = await db.update(Number(req.params.id), req.body);
  if (!actualizado) return res.status(404).json({ error: 'Atractivo no encontrado' });
  res.json(actualizado);
});

// Eliminar un atractivo
app.delete('/atractivos/:id', async (req, res) => {
  const ok = await db.remove(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Atractivo no encontrado' });
  res.json({ mensaje: 'Atractivo eliminado correctamente' });
});

app.listen(PORT, () => console.log(`API Firestore lista en http://localhost:${PORT}`));
