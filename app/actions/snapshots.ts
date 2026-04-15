'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export interface SnapshotInput {
  investment_id: string
  date: string
  total_value: number
  unit_price?: number | null
}

export async function saveSnapshot(data: SnapshotInput) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('price_snapshots')
    .upsert({
      investment_id: data.investment_id,
      date: data.date,
      total_value: data.total_value,
      unit_price: data.unit_price ?? null,
    }, { onConflict: 'investment_id,date' })

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/investments')
  revalidatePath('/prices')
}

export async function saveMultipleSnapshots(snapshots: SnapshotInput[]) {
  const supabase = await createServerClient()
  const today = new Date().toISOString().slice(0, 10)

  const rows = snapshots.map(s => ({
    investment_id: s.investment_id,
    date: s.date ?? today,
    total_value: s.total_value,
    unit_price: s.unit_price ?? null,
  }))

  const { error } = await supabase
    .from('price_snapshots')
    .upsert(rows, { onConflict: 'investment_id,date' })

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/investments')
  revalidatePath('/prices')
}
