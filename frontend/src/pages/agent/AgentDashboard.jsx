import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatAmount, formatDate } from '../../components/UI'

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

function KpiCard({ title, value, icon, onClick }) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100/50 text-left w-full hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{title}</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
    </button>
  )
}

function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-soft border border-emerald-100/50 ${className}`}>
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-6 pb-5">{children}</div>
    </div>
  )
}

export default function AgentDashboard() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('today')
  const [analytics, setAnalytics] = useState(null)
  const [centers, setCenters] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [a, c, t] = await Promise.allSettled([
        api.getMyAnalytics(token),
        api.getMyCenters(token),
        api.getMyTransactions(token),
      ])
      if (a.status === 'fulfilled') setAnalytics(a.value.data)
      if (c.status === 'fulfilled') setCenters(c.value.data)
      if (t.status === 'fulfilled') setTransactions(t.value.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const periodStart = useMemo(() => getPeriodRange(period), [period])
  const filtered = useMemo(() => transactions.filter((t) => new Date(t.timestamp) >= periodStart), [transactions, periodStart])

  const totalPaid = filtered.reduce((s, t) => s + Number(t.actualAmount || 0), 0)
  const totalIssued = filtered.reduce((s, t) => s + Number(t.generatedAmount || 0), 0)

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      <section className="bg-white rounded-2xl p-6 shadow-soft border border-emerald-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">{greeting}, {user?.full_name?.split(' ')[0] || 'Agent'}</h2>
        <p className="text-slate-500 mt-1 text-sm">Here's an overview of your assigned centers.</p>
      </section>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${period === p.value ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/20' : 'bg-white text-slate-600 border border-emerald-100 hover:bg-emerald-50'}`}>{p.label}</button>
        ))}
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Assigned Centers" value={String(analytics?.activeCenters || centers.length)} icon="storefront" onClick={() => navigate('/centers')} />
        <KpiCard title="Transactions" value={String(filtered.length)} icon="receipt_long" onClick={() => navigate('/transactions')} />
        <KpiCard title="Payments" value={formatAmount(totalPaid)} icon="payments" onClick={() => navigate('/reports')} />
        <KpiCard title="Balance Issued" value={formatAmount(totalIssued)} icon="generating_tokens" onClick={() => navigate('/reports')} />
      </section>

      <section className="grid xl:grid-cols-12 gap-6">
        <SectionCard title="Financial Overview" subtitle={`${period.toUpperCase()} period`} className="xl:col-span-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="text-xs text-slate-500 font-semibold">Total Payments</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{formatAmount(totalPaid)}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="text-xs text-slate-500 font-semibold">Balance Issued</div>
              <div className="mt-1 text-xl font-extrabold text-[#059669]">{formatAmount(totalIssued)}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="text-xs text-slate-500 font-semibold">Transactions</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{filtered.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="text-xs text-slate-500 font-semibold">Total Balance</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{formatAmount(analytics?.totalBalance || 0)}</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recent Transactions" subtitle="Latest ledger events" className="xl:col-span-4">
          <div className="space-y-1">
            {filtered.slice(0, 5).map((tx) => (
              <div key={tx.id} className="w-full flex items-center justify-between py-2.5 border-b border-emerald-100/50 last:border-0">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">{tx.bingoCenterUsername}</div>
                  <div className="text-xs text-slate-400">{formatDate(tx.timestamp)}</div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-sm font-bold text-slate-900">{formatAmount(tx.actualAmount)}</div>
                  <div className="text-xs text-[#059669]">→ {formatAmount(tx.generatedAmount)}</div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <EmptyState text="No transactions in this period." />}
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Your Centers" subtitle="Assigned centers" action={
        <button onClick={() => navigate('/centers')} className="text-xs font-semibold text-[#059669] hover:text-emerald-700">View All →</button>
      }>
        <div className="space-y-2">
          {centers.slice(0, 5).map((c) => {
            const status = Number(c.balance) > 0 ? 'Active' : 'Inactive'
            return (
              <button key={c.username} onClick={() => navigate(`/centers/${c.username}`)} className="w-full flex items-center justify-between py-2.5 border-b border-emerald-100/50 last:border-0 text-left hover:opacity-80 transition-opacity">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">{c.full_name}</div>
                  <div className="text-xs text-slate-400 font-mono">{c.username}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">{formatAmount(c.balance)}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{status}</span>
                </div>
              </button>
            )
          })}
          {centers.length === 0 && <EmptyState text="No centers assigned to you." />}
        </div>
      </SectionCard>
    </div>
  )
}
