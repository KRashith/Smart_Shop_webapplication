// frontend/app/page.tsx
import Link from 'next/link'

const FEATURED_CATEGORIES = [
  { id: 1, name: 'Electronics',       emoji: '💻', color: 'from-blue-500 to-indigo-600',   slug: '1' },
  { id: 2, name: 'Mobile & Tablets',  emoji: '📱', color: 'from-purple-500 to-pink-600',   slug: '2' },
  { id: 3, name: 'Fashion',           emoji: '👗', color: 'from-pink-500 to-rose-600',     slug: '3' },
  { id: 5, name: 'Home & Kitchen',    emoji: '🏠', color: 'from-orange-500 to-amber-600',  slug: '5' },
  { id: 6, name: 'Books',             emoji: '📚', color: 'from-green-500 to-teal-600',    slug: '6' },
  { id: 7, name: 'Sports & Fitness',  emoji: '🏋️', color: 'from-red-500 to-orange-600',   slug: '7' },
]

const HIGHLIGHTS = [
  { title: 'Free Delivery',    desc: 'On orders above ₹999',      icon: '🚚' },
  { title: 'Easy Returns',     desc: '30-day hassle free returns', icon: '↩️' },
  { title: 'Secure Payment',   desc: 'Razorpay encrypted checkout',icon: '🔒' },
  { title: '24/7 Support',     desc: 'Chat with us anytime',       icon: '💬' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <span className="bg-white/20 text-white text-sm font-semibold px-4 py-1 rounded-full mb-6 inline-block">
              New Arrivals Available
            </span>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Shop Smarter,<br />
              <span className="text-yellow-300">Live Better</span>
            </h1>
            <p className="text-indigo-100 text-xl mb-8 max-w-lg">
              Discover 60+ products across 8 categories. Great prices, fast delivery.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/products"
                className="bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-indigo-50 transition">
                Shop Now
              </Link>
              <Link href="/products?cat=1"
                className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/10 transition">
                Electronics
              </Link>
            </div>
          </div>
          <div className="hidden lg:block flex-1 text-center text-9xl select-none">
            🛍️
          </div>
        </div>
      </section>

      {/* Highlights bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="flex items-center gap-3">
              <span className="text-3xl">{h.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{h.title}</p>
                <p className="text-gray-500 text-xs">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
        <p className="text-gray-500 mb-8">Find exactly what you are looking for</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className={`bg-linear-to-br ${cat.color} text-white rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-200 shadow-sm`}
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>
              <p className="font-semibold text-sm leading-tight">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-linear-to-r from-orange-500 to-pink-600 rounded-3xl p-10 text-white text-center">
          <h2 className="text-4xl font-bold mb-3">Ready to explore?</h2>
          <p className="text-orange-100 text-lg mb-6">
            60+ products. Real brands. Unbeatable prices.
          </p>
          <Link href="/products"
            className="bg-white text-orange-600 font-bold px-10 py-4 rounded-xl text-lg hover:bg-orange-50 transition inline-block">
            View All Products
          </Link>
        </div>
      </section>
    </div>
  )
}