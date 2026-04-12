// frontend/app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getProducts,
  getAllOrders,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../lib/api'
import { useAuth } from '../../lib/auth-context'

interface Product {
  id: number
  name: string
  price: number
  stock: number
  is_active: boolean
  image_url: string
  description: string
  category_id: number | null
}

interface Order {
  id: number
  total_amount: number
  status: string
  created_at: string
  items: { quantity: number; price_at_purchase: number }[]
}

type Tab = 'overview' | 'products' | 'orders' | 'add-product'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: '',
  category_id: '',
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    if (!user.is_admin) { router.push('/'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pRes, oRes] = await Promise.all([getProducts(), getAllOrders()])
      setProducts(pRes.data)
      setOrders(oRes.data)
    } catch {
      setMessage('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // ---- Stats ----
  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.total_amount, 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const lowStock = products.filter((p) => p.stock < 5).length

  // ---- Product form ----
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url || '',
      category_id: product.category_id ? String(product.category_id) : '',
    })
    setTab('add-product')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      image_url: form.image_url,
      category_id: form.category_id ? parseInt(form.category_id) : null,
    }
    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        setMessage('Product updated successfully!')
      } else {
        await createProduct(payload)
        setMessage('Product added successfully!')
      }
      setForm(emptyForm)
      setEditingId(null)
      await fetchData()
      setTab('products')
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      setMessage('Product deleted')
      fetchData()
    } catch {
      setMessage('Delete failed')
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Loading admin panel...</div>

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'add-product', label: editingId ? 'Edit Product' : 'Add Product' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your store</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setTab('add-product') }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          + Add Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
              tab === t.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${
          message.includes('Failed') || message.includes('failed')
            ? 'bg-red-50 text-red-600'
            : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* ---- OVERVIEW TAB ---- */}
      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-indigo-600' },
              { label: 'Total Orders', value: totalOrders, color: 'text-gray-800' },
              { label: 'Total Products', value: totalProducts, color: 'text-gray-800' },
              { label: 'Low Stock Items', value: lowStock, color: lowStock > 0 ? 'text-red-500' : 'text-green-600' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border p-6 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent orders preview */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 pr-6">Order ID</th>
                    <th className="pb-3 pr-6">Date</th>
                    <th className="pb-3 pr-6">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 pr-6 font-medium">#{order.id}</td>
                      <td className="py-3 pr-6 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3 pr-6 font-semibold">
                        ₹{order.total_amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          order.status === 'paid' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---- PRODUCTS TAB ---- */}
      {tab === 'products' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/40'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border"
                        />
                        <span className="font-medium text-gray-800">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={product.stock < 5 ? 'text-red-500 font-semibold' : 'text-gray-700'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- ORDERS TAB ---- */}
      {tab === 'orders' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">#{order.id}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{order.items.length} item(s)</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- ADD / EDIT PRODUCT TAB ---- */}
      {tab === 'add-product' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. Wireless Headphones"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Describe the product..."
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                    placeholder="999.00"
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleFormChange}
                    required
                    placeholder="50"
                    className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleFormChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="mt-2 h-24 w-24 object-cover rounded-lg border"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category ID
                </label>
                <input
                  name="category_id"
                  type="number"
                  value={form.category_id}
                  onChange={handleFormChange}
                  placeholder="1 = Electronics, 2 = Clothing, 3 = Books"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(emptyForm); setEditingId(null); setTab('products') }}
                  className="px-6 py-3 border rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}