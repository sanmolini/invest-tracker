'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email o contraseña incorrectos')
        setLoading(false)
      } else {
        router.push('/')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setSignupSuccess(true)
        setLoading(false)
      }
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand mb-4">
            <BarChart3 size={28} className="text-bg-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">InvestTracker</h1>
          <p className="text-text-muted text-sm mt-1">Tu portfolio de inversiones</p>
        </div>

        <div className="card p-8 space-y-5">
          {signupSuccess ? (
            <div className="text-center space-y-3 py-2">
              <div className="text-4xl">📬</div>
              <div className="font-semibold text-text-primary">Revisá tu email</div>
              <div className="text-sm text-text-muted">
                Te enviamos un link de confirmación a <span className="text-text-primary">{email}</span>
              </div>
              <button
                onClick={() => { setSignupSuccess(false); setMode('login') }}
                className="text-sm text-brand hover:underline mt-2"
              >
                Volver al login
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="text-text-secondary text-sm">
                  {mode === 'login' ? 'Iniciá sesión en tu cuenta' : 'Creá tu cuenta'}
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

                <div>
                  <label className="label-base">Contraseña</label>
                  <input
                    type="password"
                    className="input-base"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
                  {loading
                    ? 'Cargando...'
                    : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
              </form>

              <div className="space-y-2 pt-1 text-center">
                {mode === 'login' && (
                  <div>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-text-muted hover:text-brand transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                    className="text-xs text-text-muted hover:text-brand transition-colors"
                  >
                    {mode === 'login'
                      ? '¿No tenés cuenta? Crear cuenta'
                      : '¿Ya tenés cuenta? Iniciar sesión'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
