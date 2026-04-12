# backend/routers/cart.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from utils.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("/", response_model=List[schemas.CartItemOut])
def get_cart(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.CartItem).filter(models.CartItem.user_id == user.id).all()

@router.post("/add", response_model=schemas.CartItemOut)
def add_to_cart(item: schemas.CartItemCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Check if already in cart
    existing = db.query(models.CartItem).filter(
        models.CartItem.user_id == user.id,
        models.CartItem.product_id == item.product_id
    ).first()
    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        return existing
    cart_item = models.CartItem(user_id=user.id, product_id=item.product_id, quantity=item.quantity)
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.delete("/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item removed"}