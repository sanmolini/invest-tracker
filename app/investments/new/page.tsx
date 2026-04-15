import { InvestmentForm } from '@/components/investments/InvestmentForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewInvestmentPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/investments" className="btn-ghost mb-6 inline-flex">
        <ChevronLeft size={16} /> Volver
      </Link>
      <div className="mb-6">
        <h1 className="page-title">Nueva Inversión</h1>
        <p className="text-text-muted text-sm mt-1">
          Registrá un activo en tu portfolio
        </p>
      </div>
      <InvestmentForm />
    </div>
  )
}
