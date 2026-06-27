# Deploy — DivisaP2P Frontend (Railway)

SPA Vue 3 + Vite servida con nginx. Se construye con Docker (`Dockerfile`).

## Servicio en Railway

1. **New Service → GitHub repo** → `DivisaP2P-Frontend`.
2. **Branch:** `main` (es la rama que se despliega).
3. Railway detecta el `Dockerfile` automáticamente.
4. **Variables (Build):**
   - `VITE_API_URL` = `https://<dominio-del-backend>.up.railway.app/api`
     (el dominio público del servicio backend; debe terminar en `/api`).
   > Es build-time: `import.meta.env.VITE_API_URL` se hornea en el bundle.
   > Si cambias el backend, hay que **redeploy** del frontend.
5. **Networking → Generate Domain** para obtener la URL pública del front.

## Entornos

| Entorno | Archivo / fuente | VITE_API_URL |
|---|---|---|
| dev (local) | `.env` | `http://localhost:5180/api` |
| prod (Railway) | `.env.production` o build var `VITE_API_URL` | dominio del backend en Railway |

## Notas

- `nginx.conf` hace `try_files … /index.html` (SPA fallback) y escucha en `${PORT}` (Railway lo inyecta).
- Para probar el contenedor localmente:
  ```bash
  docker build -t divisap2p-frontend --build-arg VITE_API_URL=http://localhost:5180/api .
  docker run --rm -p 8080:8080 divisap2p-frontend   # http://localhost:8080
  ```
