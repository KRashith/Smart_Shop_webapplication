# backend/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

# ---- AUTH ----
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    is_admin: bool
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ---- PRODUCTS ----
class ProductCreate(BaseModel):
    name: str
    description: Optional[str]
    price: float
    stock: int
    image_url: Optional[str]
    category_id: Optional[int]

class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    image_url: Optional[str]
    category_id: Optional[int]
    is_active: bool
    class Config:
        from_attributes = True

# ---- CART ----
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductOut
    class Config:
        from_attributes = True

# ---- ORDERS ----
class OrderCreate(BaseModel):
    shipping_address: str

class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float
    product: ProductOut
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    total_amount: float
    status: str
    shipping_address: Optional[str]
    created_at: datetime
    items: List[OrderItemOut]
    class Config:
        from_attributes = True

# ---- PAYMENTS ----
class PaymentCreate(BaseModel):
    order_id: int
    payment_id: str
    gateway: str = "razorpay"