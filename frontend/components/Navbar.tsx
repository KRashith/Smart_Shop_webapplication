// frontend/components/Navbar.tsx
'use client'
import Link from 'next/link'
import { useAuth } from '../lib/auth-context'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          SmartShop
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/products" className="text-gray-600 hover:text-indigo-600 font-medium">
            Products
          </Link>

          {user ? (
            <>
              <Link href="/cart" className="text-gray-600 hover:text-indigo-600">
                Cart
              </Link>
              <Link href="/orders" className="text-gray-600 hover:text-indigo-600">
                Orders
              </Link>
              {user.is_admin && (
                <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-gray-500 hover:text-red-500 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-indigo-600">
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}