import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatAmount } from '../../components/UI'

const PERIODS = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
]

function getPeriodRange(period) {
  const now = new Date()
  const start = new Date(now)
  switch (period) {
    case 'today': start.setHours(0, 0, 0, 0); break
    case '7d': start.setDate(now.getDate() - 7); break
    case '30d': start.setDate(now.getDate() - 30); break
    case '90d': start.setDate(now.getDate() - 90); break
    default: start.setHours(0, 0, 0, 0)
  }
  return start
}

export default function AdminReports() {
  const { token, user } = useAuth()
  const [period, setPeriod] = useState('30d')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.getTransactions(token, user?.username)
      setTransactions(res.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const periodStart = useMemo(() => getPeriodRange(period), [period])
  const filtered = useMemo(() => transactions.filter((t) => new Date(t.timestamp) >= periodStart), [transactions, periodStart])
  const totalPaid = filtered.reduce((s, t) => s + Number(t.actualAmount || 0), 0)
  const totalIssued = filtered.reduce((s, t) => s + Number(t.generatedAmount || 0), 0)
  const avgPayment = filtered.length > 0 ? Math.round(totalPaid / filtered.length) : 0

  const byCenter = useMemo(() => {
    const map = {}
    filtered.forEach((t) => {
      if (!map[t.bingoCenterUsername]) map[t.bingoCenterUsername] = { count: 0, paid: 0, issued: 0 }
      map[t.bingoCenterUsername].count++
      map[t.bingoCenterUsername].paid += Number(t.actualAmount || 0)
      map[t.bingoCenterUsername].issued += Number(t.generatedAmount || 0)
    })
    return Object.entries(map).sort((a, b) => b[1].paid - a[1].paid)
  }, [filtered])

  const byAgent = useMemo(() => {
    const map = {}
    filtered.forEach((t) => {
      if (!map[t.debitedBy]) map[t.debitedBy] = { count: 0, paid: 0, issued: 0 }
      map[t.debitedBy].count++
      map[t.debitedBy].paid += Number(t.actualAmount || 0)
      map[t.debitedBy].issued += Number(t.generatedAmount || 0)
    })
    return Object.entries(map).sort((a, b) => b[1].paid - a[1].paid)
  }, [filtered])

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Financial Reports</h2>
        <p className="text-sm text-slate-500 mt-1">Period-based financial analysis</p>
      </section>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">{PERIODS.map((p) => (
        <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${period === p.value ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20' : 'bg-white text-slate-600 border border-coral-100 hover:bg-coral-50'}`}>{p.label}</button>
      ))}</div>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Total Payment</div><div className="mt-2 text-2xl font-extrabold text-slate-900">{formatAmount(totalPaid)}</div></div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Balance Issued</div><div className="mt-2 text-2xl font-extrabold text-coral-600">{formatAmount(totalIssued)}</div></div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Transactions</div><div className="mt-2 text-2xl font-extrabold text-slate-900">{filtered.length}</div></div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Avg Payment</div><div className="mt-2 text-2xl font-extrabold text-slate-900">{formatAmount(avgPayment)}</div></div>
      </section>
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mb-4">By Center</h3>
        {byCenter.length > 0 ? (<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-coral-100"><th className="text-left py-2 font-bold text-slate-500">Center</th><th className="text-right py-2 font-bold text-slate-500">Txns</th><th className="text-right py-2 font-bold text-slate-500">Paid</th><th className="text-right py-2 font-bold text-slate-500">Issued</th></tr></thead><tbody>{byCenter.map(([name, d]) => <tr key={name} className="border-b border-coral-100/50"><td className="py-2 font-semibold">{name}</td><td className="text-right">{d.count}</td><td className="text-right font-bold">{formatAmount(d.paid)}</td><td className="text-right font-bold text-coral-600">{formatAmount(d.issued)}</td></tr>)}</tbody></table></div>) : <EmptyState text="No data." />}
      </section>
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mb-4">By Agent</h3>
        {byAgent.length > 0 ? (<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-coral-100"><th className="text-left py-2 font-bold text-slate-500">Agent</th><th className="text-right py-2 font-bold text-slate-500">Txns</th><th className="text-right py-2 font-bold text-slate-500">Paid</th><th className="text-right py-2 font-bold text-slate-500">Issued</th></tr></thead><tbody>{byAgent.map(([name, d]) => <tr key={name} className="border-b border-coral-100/50"><td className="py-2 font-semibold">{name}</td><td className="text-right">{d.count}</td><td className="text-right font-bold">{formatAmount(d.paid)}</td><td className="text-right font-bold text-coral-600">{formatAmount(d.issued)}</td></tr>)}</tbody></table></div>) : <EmptyState text="No data." />}
      </section>
    </div>
  )
}
