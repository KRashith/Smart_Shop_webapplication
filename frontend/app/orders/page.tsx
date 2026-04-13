'use client'

import { Suspense } from 'react'
import OrdersContent from './OrdersContent'

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="text-center py-16">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  )
}