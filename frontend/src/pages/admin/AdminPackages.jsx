import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatAmount, formatDate } from '../../components/UI'

export default function AdminPackages() {
  const { token } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.getActivePackages(token)
      setPackages(res.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Packages</h2>
        <p className="text-sm text-slate-500 mt-1">{packages.length} active package(s) • Read-only for Admin</p>
      </section>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-slate-900">{pkg.name}</div>
                {pkg.isBonus && <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">BONUS</span>}
                {pkg.description && <div className="text-xs text-slate-500 mt-0.5 truncate">{pkg.description}</div>}
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">Active</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-3 rounded-xl bg-coral-50/50 border border-coral-100/50">
                <div className="text-xs text-slate-500">Customer Pays</div>
                <div className="font-bold text-sm text-slate-900 mt-1">{formatAmount(pkg.paymentAmount)}</div>
              </div>
              <div className="p-3 rounded-xl bg-coral-50/50 border border-coral-100/50">
                <div className="text-xs text-slate-500">Balance</div>
                <div className="font-bold text-sm text-coral-600 mt-1">{formatAmount(pkg.balanceAmount)}</div>
              </div>
              <div className="p-3 rounded-xl bg-coral-50/50 border border-coral-100/50">
                <div className="text-xs text-slate-500">Difference</div>
                <div className="font-bold text-sm text-emerald-600 mt-1">{formatAmount(pkg.balanceAmount - pkg.paymentAmount)}</div>
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && <div className="md:col-span-2 xl:col-span-3"><EmptyState text="No active packages available." /></div>}
      </div>
    </div>
  )
}
