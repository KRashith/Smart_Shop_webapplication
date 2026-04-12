// frontend/app/checkout/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCart, checkout, createRazorpayOrder, confirmPayment } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'

interface CartItem {
  id: number
  quantity: number
  product: { id: number; name: string; price: number; image_url: string }
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    getCart()
      .then((res) => setCartItems(res.data))
      .catch(() => setError('Failed to load cart'))
      .finally(() => setLoading(false))
  }, [user])

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setError('Please enter a shipping address')
      return
    }
    setPlacing(true)
    setError('')
    try {
      // Step 1: Create order in our backend
      const orderRes = await checkout(address)
      const order = orderRes.data

      // Step 2: Create Razorpay payment order
      const payRes = await createRazorpayOrder(order.id)
      const payData = payRes.data

      // Step 3: Open Razorpay payment modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: payData.amount * 100,
        currency: 'INR',
        name: 'SmartShop',
        description: `Order #${order.id}`,
        order_id: payData.razorpay_order_id,
        handler: async (response: any) => {
          // Step 4: Confirm payment in backend
          await confirmPayment({
            order_id: order.id,
            payment_id: response.razorpay_payment_id,
            gateway: 'razorpay',
          })
          router.push('/orders?success=true')
        },
        prefill: {
          name: user?.full_name,
          email: user?.email,
        },
        theme: { color: '#4F46E5' },
      }

      // Load Razorpay script dynamically
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Order placement failed')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>

  return (
    <>
      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Shipping address */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <textarea
                rows={5}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address including city, state and pincode"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              <p className="text-gray-700">{user?.full_name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="text-xl font-semibold mb-5">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-lg border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{item.product.name}</p>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-3">
                <span>Total</span>
                <span className="text-indigo-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing || cartItems.length === 0}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placing ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}