'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { TransactionType } from '@/types'

export interface CreateTransactionInput {
  investment_id: string
  type: TransactionType
  date: string
  units?: number | null
  unit_price?: number | null
  amount: number
  notes?: string
}

export async function createTransaction(data: CreateTransactionInput) {
  const supabase = createServerClient()

  // Compute amount from units * price if provided
  const amount = data.units && data.unit_price
    ? data.units * data.unit_price
    : data.amount

  const { error, data: created } = await supabase
    .from('transactions')
    .insert({
      investment_id: data.investment_id,
      type: data.type,
      date: data.date,
      units: data.units ?? null,
      unit_price: data.unit_price ?? null,
      amount,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // If unit-based and has price, auto-create snapshot
  if (data.units && data.unit_price) {
    // Get all buy transactions to compute total units
    const { data: allTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('investment_id', data.investment_id)

    const totalUnits = (allTx ?? []).reduce((sum, tx) => {
      if (tx.type === 'buy' || tx.type === 'deposit') return sum + (tx.units ?? 0)
      if (tx.type === 'sell' || tx.type === 'withdrawal') return sum - (tx.units ?? 0)
      return sum
    }, 0)

    await supabase.from('price_snapshots').upsert({
      investment_id: data.investment_id,
      date: data.date,
      unit_price: data.unit_price,
      total_value: totalUnits * data.unit_price,
    }, { onConflict: 'investment_id,date' })
  }

  revalidatePath('/')
  revalidatePath('/investments')
  revalidatePath(`/investments/${data.investment_id}`)
  return created
}

export async function deleteTransaction(id: string, investment_id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath(`/investments/${investment_id}`)
}
