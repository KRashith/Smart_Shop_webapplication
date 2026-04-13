// frontend/app/products/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getProducts } from '../../lib/api'
import ProductCard from '../../components/ProductCard'
import api from '@/lib/api'

interface Product {
  id: number
  name: string
  price: number
  image_url: string
  description: string
  stock: number
  category_id: number
}

interface Category {
  id: number
  name: string
  slug: string
}
export const dynamic = 'force-dynamic'
const CATEGORIES: Category[] = [
  { id: 0,  name: 'All Products',     slug: 'all' },
  { id: 1,  name: 'Electronics',      slug: 'electronics' },
  { id: 2,  name: 'Mobile & Tablets', slug: 'mobile-tablets' },
  { id: 3,  name: 'Fashion Men',      slug: 'fashion-men' },
  { id: 4,  name: 'Fashion Women',    slug: 'fashion-women' },
  { id: 5,  name: 'Home & Kitchen',   slug: 'home-kitchen' },
  { id: 6,  name: 'Books',            slug: 'books' },
  { id: 7,  name: 'Sports & Fitness', slug: 'sports-fitness' },
  { id: 8,  name: 'Beauty & Personal',slug: 'beauty-personal' },
]

const SORT_OPTIONS = [
  { label: 'Newest',        value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Name A → Z',   value: 'name_asc' },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts]     = useState<Product[]>([])
  const [filtered, setFiltered]     = useState<Product[]>([])
  const [search, setSearch]         = useState('')
  const [categoryId, setCategoryId] = useState(0)
  const [minPrice, setMinPrice]     = useState('')
  const [maxPrice, setMaxPrice]     = useState('')
  const [sort, setSort]             = useState('newest')
  const [loading, setLoading]       = useState(true)

  // Fetch all products once
  useEffect(() => {
    setLoading(true)
    getProducts()
      .then((res) => {
        setProducts(res.data)
        setFiltered(res.data)
      })
      .finally(() => setLoading(false))
  }, [])

  // Apply filters/sort locally for instant response
  useEffect(() => {
    let result = [...products]

    if (categoryId > 0)
      result = result.filter((p) => p.category_id === categoryId)

    if (search.trim())
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )

    if (minPrice) result = result.filter((p) => p.price >= Number(minPrice))
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice))

    if (sort === 'price_asc')  result.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
    if (sort === 'name_asc')   result.sort((a, b) => a.name.localeCompare(b.name))

    setFiltered(result)
  }, [products, categoryId, search, minPrice, maxPrice, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero Banner */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Shop Everything</h1>
        <p className="text-indigo-100">
          {products.length} products across {CATEGORIES.length - 1} categories
        </p>
      </div>

      <div className="flex gap-8">

        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="bg-white rounded-2xl border p-5 sticky top-24">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
              Categories
            </h3>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    categoryId === cat.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <hr className="my-5" />

            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
              Price Range
            </h3>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={() => { setMinPrice(''); setMaxPrice('') }}
                className="text-xs text-indigo-600 hover:underline"
              >
                Clear price filter
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Search + Sort bar */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-50 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile category pills */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2 lg:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  categoryId === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border text-gray-600 hover:border-indigo-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-4">
            Showing <span className="font-semibold text-gray-800">{filtered.length}</span> products
            {categoryId > 0 && ` in ${CATEGORIES.find(c => c.id === categoryId)?.name}`}
          </p>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-3">No products found</p>
              <button
                onClick={() => { setSearch(''); setCategoryId(0); setMinPrice(''); setMaxPrice('') }}
                className="text-indigo-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}