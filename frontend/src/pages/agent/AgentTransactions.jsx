import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatAmount, formatDate } from '../../components/UI'

export default function AgentTransactions() {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [centerFilter, setCenterFilter] = useState('All')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [t, c] = await Promise.all([
        api.getMyTransactions(token),
        api.getMyCenters(token),
      ])
      setTransactions(t.data)
      setCenters(c.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (centerFilter !== 'All' && tx.bingoCenterUsername !== centerFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return tx.bingoCenterUsername.toLowerCase().includes(q) || tx.debitedBy.toLowerCase().includes(q)
      }
      return true
    })
  }, [transactions, search, centerFilter])

  const totalPaid = filtered.reduce((s, t) => s + Number(t.actualAmount || 0), 0)
  const totalIssued = filtered.reduce((s, t) => s + Number(t.generatedAmount || 0), 0)

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100/50">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Transactions</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{filtered.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100/50">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Total Paid</div>
          <div className="mt-2 text-2xl font-extrabold text-[#059669]">{formatAmount(totalPaid)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100/50">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Balance Issued</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{formatAmount(totalIssued)}</div>
        </div>
      </section>

      <section className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-emerald-100 text-sm font-medium focus:outline-none focus:border-[#059669]" /></div>
        <select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)} className="h-11 px-4 rounded-xl bg-white border border-emerald-100 text-sm font-semibold text-slate-700 focus:outline-none focus:border-[#059669]">
          <option value="All">All Centers</option>
          {centers.map((c) => <option key={c.username} value={c.username}>{c.full_name}</option>)}
        </select>
      </section>

      <div className="hidden lg:block bg-white rounded-2xl shadow-soft border border-emerald-100/50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-emerald-100">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Center</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">By</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Paid</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Issued</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Package</th>
          </tr></thead>
          <tbody>{filtered.map((tx) => (
            <tr key={tx.id} className="border-b border-emerald-100/50 hover:bg-emerald-50/30 transition-colors">
              <td className="px-6 py-4 font-bold text-sm text-slate-900">{tx.bingoCenterUsername}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{formatDate(tx.timestamp)}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{tx.debitedBy}</td>
              <td className="px-6 py-4 text-right font-bold text-sm text-slate-900">{formatAmount(tx.actualAmount)}</td>
              <td className="px-6 py-4 text-right font-bold text-sm text-[#059669]">{formatAmount(tx.generatedAmount)}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{tx.package?.name || '—'}</td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="No transactions found." />}
      </div>

      <div className="lg:hidden space-y-3">{filtered.map((tx) => (
        <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-soft border border-emerald-100/50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-slate-900">{tx.bingoCenterUsername}</div>
              <div className="text-xs text-slate-400">{formatDate(tx.timestamp)} • by {tx.debitedBy}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-slate-900">{formatAmount(tx.actualAmount)}</div>
              <div className="text-xs text-[#059669]">→ {formatAmount(tx.generatedAmount)}</div>
            </div>
          </div>
          {tx.package && <div className="mt-2 text-xs text-slate-500">Package: {tx.package.name}</div>}
        </div>
      ))}{filtered.length === 0 && <EmptyState text="No transactions found." />}</div>
    </div>
  )
}
