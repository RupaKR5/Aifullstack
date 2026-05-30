from .auth import router as auth_router
from .dashboard import router as dashboard_router
from .inventories import router as inventories_router
from .items import router as items_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "inventories_router",
    "items_router",
]
