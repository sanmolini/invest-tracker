'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { InvestmentType, Currency } from '@/types'

export interface CreateInvestmentInput {
  name: string
  type: InvestmentType
  ticker?: string
  currency: Currency
  is_unit_based: boolean
  notes?: string
}

export async function createInvestment(data: CreateInvestmentInput) {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error, data: created } = await supabase
    .from('investments')
    .insert({
      user_id: user.id,
      name: data.name,
      type: data.type,
      ticker: data.ticker || null,
      currency: data.currency,
      is_unit_based: data.is_unit_based,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/investments')
  return created
}

export async function updateInvestment(id: string, data: Partial<CreateInvestmentInput>) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('investments')
    .update({ ...data, ticker: data.ticker || null, notes: data.notes || null })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/investments')
  revalidatePath(`/investments/${id}`)
}

export async function deleteInvestment(id: string) {
  const supabase = createServerClient()
  const { error } = await supabase.from('investments').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/investments')
}

export async function toggleInvestmentActive(id: string, is_active: boolean) {
  const supabase = createServerClient()
  const { error } = await supabase.from('investments').update({ is_active }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/investments')
}
