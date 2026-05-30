from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import engine
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.inventories import router as inventories_router
from app.routers.items import router as items_router


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="InvenTrack API")

# Configure CORS origins explicitly to ensure a concrete Access-Control-Allow-Origin
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")
if not FRONTEND_ORIGIN:
    if ENVIRONMENT == "production":
        raise RuntimeError("FRONTEND_ORIGIN environment variable must be set in production")
    FRONTEND_ORIGIN = "http://localhost:5173"

allowed_origins = [o.strip() for o in FRONTEND_ORIGIN.split(",") if o.strip()]

# IMPORTANT: middleware registered before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=engine)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"message": "InvenTrack API"}


# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(inventories_router)
app.include_router(items_router)
