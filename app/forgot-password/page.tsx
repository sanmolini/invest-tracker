'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-bg-primary flex items-center justify-center p-4"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand mb-4">
            <BarChart3 size={28} className="text-bg-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">InvestTracker</h1>
        </div>

        <div className="card p-8 space-y-5">
          {sent ? (
            <div className="text-center space-y-3 py-2">
              <div className="text-4xl">📬</div>
              <div className="font-semibold text-text-primary">Revisá tu email</div>
              <div className="text-sm text-text-muted">
                Si <span className="text-text-primary">{email}</span> tiene una cuenta,
                te enviamos el link para resetear tu contraseña.
              </div>
              <Link href="/login" className="text-sm text-brand hover:underline block mt-2">
                Volver al login
              </Link>
            </div>
          ) : (
            <>
              <div>
                <div className="font-semibold text-text-primary mb-1">Recuperar contraseña</div>
                <div className="text-sm text-text-muted">
                  Ingresá tu email y te enviamos un link para crear una nueva contraseña.
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-base">Email</label>
                  <input
                    type="email"
                    className="input-base"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <div className="text-loss text-sm bg-loss-muted border border-loss/20 rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperación'}
                </button>
              </form>

              <div className="text-center">
                <Link href="/login" className="text-xs text-text-muted hover:text-brand transition-colors">
                  Volver al login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
