// frontend/app/orders/page.tsx
'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getMyOrders } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'

interface OrderItem {
  product_id: number
  quantity: number
  price_at_purchase: number
  product: { name: string; image_url: string }
}

interface Order {
  id: number
  total_amount: number
  status: string
  shipping_address: string
  created_at: string
  items: OrderItem[]
}

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  paid:      'bg-green-100 text-green-700',
  shipped:   'bg-blue-100 text-blue-700',
  delivered: 'bg-indigo-100 text-indigo-700',
  cancelled: 'bg-red-100 text-red-600',
}

// ── Inner component uses useSearchParams — must be inside Suspense ──
function OrdersContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()          // ← this hook requires Suspense
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const justPaid = searchParams.get('success') === 'true'

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    getMyOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">Loading orders...</div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
      <p className="text-gray-500 mb-8">Track all your purchases</p>

      {justPaid && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 font-medium">
          Payment successful! Your order has been placed.
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">You have no orders yet</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              {/* Order header */}
              <div className="px-6 py-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-sm text-gray-500">Order ID</span>
                  <p className="font-semibold text-gray-800">#{order.id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Placed on</span>
                  <p className="font-medium text-gray-700">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Total</span>
                  <p className="font-bold text-indigo-600 text-lg">
                    ₹{order.total_amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                  statusColors[order.status] || 'bg-gray-100 text-gray-600'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="px-6 py-4 space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg border"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-700">
                      ₹{(item.price_at_purchase * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shipping */}
              <div className="px-6 py-3 border-t bg-gray-50">
                <span className="text-sm text-gray-500">Shipping to: </span>
                <span className="text-sm text-gray-700">{order.shipping_address}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Loading skeleton shown while OrdersContent loads ──
function OrdersSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border shadow-sm p-6 mb-4 animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  )
}

// ── Default export wraps the content in Suspense ──
export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersContent />
    </Suspense>
  )
}