// frontend/lib/api.ts
import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({ baseURL: API_URL })

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// AUTH
export const registerUser = (data: { email: string; password: string; full_name: string }) =>
  api.post('/auth/register', data)

export const loginUser = (data: { email: string; password: string }) =>
  api.post('/auth/login', data)

// PRODUCTS
export const getProducts = (params?: {
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
}) => api.get('/products', { params: { limit: 100, ...params }, })

export const getProduct = (id: number) => api.get(`/products/${id}`)

export const createProduct = (data: any) => api.post('/products', data)
export const updateProduct = (id: number, data: any) => api.put(`/products/${id}`, data)
export const deleteProduct = (id: number) => api.delete(`/products/${id}`)

// CART
export const getCart = () => api.get('/cart')
export const addToCart = (product_id: number, quantity: number = 1) =>
  api.post('/cart/add', { product_id, quantity })
export const removeFromCart = (item_id: number) => api.delete(`/cart/${item_id}`)

// ORDERS
export const checkout = (shipping_address: string) =>
  api.post('/orders/checkout', { shipping_address })
export const getMyOrders = () => api.get('/orders/my-orders')
export const getAllOrders = () => api.get('/orders/all')

// PAYMENTS
export const createRazorpayOrder = (order_id: number) =>
  api.post(`/payments/create-order?order_id=${order_id}`)
export const confirmPayment = (data: { order_id: number; payment_id: string; gateway: string }) =>
  api.post('/payments/confirm', data)

export default api