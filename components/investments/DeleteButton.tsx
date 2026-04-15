'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteInvestment } from '@/app/actions/investments'

interface Props {
  id: string
  name: string
}

export function DeleteInvestmentButton({ id, name }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={async () => {
            setLoading(true)
            try { await deleteInvestment(id) } catch {}
            setLoading(false)
            setConfirming(false)
          }}
          disabled={loading}
          className="text-xs px-2 py-1 bg-loss/10 text-loss border border-loss/20 rounded hover:bg-loss/20 transition-colors"
        >
          {loading ? '...' : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 text-text-muted hover:text-text-primary transition-colors"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn-ghost py-1.5 text-xs text-text-muted hover:text-loss"
      title={`Eliminar ${name}`}
    >
      <Trash2 size={14} />
    </button>
  )
}
