# Deploy MyPlace: Vercel + Render + Neon

## 1. Neon Postgres

1. Crea un proyecto en Neon.
2. Copia la connection string pooled o direct con `sslmode=require`.
3. Usala como `DATABASE_URL` en Render.

Ejemplo:

```env
DATABASE_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require
```

El backend convierte automaticamente `postgresql://` a `postgresql+psycopg://` para SQLAlchemy.

## 2. Backend en Render

Usa el `render.yaml` del repo o crea un Web Service manual:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT`

Variables requeridas:

```env
DATABASE_URL=postgresql://...
AUTO_CREATE_TABLES=false
CORS_ORIGINS=https://tu-frontend.vercel.app,http://localhost:3000
FIREBASE_PROJECT_ID=myplace-cc527
FIREBASE_SERVICE_ACCOUNT_JSON={...json completo de Firebase service account...}
ADMIN_EMAILS=jhonny.a.coca.v@gmail.com
AUTHORIZED_ADVISOR_EMAILS=
GEMINI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=inmuebles
```

Notas:

- En produccion usa `FIREBASE_SERVICE_ACCOUNT_JSON`, no un archivo local.
- `AUTO_CREATE_TABLES=false` obliga a usar Alembic, evitando migraciones improvisadas.
- Cada deploy corre `alembic upgrade head` antes de iniciar la API.

## 3. Frontend en Vercel

Configura el proyecto con:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Variables requeridas:

```env
VITE_MAPBOX_TOKEN=...
VITE_API_BASE_URL=https://tu-backend.onrender.com/api
```

## 4. Firebase Auth

En Firebase Console agrega tus dominios autorizados:

- `localhost`
- tu dominio de Vercel, por ejemplo `tu-frontend.vercel.app`

## 5. Cloudinary

Las imagenes y videos seguiran subiendo por el backend. No pongas el API secret de Cloudinary en Vercel/frontend.
