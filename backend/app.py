from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import requests
from dotenv import load_dotenv
import logging

load_dotenv()

HUBSPOT_TOKEN = os.getenv("HUBSPOT_PRIVATE_APP_TOKEN", "").strip()
if not HUBSPOT_TOKEN:
    logging.warning("HUBSPOT_PRIVATE_APP_TOKEN no está configurado en .env")

HUBSPOT_BASE = "https://api.hubapi.com"
CREATE_CONTACT_URL = f"{HUBSPOT_BASE}/crm/v3/objects/contacts"
SEARCH_CONTACT_URL = f"{HUBSPOT_BASE}/crm/v3/objects/contacts/search"
LIST_CONTACTS_URL = f"{HUBSPOT_BASE}/crm/v3/objects/contacts"  # same as CREATE but GET supports listing

HEADERS = {
    "Authorization": f"Bearer {HUBSPOT_TOKEN}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

app = FastAPI(title="HubSpot Contact API")

# permitir desarrollo desde Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# esquema de entrada para crear
class ContactIn(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr

# Crear 

@app.post("/api/contacts")
def create_contact(contact: ContactIn):
    if not HUBSPOT_TOKEN:
        raise HTTPException(status_code=500, detail="Server not configured with HUBSPOT_PRIVATE_APP_TOKEN")

    payload = {"properties": {"email": contact.email, "firstname": contact.firstname, "lastname": contact.lastname}}
    try:
        resp = requests.post(CREATE_CONTACT_URL, headers=HEADERS, json=payload, timeout=15)
    except requests.RequestException as e:
        logging.error("Error conectando a HubSpot (create): %s", e)
        raise HTTPException(status_code=502, detail="Failed to reach HubSpot API")

    if resp.status_code in (200, 201):
        data = resp.json()
        return {"status": "created", "id": data.get("id")}

    if resp.status_code == 409:
        # duplicate — buscar por email y actualizar
        search_payload = {
            "filterGroups": [
                {"filters": [{"propertyName": "email", "operator": "EQ", "value": contact.email}]}
            ],
            "properties": ["email", "firstname", "lastname"]
        }
        try:
            sr = requests.post(SEARCH_CONTACT_URL, headers=HEADERS, json=search_payload, timeout=15)
        except requests.RequestException as e:
            logging.error("Error buscando contacto: %s", e)
            raise HTTPException(status_code=502, detail="Failed to search existing contact")

        if sr.status_code == 200:
            results = sr.json().get("results", [])
            if results:
                contact_id = results[0].get("id")
                upd_url = f"{CREATE_CONTACT_URL}/{contact_id}"
                upd_payload = {"properties": {"firstname": contact.firstname, "lastname": contact.lastname}}
                try:
                    up = requests.patch(upd_url, headers=HEADERS, json=upd_payload, timeout=15)
                except requests.RequestException as e:
                    logging.error("Error actualizando contacto: %s", e)
                    raise HTTPException(status_code=502, detail="Failed to update existing contact")
                if up.status_code in (200, 204):
                    return {"status": "updated", "id": contact_id}
                logging.error("Fallo al actualizar: %s %s", up.status_code, up.text)
                raise HTTPException(status_code=502, detail="Failed to update existing contact")

        logging.error("409 al crear pero la búsqueda no devolvió resultados: %s", resp.text)
        raise HTTPException(status_code=409, detail="Conflict creating contact")

    logging.error("HubSpot error %s: %s", resp.status_code, resp.text)
    raise HTTPException(status_code=502, detail=f"HubSpot API error: {resp.status_code}")



# Listar contactos

@app.get("/api/contacts")
def list_contacts(limit: int = Query(20, ge=1, le=100), after: Optional[str] = None, properties: Optional[str] = "email,firstname,lastname"):
    """
    Lista contactos desde HubSpot (paginado).
    - limit: número de elementos por página (1..100).
    - after: token para la siguiente página (cursor).
    - properties: coma-separados, propiedades a retornar.
    """
    if not HUBSPOT_TOKEN:
        raise HTTPException(status_code=500, detail="Server not configured with HUBSPOT_PRIVATE_APP_TOKEN")

    params = {"limit": limit, "properties": properties}
    if after:
        params["after"] = after

    try:
        resp = requests.get(LIST_CONTACTS_URL, headers=HEADERS, params=params, timeout=15)
    except requests.RequestException as e:
        logging.error("Error listando contactos: %s", e)
        raise HTTPException(status_code=502, detail="Failed to reach HubSpot API")

    if resp.status_code == 200:
        return resp.json()  # contiene results[] y paging (si aplica)

    logging.error("HubSpot list error %s: %s", resp.status_code, resp.text)
    raise HTTPException(status_code=502, detail=f"HubSpot API error: {resp.status_code}")

# Obtener un contacto por ID
# GET /api/contacts/{contact_id}
@app.get("/api/contacts/{contact_id}")
def get_contact(contact_id: str, properties: Optional[str] = "email,firstname,lastname"):
    """
    Obtiene un contacto por su id en HubSpot.
    - properties: propiedades a retornar (coma separado).
    """
    if not HUBSPOT_TOKEN:
        raise HTTPException(status_code=500, detail="Server not configured with HUBSPOT_PRIVATE_APP_TOKEN")

    url = f"{CREATE_CONTACT_URL}/{contact_id}"
    params = {"properties": properties}
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=15)
    except requests.RequestException as e:
        logging.error("Error obteniendo contacto: %s", e)
        raise HTTPException(status_code=502, detail="Failed to reach HubSpot API")

    if resp.status_code == 200:
        return resp.json()

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Contact not found")

    logging.error("HubSpot get error %s: %s", resp.status_code, resp.text)
    raise HTTPException(status_code=502, detail=f"HubSpot API error: {resp.status_code}")



# GET /api/contacts/search?email=user@example.com

@app.get("/api/contacts/search")
def search_by_email(email: str = Query(..., description="Email to search")):
    """
    Busca contactos por email usando el endpoint de búsqueda (POST).
    Devuelve el primer resultado (si existe).
    """
    if not HUBSPOT_TOKEN:
        raise HTTPException(status_code=500, detail="Server not configured with HUBSPOT_PRIVATE_APP_TOKEN")

    payload = {
        "filterGroups": [
            {"filters": [{"propertyName": "email", "operator": "EQ", "value": email}]}
        ],
        "properties": ["email", "firstname", "lastname"]
    }
    try:
        sr = requests.post(SEARCH_CONTACT_URL, headers=HEADERS, json=payload, timeout=15)
    except requests.RequestException as e:
        logging.error("Error buscando contacto por email: %s", e)
        raise HTTPException(status_code=502, detail="Failed to reach HubSpot API")

    if sr.status_code == 200:
        data = sr.json()
        return data

    logging.error("HubSpot search error %s: %s", sr.status_code, sr.text)
    raise HTTPException(status_code=502, detail=f"HubSpot API error: {sr.status_code}")

# DELETE por ID: borra un contacto en HubSpot
@app.delete("/api/contacts/{contact_id}")
def delete_contact(contact_id: str):
    if not HUBSPOT_TOKEN:
        raise HTTPException(status_code=500, detail="Server not configured with HUBSPOT_PRIVATE_APP_TOKEN")

    url = f"{CREATE_CONTACT_URL}/{contact_id}"
    try:
        resp = requests.delete(url, headers=HEADERS, timeout=15)
    except requests.RequestException as e:
        logging.error("Error borrando contacto: %s", e)
        raise HTTPException(status_code=502, detail="Failed to reach HubSpot API")

    # HubSpot devuelve 204 en borrado exitoso
    if resp.status_code in (200, 202, 204):
        return {"status": "deleted", "id": contact_id}

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Contact not found")

    logging.error("HubSpot delete error %s: %s", resp.status_code, resp.text)
    raise HTTPException(status_code=502, detail=f"HubSpot API error: {resp.status_code}")


# DELETE por email: busca por email y elimina el primer contacto encontrado
@app.delete("/api/contacts/by-email")
def delete_contact_by_email(email: str = Query(..., description="Email to find and delete")):
    if not HUBSPOT_TOKEN:
        raise HTTPException(status_code=500, detail="Server not configured with HUBSPOT_PRIVATE_APP_TOKEN")

    # buscar por email
    payload = {
        "filterGroups": [
            {"filters": [{"propertyName": "email", "operator": "EQ", "value": email}]}
        ],
        "properties": ["email", "firstname", "lastname"]
    }
    try:
        sr = requests.post(SEARCH_CONTACT_URL, headers=HEADERS, json=payload, timeout=15)
    except requests.RequestException as e:
        logging.error("Error en búsqueda antes de borrar: %s", e)
        raise HTTPException(status_code=502, detail="Failed to reach HubSpot API")

    if sr.status_code != 200:
        logging.error("HubSpot search error %s: %s", sr.status_code, sr.text)
        raise HTTPException(status_code=502, detail=f"HubSpot API error: {sr.status_code}")

    results = sr.json().get("results", [])
    if not results:
        raise HTTPException(status_code=404, detail="Contact not found")

    contact_id = results[0].get("id")
    # borrar por id
    url = f"{CREATE_CONTACT_URL}/{contact_id}"
    try:
        resp = requests.delete(url, headers=HEADERS, timeout=15)
    except requests.RequestException as e:
        logging.error("Error borrando contacto por email: %s", e)
        raise HTTPException(status_code=502, detail="Failed to reach HubSpot API")

    if resp.status_code in (200, 202, 204):
        return {"status": "deleted", "id": contact_id, "email": email}

    logging.error("HubSpot delete error %s: %s", resp.status_code, resp.text)
    raise HTTPException(status_code=502, detail=f"HubSpot API error: {resp.status_code}")
