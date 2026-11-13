require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => console.log(`API Firestore lista en http://localhost:${PORT}`));
