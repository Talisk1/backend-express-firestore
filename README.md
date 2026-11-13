# backend-express-firestore

API REST con Express y Firebase Firestore (NoSQL) para gestionar atractivos turisticos (CRUD y busqueda).

## Estructura

```
server.js        API Express (endpoints, validaciones y manejo de errores)
db.js            Acceso a Firestore (CRUD y busqueda)
.env.example     Plantilla de variables de entorno
package.json
serviceAccountKey.json   (clave de Firebase, solo local, NO se sube a Git)
```

## Instalacion

```bash
npm install
```

## Configuracion

1. En Firebase Console crea un proyecto y activa Firestore.
2. En Project settings > Service accounts > Generate new private key, descarga el JSON y guardalo como `serviceAccountKey.json` en la raiz del proyecto.
3. Copia `.env.example` a `.env` y completa los valores:

```
PORT=3000
FIREBASE_COLLECTION=atractivos
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_SA_PATH=./serviceAccountKey.json
```

`.env` y `serviceAccountKey.json` estan en `.gitignore`: nunca deben subirse al repositorio.

## Ejecucion

```bash
npm run dev     # desarrollo (nodemon)
npm start       # produccion
```

El servidor queda en `http://localhost:3000`.

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/atractivos` | Lista todos los atractivos |
| GET | `/atractivos/:id` | Obtiene un atractivo por id |
| GET | `/buscar?nombre=&ubicacion=` | Busca por nombre y/o ubicacion (parcial, sin distinguir mayusculas) |
| POST | `/atractivos` | Crea un atractivo |
| PUT | `/atractivos/:id` | Actualiza un atractivo |
| DELETE | `/atractivos/:id` | Elimina un atractivo |

Ejemplo de cuerpo para POST/PUT:

```json
{
  "nombre": "Plaza de Armas",
  "descripcion": "Plaza central de la ciudad con areas verdes.",
  "ubicacion": "Centro"
}
```

## Validaciones

- `nombre`: minimo 3 caracteres.
- `descripcion`: minimo 10 caracteres.
- `ubicacion`: opcional.

## Respuestas HTTP

| Codigo | Cuando |
|--------|--------|
| 200 | Consulta, actualizacion o eliminacion correcta |
| 201 | Atractivo creado |
| 400 | Datos invalidos o JSON mal formado |
| 404 | Atractivo o ruta inexistente |
| 500 | Error interno del servidor |

Todos los errores responden con `{ "error": "mensaje" }`.
