require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const COLLECTION = process.env.FIREBASE_COLLECTION || 'atractivos';
const saPath = process.env.FIREBASE_SA_PATH || './serviceAccountKey.json';

// La clave de servicio nunca va en el codigo ni en Git: se lee desde un archivo local.
if (!fs.existsSync(saPath)) {
  throw new Error(
    'No se encontro serviceAccountKey.json. Configura FIREBASE_SA_PATH o coloca el archivo en la raiz.'
  );
}

const serviceAccount = require(path.resolve(saPath));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
  });
}

const db = admin.firestore();
const col = db.collection(COLLECTION);

// Firestore identifica los documentos con un docId (string).
// Se mantiene ademas un campo "id" numerico para no romper el contrato con el frontend.
async function nextNumericId() {
  const snap = await col.orderBy('id', 'desc').limit(1).get();
  if (snap.empty) return 1;
  return (snap.docs[0].data().id || 0) + 1;
}

function normalize(doc) {
  const data = doc.data();
  return {
    id: data.id,
    nombre: data.nombre || '',
    descripcion: data.descripcion || '',
    ubicacion: data.ubicacion || ''
  };
}

async function all() {
  const snap = await col.orderBy('id').get();
  return snap.docs.map(normalize);
}

async function findById(id) {
  const q = await col.where('id', '==', Number(id)).limit(1).get();
  if (q.empty) return null;
  return normalize(q.docs[0]);
}

async function search({ nombre = '', ubicacion = '' }) {
  // Firestore no soporta "contains" insensible a mayusculas en el servidor:
  // se trae la coleccion y se filtra en memoria (suficiente para este alcance).
  const list = await all();
  const name = (nombre || '').toLowerCase();
  const place = (ubicacion || '').toLowerCase();
  return list.filter(a =>
    (!name || a.nombre.toLowerCase().includes(name)) &&
    (!place || a.ubicacion.toLowerCase().includes(place))
  );
}

async function create({ nombre, descripcion, ubicacion = '' }) {
  const id = await nextNumericId();
  const payload = {
    id,
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    ubicacion: (ubicacion || '').trim()
  };
  await col.doc(String(id)).set(payload); // el id numerico se usa como docId
  return payload;
}

async function update(id, { nombre, descripcion, ubicacion = '' }) {
  const docRef = col.doc(String(Number(id)));
  const snap = await docRef.get();
  if (!snap.exists) return null;
  const payload = {
    id: Number(id),
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    ubicacion: (ubicacion || '').trim()
  };
  await docRef.set(payload, { merge: true });
  return payload;
}

async function remove(id) {
  const docRef = col.doc(String(Number(id)));
  const snap = await docRef.get();
  if (!snap.exists) return false;
  await docRef.delete();
  return true;
}

module.exports = { all, findById, search, create, update, remove };
