// frontend/components/ProductCard.tsx
'use client'
import Link from 'next/link'
import { addToCart } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  image_url: string
  description: string
  stock: number
}

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth()
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()  // don't navigate to product page
    if (!user) { router.push('/auth/login'); return }
    setAdding(true)
    try {
      await addToCart(product.id)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      router.push('/auth/login')
    } finally {
      setAdding(false)
    }
  }

  const isOutOfStock = product.stock === 0

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow duration-200">

        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          <img
            src={product.image_url || 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'
            }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute top-2 left-2">
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 text-xs mb-3 line-clamp-1">{product.description}</p>

          <div className="flex items-center justify-between gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={adding || isOutOfStock}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                added
                  ? 'bg-green-500 text-white'
                  : isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {adding ? '...' : added ? 'Added!' : '+ Cart'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}