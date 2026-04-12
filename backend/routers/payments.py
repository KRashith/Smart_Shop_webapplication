# backend/routers/payments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, razorpay, os
from utils.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)

@router.post("/create-order")
def create_razorpay_order(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == user.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Create Razorpay order (amount in paise = rupees * 100)
    razorpay_order = client.order.create({
        "amount": int(order.total_amount * 100),
        "currency": "INR",
        "receipt": f"order_{order.id}"
    })
    return {
        "razorpay_order_id": razorpay_order["id"],
        "amount": order.total_amount,
        "currency": "INR",
        "key": os.getenv("RAZORPAY_KEY_ID")
    }

@router.post("/confirm")
def confirm_payment(payment: schemas.PaymentCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    order = db.query(models.Order).filter(models.Order.id == payment.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Save transaction
    transaction = models.Transaction(
        order_id=order.id,
        payment_id=payment.payment_id,
        gateway=payment.gateway,
        amount=order.total_amount,
        status="paid"
    )
    order.status = "paid"
    db.add(transaction)
    db.commit()
    return {"message": "Payment confirmed", "order_id": order.id}