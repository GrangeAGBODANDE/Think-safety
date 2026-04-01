'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export default function CartButton() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    function updateCount() {
      try {
        const cart = JSON.parse(localStorage.getItem('ts_cart') || '[]')
        setCount(cart.length)
      } catch { setCount(0) }
    }
    updateCount()
    window.addEventListener('cart_updated', updateCount)
    return () => window.removeEventListener('cart_updated', updateCount)
  }, [])

  return (
    <Link href="/panier"
      className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
      <ShoppingCart size={18} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: 'var(--orange)' }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
