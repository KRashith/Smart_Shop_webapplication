# 🛍️ SmartShop — AI E-Commerce Platform

A full-stack production-grade e-commerce web application built with **Next.js**, **FastAPI**, **PostgreSQL**, and **Tailwind CSS**. Features JWT authentication, a complete shopping experience, Razorpay payment integration, and an admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat-square&logo=tailwindcss)
![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)
![Backend on Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)

---

## ✨ Features

- 🔐 **User Authentication** — Register, login with JWT tokens, bcrypt password hashing
- 🛒 **Product Catalog** — 60+ real products across 8 categories with search and filters
- 🔍 **Search & Filter** — Search by name, filter by category, sort by price — instant results
- 🛍️ **Shopping Cart** — Add/remove items, quantity control, persistent per-user cart
- 💳 **Razorpay Payments** — Full payment gateway integration with order confirmation
- 📦 **Order History** — Track all orders with status badges (pending / paid / shipped)
- 🖥️ **Admin Dashboard** — Manage products, view all orders, revenue stats
- 🔒 **Route Protection** — Middleware guards all private pages from unauthenticated access
- 📱 **Responsive Design** — Works on mobile, tablet, and desktop

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 15 + TypeScript | UI, routing, SSR |
| Styling | Tailwind CSS | Responsive design |
| Backend | FastAPI (Python) | REST API |
| Database | PostgreSQL (Supabase) | Data storage |
| ORM | SQLAlchemy + Pydantic | DB queries & validation |
| Auth | JWT + bcrypt | Secure authentication |
| Payments | Razorpay | Payment processing |
| Frontend Host | Vercel | Auto-deploy from GitHub |
| Backend Host | Render | Free Python hosting |
| DB Host | Supabase | Free PostgreSQL |

---

## 📁 Project Structure

```
smart-ecommerce/
├── backend/                    # FastAPI Python application
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── database.py             # DB connection, get_db() session provider
│   ├── models.py               # SQLAlchemy ORM table models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── requirements.txt        # Python dependencies
│   ├── render.yaml             # Render deployment config
│   ├── routers/
│   │   ├── auth.py             # /auth/register, /auth/login
│   │   ├── products.py         # CRUD /products
│   │   ├── cart.py             # /cart/add, /cart/{id}
│   │   ├── orders.py           # /orders/checkout, /orders/my-orders
│   │   └── payments.py         # /payments/create-order, /payments/confirm
│   └── utils/
│       └── auth.py             # JWT helpers, password hash, get_current_user()
│
└── frontend/                   # Next.js React application
    ├── app/
    │   ├── layout.tsx           # Root layout with Navbar
    │   ├── page.tsx             # Home page  →  /
    │   ├── auth/
    │   │   ├── login/page.tsx   # Login  →  /auth/login
    │   │   └── register/page.tsx# Signup →  /auth/register
    │   ├── products/
    │   │   ├── page.tsx         # All products  →  /products
    │   │   └── [id]/page.tsx    # Product detail → /products/:id
    │   ├── cart/page.tsx        # Cart  →  /cart
    │   ├── checkout/page.tsx    # Checkout  →  /checkout
    │   ├── orders/page.tsx      # My orders →  /orders
    │   └── admin/page.tsx       # Admin dashboard → /admin
    ├── components/
    │   ├── Navbar.tsx           # Top navigation bar
    │   └── ProductCard.tsx      # Reusable product card
    ├── lib/
    │   ├── api.ts               # All axios API call functions
    │   └── auth-context.tsx     # Global auth state (React Context)
    ├── middleware.ts            # Route protection middleware
    └── vercel.json              # Vercel deployment config
```

---

## 🚀 Getting Started — Local Development

### Prerequisites

- Node.js v18+
- Python 3.11+
- A [Supabase](https://supabase.com) account (free)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-ecommerce.git
cd smart-ecommerce
```

### 2. Set Up the Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Mac / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your environment file
cp .env.example .env
# Now edit .env with your real values (see Environment Variables section below)
```

### 3. Set Up the Database

Go to [supabase.com](https://supabase.com) → create a new project → open the SQL Editor and run the schema SQL from the project documentation to create all tables.

### 4. Set Up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
# Edit .env.local with your values
```

### 5. Run Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.
Open [http://localhost:8000/docs](http://localhost:8000/docs) to test the API.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres
SECRET_KEY=your-long-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxx
```

> ⚠️ Never commit `.env` or `.env.local` to Git. They are listed in `.gitignore`.

---

## 🗄️ Database Schema

The app uses 7 PostgreSQL tables:

```
users          → stores user accounts and auth info
categories     → product categories (Electronics, Books, etc.)
products       → all product listings with price and stock
cart_items     → temporary per-user cart (cleared after checkout)
orders         → created when user checks out
order_items    → individual products within each order
transactions   → Razorpay payment records
```

---

## 🌐 API Reference

All endpoints are documented interactively at `/docs` (Swagger UI).

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create new user account |
| POST | `/auth/login` | Public | Login, returns JWT token |
| GET | `/products` | Public | List all products (supports search, filter) |
| GET | `/products/{id}` | Public | Get single product |
| POST | `/products` | Admin | Create product |
| PUT | `/products/{id}` | Admin | Update product |
| DELETE | `/products/{id}` | Admin | Soft-delete product |
| GET | `/cart` | User | Get current user's cart |
| POST | `/cart/add` | User | Add item to cart |
| DELETE | `/cart/{id}` | User | Remove item from cart |
| POST | `/orders/checkout` | User | Place order from cart |
| GET | `/orders/my-orders` | User | Get user's order history |
| GET | `/orders/all` | Admin | Get all orders (admin) |
| POST | `/payments/create-order` | User | Create Razorpay payment order |
| POST | `/payments/confirm` | User | Confirm payment after success |

---

## 📦 Deployment

### Deploy Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add all environment variables from `backend/.env`
7. Click Deploy

### Deploy Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your GitHub repo
3. Set **Root Directory**: `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render URL
   - `NEXT_PUBLIC_RAZORPAY_KEY` = your Razorpay key
5. Click Deploy

### Auto-Redeploy

After setup, every `git push` to the `main` branch automatically triggers redeployment on both Vercel and Render.

---

## 🛡️ Making Yourself an Admin

After registering, run this in Supabase SQL Editor:

```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

Then log out and log back in. The Admin link will appear in the navbar.

---

## 📸 Pages Overview

| Page | URL | Description |
|---|---|---|
| Home | `/` | Hero banner, category grid, featured sections |
| Products | `/products` | Full catalog with sidebar filters and sort |
| Product Detail | `/products/:id` | Single product with quantity selector |
| Cart | `/cart` | Cart items with remove option |
| Checkout | `/checkout` | Address form + order summary + Razorpay |
| Orders | `/orders` | Full order history with status |
| Admin | `/admin` | Dashboard with 4 tabs: Overview, Products, Orders, Add Product |
| Login | `/auth/login` | Email + password login form |
| Register | `/auth/register` | Full name + email + password signup |

---

## 🔮 Roadmap

- [ ] AI product recommendations using Claude API
- [ ] Google OAuth login
- [ ] Product image upload via Supabase Storage
- [ ] Email order confirmation via Resend
- [ ] Product reviews and star ratings
- [ ] Inventory low-stock email alerts
- [ ] Revenue analytics charts in admin
- [ ] Coupon/discount code system

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Built by **Rashith k** as a full-stack learning project using modern web technologies.

---

<p align="center">Made with Next.js + FastAPI + PostgreSQL + Tailwind CSS</p>
