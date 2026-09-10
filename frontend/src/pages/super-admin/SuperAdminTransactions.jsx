import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatAmount, formatDate } from '../../components/UI'

export default function SuperAdminTransactions() {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [centerFilter, setCenterFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [txRes, centersRes] = await Promise.all([
        api.getTransactions(token),
        api.getCenters(token),
      ])
      setTransactions(txRes.data)
      setCenters(centersRes.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (centerFilter && t.bingoCenterUsername !== centerFilter) return false
      if (dateFrom && new Date(t.timestamp) < new Date(dateFrom)) return false
      if (dateTo && new Date(t.timestamp) > new Date(dateTo + 'T23:59:59')) return false
      if (search) {
        const q = search.toLowerCase()
        return String(t.id).includes(q) || t.bingoCenterUsername.toLowerCase().includes(q) || t.debitedBy.toLowerCase().includes(q)
      }
      return true
    })
  }, [transactions, centerFilter, dateFrom, dateTo, search])

  const totalPaid = filtered.reduce((s, t) => s + Number(t.actualAmount || 0), 0)
  const totalIssued = filtered.reduce((s, t) => s + Number(t.generatedAmount || 0), 0)

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Transactions</h2>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} transaction(s) • Global ledger</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="px-4 py-2 rounded-xl bg-coral-50 border border-coral-100">
              <span className="text-xs text-slate-500">Paid</span>
              <span className="ml-2 font-bold text-slate-900">{formatAmount(totalPaid)}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-coral-50 border border-coral-100">
              <span className="text-xs text-slate-500">Issued</span>
              <span className="ml-2 font-bold text-coral-600">{formatAmount(totalIssued)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID, center, user..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-coral-100 text-sm font-medium focus:outline-none focus:border-coral-500" />
        </div>
        <select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)} className="h-11 px-4 rounded-xl bg-white border border-coral-100 text-sm font-medium focus:outline-none focus:border-coral-500">
          <option value="">All Centers</option>
          {centers.map((c) => <option key={c.username} value={c.username}>{c.full_name}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-11 px-4 rounded-xl bg-white border border-coral-100 text-sm font-medium focus:outline-none focus:border-coral-500" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-11 px-4 rounded-xl bg-white border border-coral-100 text-sm font-medium focus:outline-none focus:border-coral-500" />
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-soft border border-coral-100/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-coral-100">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Center</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Paid</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Issued</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Operator</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id} className="border-b border-coral-100/50 hover:bg-coral-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900">TX-{String(tx.id).padStart(4, '0')}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{tx.bingoCenterUsername}</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{formatAmount(tx.actualAmount)}</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-coral-600">{formatAmount(tx.generatedAmount)}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{tx.debitedBy}</td>
                <td className="px-6 py-4 text-right text-xs text-slate-500">{formatDate(tx.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="No transactions match your filters." />}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filtered.map((tx) => (
          <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-soft border border-coral-100/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-900">TX-{String(tx.id).padStart(4, '0')}</span>
              <span className="text-xs text-slate-500">{formatDate(tx.timestamp)}</span>
            </div>
            <div className="font-semibold text-sm text-slate-900 mt-1">{tx.bingoCenterUsername}</div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-2 rounded-lg bg-coral-50/50 text-center">
                <div className="text-xs text-slate-500">Paid</div>
                <div className="font-bold text-sm text-slate-900">{formatAmount(tx.actualAmount)}</div>
              </div>
              <div className="p-2 rounded-lg bg-coral-50/50 text-center">
                <div className="text-xs text-slate-500">Issued</div>
                <div className="font-bold text-sm text-coral-600">{formatAmount(tx.generatedAmount)}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-2">by {tx.debitedBy}</div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState text="No transactions match your filters." />}
      </div>
    </div>
  )
}
