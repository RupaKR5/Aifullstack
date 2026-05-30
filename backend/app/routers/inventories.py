from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, schemas, models
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/inventories", tags=["inventories"])


@router.get("", response_model=List[schemas.InventoryOut])
def list_inventories(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_inventories(db, current_user.id)


@router.post("", response_model=schemas.InventoryOut, status_code=201)
def create_inventory(
    data: schemas.InventoryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.create_inventory(db, data, current_user.id)


@router.get("/{inv_id}", response_model=schemas.InventoryOut)
def get_inventory(
    inv_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = crud.get_inventory(db, inv_id, current_user.id)
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found.")
    return inv


@router.put("/{inv_id}", response_model=schemas.InventoryOut)
def update_inventory(
    inv_id: str,
    data: schemas.InventoryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = crud.update_inventory(db, inv_id, data, current_user.id)
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found.")
    return inv


@router.delete("/{inv_id}", status_code=204)
def delete_inventory(
    inv_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = crud.delete_inventory(db, inv_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Inventory not found.")
    return Response(status_code=204)


# Categories


@router.get("/{inv_id}/categories", response_model=List[schemas.CategoryOut])
def list_categories(
    inv_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cats = crud.get_categories(db, inv_id, current_user.id)
    if cats is None:
        raise HTTPException(status_code=404, detail="Inventory not found.")
    return cats


@router.post("/{inv_id}/categories", response_model=schemas.CategoryOut, status_code=201)
def create_category(
    inv_id: str,
    data: schemas.CategoryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = crud.create_category(db, inv_id, data, current_user.id)
    if cat is None:
        raise HTTPException(status_code=404, detail="Inventory not found.")
    return cat


@router.put("/{inv_id}/categories/{cid}", response_model=schemas.CategoryOut)
def update_category(
    inv_id: str,
    cid: str,
    data: schemas.CategoryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = crud.update_category(db, cid, inv_id, data, current_user.id)
    if cat is None:
        raise HTTPException(status_code=404, detail="Category or inventory not found.")
    return cat


@router.delete("/{inv_id}/categories/{cid}", status_code=204)
def delete_category(
    inv_id: str,
    cid: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = crud.delete_category(db, cid, inv_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Category or inventory not found.")
    return Response(status_code=204)
