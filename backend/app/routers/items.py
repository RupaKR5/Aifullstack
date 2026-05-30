from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, schemas, models
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/items", tags=["items"])


@router.get("", response_model=List[schemas.ItemOut])
def list_items(
    cat_id: Optional[str] = None,
    inv_id: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_items(db, current_user.id, cat_id=cat_id, inv_id=inv_id)


@router.post("", response_model=schemas.ItemOut, status_code=201)
def create_item(
    data: schemas.ItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = crud.create_item(db, data, current_user.id)
    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Category not found or does not belong to you.",
        )
    return item


@router.get("/{item_id}", response_model=schemas.ItemOut)
def get_item(
    item_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = crud.get_item(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    return item


@router.put("/{item_id}", response_model=schemas.ItemOut)
def update_item(
    item_id: str,
    data: schemas.ItemUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = crud.update_item(db, item_id, data, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
    return item


@router.delete("/{item_id}", status_code=204)
def delete_item(
    item_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = crud.delete_item(db, item_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found.")
    return None
