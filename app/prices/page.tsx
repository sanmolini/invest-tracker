import { createServerClient } from '@/lib/supabase/server'
import { computeInvestmentWithData } from '@/lib/calculations'
import { PriceUpdateForm } from '@/components/prices/PriceUpdateForm'

export const revalidate = 0

export default async function PricesPage() {
  const supabase = createServerClient()
  const [investRes, txRes, snapRes] = await Promise.all([
    supabase.from('investments').select('*').eq('is_active', true).order('type'),
    supabase.from('transactions').select('*'),
    supabase.from('price_snapshots').select('*').order('date', { ascending: false }),
  ])

  const investments = (investRes.data ?? []).map(inv =>
    computeInvestmentWithData(inv as any, txRes.data as any ?? [], snapRes.data as any ?? [])
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">Actualizar Precios</h1>
        <p className="text-text-muted text-sm mt-1">
          Ingresá el valor actual de cada posición para calcular el rendimiento
        </p>
      </div>

      {investments.length === 0 ? (
        <div className="card p-8 text-center text-text-muted text-sm">
          Sin inversiones activas. Agregá una desde el menú.
        </div>
      ) : (
        <PriceUpdateForm investments={investments} />
      )}
    </div>
  )
}
