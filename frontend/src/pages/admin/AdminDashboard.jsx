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
    <button onClick={onClick} className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50 text-left w-full hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{title}</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-coral-50 text-coral-600 shrink-0">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
    </button>
  )
}

function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-soft border border-coral-100/50 ${className}`}>
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

function AlertRow({ item }) {
  const severityColors = {
    critical: 'bg-red-50 text-red-600 border-red-200',
    warning: 'bg-amber-50 text-amber-600 border-amber-200',
    info: 'bg-blue-50 text-blue-600 border-blue-200',
  }
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${severityColors[item.severity] || severityColors.info}`}>
      <span className="material-symbols-outlined text-[18px] mt-0.5">
        {item.severity === 'critical' ? 'error' : item.severity === 'warning' ? 'warning' : 'info'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{item.title}</p>
        {item.detail && <p className="text-xs mt-0.5 opacity-80">{item.detail}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('today')
  const [analytics, setAnalytics] = useState(null)
  const [centers, setCenters] = useState([])
  const [transactions, setTransactions] = useState([])
  const [operators, setOperators] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [a, c, t, o, p] = await Promise.allSettled([
        api.getAnalytics(token),
        api.getCenters(token),
        api.getTransactions(token, user?.username),
        api.getOperators(token),
        api.getPackages(token, 1, 50),
      ])
      if (a.status === 'fulfilled') setAnalytics(a.value.data)
      if (c.status === 'fulfilled') setCenters(c.value.data)
      if (t.status === 'fulfilled') setTransactions(t.value.data)
      if (o.status === 'fulfilled') setOperators(o.value.data)
      if (p.status === 'fulfilled') setPackages(p.value.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const periodStart = useMemo(() => getPeriodRange(period), [period])
  const filtered = useMemo(() => transactions.filter((t) => new Date(t.timestamp) >= periodStart), [transactions, periodStart])

  const totalPaid = filtered.reduce((s, t) => s + Number(t.actualAmount || 0), 0)
  const totalIssued = filtered.reduce((s, t) => s + Number(t.generatedAmount || 0), 0)
  const activeOps = operators.filter((o) => !o.isBanned).length

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      {/* Header */}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">{greeting}, {user?.full_name?.split(' ')[0] || 'Admin'}</h2>
        <p className="text-slate-500 mt-1 text-sm">Here's what's happening across your centers today.</p>
      </section>

      {/* Period Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${period === p.value ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20' : 'bg-white text-slate-600 border border-coral-100 hover:bg-coral-50'}`}>{p.label}</button>
        ))}
      </div>

      {/* KPI Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Assigned Centers" value={String(centers.length)} icon="storefront" onClick={() => navigate('/admin/centers')} />
        <KpiCard title="Agents" value={String(activeOps)} icon="badge" onClick={() => navigate('/admin/agents')} />
        <KpiCard title="Transactions" value={String(filtered.length)} icon="receipt_long" onClick={() => navigate('/admin/transactions')} />
        <KpiCard title="Payments" value={formatAmount(totalPaid)} icon="payments" onClick={() => navigate('/admin/reports')} />
        <KpiCard title="Balance Issued" value={formatAmount(totalIssued)} icon="generating_tokens" onClick={() => navigate('/admin/reports')} />
        <KpiCard title="Packages" value={String(packages.filter((p) => p.isActive).length)} icon="inventory_2" onClick={() => navigate('/admin/packages')} />
      </section>

      {/* Financial + Alerts */}
      <section className="grid xl:grid-cols-12 gap-6">
        <SectionCard title="Financial Overview" subtitle={`${period.toUpperCase()} period`} className="xl:col-span-8" action={
          <button onClick={() => navigate('/admin/reports')} className="text-xs font-semibold text-coral-600 hover:text-coral-700">View Reports →</button>
        }>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/admin/reports')} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 text-left hover:shadow-md transition-shadow">
              <div className="text-xs text-slate-500 font-semibold">Total Payments</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{formatAmount(totalPaid)}</div>
            </button>
            <button onClick={() => navigate('/admin/reports')} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 text-left hover:shadow-md transition-shadow">
              <div className="text-xs text-slate-500 font-semibold">Balance Issued</div>
              <div className="mt-1 text-xl font-extrabold text-coral-600">{formatAmount(totalIssued)}</div>
            </button>
            <button onClick={() => navigate('/admin/transactions')} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 text-left hover:shadow-md transition-shadow">
              <div className="text-xs text-slate-500 font-semibold">Transactions</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{filtered.length}</div>
            </button>
            <button onClick={() => navigate('/admin/agents')} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 text-left hover:shadow-md transition-shadow">
              <div className="text-xs text-slate-500 font-semibold">Active Agents</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{activeOps}</div>
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Needs Attention" subtitle="Operational alerts" className="xl:col-span-4">
          <div className="space-y-3">
            {centers.filter((c) => Number(c.balance) === 0).length > 0 && (
              <AlertRow item={{ severity: 'warning', title: `${centers.filter((c) => Number(c.balance) === 0).length} center(s) with zero balance`, detail: 'Consider recharging' }} />
            )}
            {operators.filter((o) => o.isBanned).length > 0 && (
              <AlertRow item={{ severity: 'critical', title: `${operators.filter((o) => o.isBanned).length} banned agent(s)`, detail: 'Review agent accounts' }} />
            )}
            {centers.filter((c) => Number(c.balance) === 0).length === 0 && operators.filter((o) => o.isBanned).length === 0 && (
              <div className="text-center py-6 text-sm text-slate-400 font-medium">All systems operating normally</div>
            )}
          </div>
        </SectionCard>
      </section>

      {/* Recent Transactions + Centers */}
      <section className="grid xl:grid-cols-12 gap-6">
        <SectionCard title="Recent Transactions" subtitle="Latest ledger events" className="xl:col-span-7" action={
          <button onClick={() => navigate('/admin/transactions')} className="text-xs font-semibold text-coral-600 hover:text-coral-700">View All →</button>
        }>
          <div className="space-y-1">
            {filtered.slice(0, 6).map((tx) => (
              <button key={tx.id} onClick={() => navigate('/admin/transactions')} className="w-full flex items-center justify-between py-2.5 border-b border-coral-100/50 last:border-0 text-left hover:opacity-80 transition-opacity">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">{tx.bingoCenterUsername}</div>
                  <div className="text-xs text-slate-400">{formatDate(tx.timestamp)} • by {tx.debitedBy}</div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-sm font-bold text-slate-900">{formatAmount(tx.actualAmount)}</div>
                  <div className="text-xs text-coral-600">→ {formatAmount(tx.generatedAmount)}</div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <EmptyState text="No transactions in this period." />}
          </div>
        </SectionCard>

        <SectionCard title="Your Centers" subtitle="Assigned centers" className="xl:col-span-5" action={
          <button onClick={() => navigate('/admin/centers')} className="text-xs font-semibold text-coral-600 hover:text-coral-700">View All →</button>
        }>
          <div className="space-y-2">
            {centers.slice(0, 5).map((c) => {
              const status = Number(c.balance) > 0 ? 'Active' : 'Inactive'
              return (
                <button key={c.username} onClick={() => navigate(`/centers/${c.username}`)} className="w-full flex items-center justify-between py-2.5 border-b border-coral-100/50 last:border-0 text-left hover:opacity-80 transition-opacity">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-900 truncate">{c.full_name}</div>
                    <div className="text-xs text-slate-400 font-mono">{c.username}</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ml-2 ${status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{status}</span>
                </button>
              )
            })}
            {centers.length === 0 && <EmptyState text="No centers assigned." />}
          </div>
        </SectionCard>
      </section>
    </div>
  )
}
