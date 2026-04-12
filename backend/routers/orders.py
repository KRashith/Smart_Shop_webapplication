# backend/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from utils.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/checkout", response_model=schemas.OrderOut)
def checkout(order_data: schemas.OrderCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Get user's cart
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total
    total = sum(item.product.price * item.quantity for item in cart_items)
    
    # Create order
    order = models.Order(
        user_id=user.id,
        total_amount=total,
        shipping_address=order_data.shipping_address
    )
    db.add(order)
    db.flush()  # get order.id without committing
    
    # Create order items
    for cart_item in cart_items:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price_at_purchase=cart_item.product.price
        )
        db.add(order_item)
        # Reduce stock
        cart_item.product.stock -= cart_item.quantity
        db.delete(cart_item)  # clear cart
    
    db.commit()
    db.refresh(order)
    return order

@router.get("/my-orders", response_model=List[schemas.OrderOut])
def my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Order).filter(models.Order.user_id == user.id).all()

@router.get("/all", response_model=List[schemas.OrderOut])
def all_orders(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    return db.query(models.Order).all()