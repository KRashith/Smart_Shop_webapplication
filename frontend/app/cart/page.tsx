// frontend/app/cart/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { getCart, removeFromCart } from '@/lib/api'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

interface CartItem {
  id: number
  quantity: number
  product: {
    id: number
    name: string
    price: number
    image_url: string
  }
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCart = async () => {
    try {
      const res = await getCart()
      setCartItems(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: number) => {
    await removeFromCart(id)
    fetchCart()
  }

  useEffect(() => { fetchCart() }, [])

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  if (loading) return <div className="text-center py-16">Loading cart...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Link href="/products" className="bg-indigo-600 text-white px-6 py-3 rounded-lg">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              <img src={item.product.image_url} alt={item.product.name}
                className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                <p className="text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-600">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => handleRemove(item.id)}
                  className="text-red-400 hover:text-red-600 mt-1">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl border p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total</span>
              <span className="text-2xl font-bold text-indigo-600">₹{total.toFixed(2)}</span>
            </div>
            <Link href="/checkout"
              className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}