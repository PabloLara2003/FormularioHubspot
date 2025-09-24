# Formulario HubSpot

Mini aplicación (React + FastAPI) que integra con HubSpot. Este README explica **cómo ejecutar con Docker**.

---

## Requisitos
- Docker
- Docker Compose (incluido en Docker Desktop)
- Tener Docker Desktop corriendo en tu máquina (Windows/Mac) o el servicio Docker en Linux.

---

## Configuración (antes de levantar)
1. Crear el archivo de variables de entorno para el backend:
backend/.env

HUBSPOT_PRIVATE_APP_TOKEN=pat-na1-xxxxxxxxxxxxxxxxxxxxxxxx


**Importante:** no subas este archivo al repositorio. Añade `backend/.env` a `.gitignore`.

2. Verifica que `docker-compose.yml`, `backend/Dockerfile` y `frontend/Dockerfile` estén presentes en la raíz del proyecto (ya vienen en este repo).

---

## Levantar con Docker Compose

Desde la raíz del proyecto (donde está `docker-compose.yml`):

```bash
# build y levantar (ver logs en la terminal)
docker compose up --build

# o levantar en background (detached)
docker compose up --build -d

URLs

Frontend (SPA): http://localhost:5173/

Backend (Uvicorn): http://localhost:8000/

API base: http://localhost:8000/api/...

El nginx del contenedor frontend proxya /api/* al backend, por eso el frontend puede usar rutas relativas /api/....
