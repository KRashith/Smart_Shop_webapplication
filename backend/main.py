# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, products, cart, orders, payments

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart E-Commerce API", version="1.0.0")

# Allow your frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://smart-shop-webapplication-1euf4m40m-krashiths-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(payments.router)

@app.get("/")
def root():
    return {"message": "Smart E-Commerce API is running!"}