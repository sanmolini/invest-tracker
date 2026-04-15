'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteTransaction } from '@/app/actions/transactions'

export function DeleteTransactionButton({ txId, investmentId }: { txId: string; investmentId: string }) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="flex gap-1">
        <button
          onClick={async () => {
            setLoading(true)
            try { await deleteTransaction(txId, investmentId) } catch {}
          }}
          disabled={loading}
          className="text-xs px-2 py-1 bg-loss/10 text-loss border border-loss/20 rounded hover:bg-loss/20 transition-colors"
        >
          {loading ? '...' : 'Eliminar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 text-text-muted hover:text-text-primary"
        >✕</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="opacity-0 group-hover:opacity-100 btn-ghost py-1.5 text-text-muted hover:text-loss transition-all"
    >
      <Trash2 size={13} />
    </button>
  )
}
