'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/secteurs'

  useEffect(() => {
    let done = false
    const finish = () => { if (!done) { done = true; router.replace(redirect) } }

    supabase.auth.getSession().then(({ data }) => { if (data.session) finish() })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish()
    })

    const timeout = setTimeout(finish, 5000)
    return () => { listener.subscription.unsubscribe(); clearTimeout(timeout) }
  }, [redirect, router])

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-main)',color:'var(--text-secondary)',fontSize:'14px'}}>
      Connexion en cours...
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  )
}
