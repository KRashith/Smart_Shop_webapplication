// frontend/app/products/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProduct, addToCart } from '../../../lib/api'
import { useAuth } from '../../../lib/auth-context'

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category_id: number
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProduct(Number(id))
        setProduct(res.data)
      } catch {
        router.push('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setAdding(true)
    try {
      await addToCart(product!.id, quantity)
      setMessage('Added to cart!')
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading product...</div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button
        onClick={() => router.back()}
        className="text-indigo-600 hover:underline mb-6 block"
      >
        ← Back to products
      </button>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="bg-gray-50">
            <img
              src={product.image_url || 'https://via.placeholder.com/600x400'}
              alt={product.name}
              className="w-full h-80 md:h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl font-bold text-indigo-600">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
                    >
                      −
                    </button>
                    <span className="px-5 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              {message && (
                <div
                  className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                    message.includes('Failed')
                      ? 'bg-red-50 text-red-600'
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  {message}
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="w-full mt-3 border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}