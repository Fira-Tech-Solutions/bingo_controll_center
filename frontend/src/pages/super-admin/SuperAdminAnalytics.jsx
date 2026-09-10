import { useEffect, useState, useMemo } from 'react'
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

function StatBlock({ label, value, sub }) {
  return (
    <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50">
      <div className="text-xs text-slate-500 font-semibold">{label}</div>
      <div className="mt-1 text-xl font-extrabold text-slate-900">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function SuperAdminAnalytics() {
  const { token } = useAuth()
  const [period, setPeriod] = useState('30d')
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
        api.getTransactions(token),
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
  const avgPayment = filtered.length > 0 ? Math.round(totalPaid / filtered.length) : 0
  const activeOps = operators.filter((o) => !o.isBanned).length

  const packageUsage = useMemo(() => {
    const map = {}
    filtered.forEach((t) => {
      const key = t.bingoCenterUsername
      if (!map[key]) map[key] = { count: 0, paid: 0, issued: 0 }
      map[key].count++
      map[key].paid += Number(t.actualAmount || 0)
      map[key].issued += Number(t.generatedAmount || 0)
    })
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count).slice(0, 10)
  }, [filtered])

  const centerDistribution = useMemo(() => {
    const map = {}
    filtered.forEach((t) => {
      if (!map[t.bingoCenterUsername]) map[t.bingoCenterUsername] = 0
      map[t.bingoCenterUsername]++
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [filtered])

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">System Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">Comprehensive system-wide analytics</p>
      </section>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${period === p.value ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20' : 'bg-white text-slate-600 border border-coral-100 hover:bg-coral-50'}`}>{p.label}</button>
        ))}
      </div>

      {/* Financial Analytics */}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mb-4">Financial Analytics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBlock label="Total Payments" value={formatAmount(totalPaid)} />
          <StatBlock label="Balance Issued" value={formatAmount(totalIssued)} sub={`${period.toUpperCase()} period`} />
          <StatBlock label="Transactions" value={String(filtered.length)} />
          <StatBlock label="Avg Payment" value={formatAmount(avgPayment)} />
        </div>
      </section>

      {/* Centers & Agents */}
      <section className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mb-4">Center Distribution</h3>
          {centerDistribution.length > 0 ? (
            <div className="space-y-2">
              {centerDistribution.map(([name, count]) => {
                const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900 w-40 truncate">{name}</span>
                    <div className="flex-1 h-2 rounded-full bg-coral-100 overflow-hidden">
                      <div className="h-full bg-coral-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-12 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
          ) : <EmptyState text="No data for this period." />}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mb-4">Top Centers by Volume</h3>
          {packageUsage.length > 0 ? (
            <div className="space-y-3">
              {packageUsage.map(([name, data], i) => (
                <div key={name} className="flex items-center justify-between py-2 border-b border-coral-100/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-coral-50 text-coral-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-sm font-semibold text-slate-900">{name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{data.count} txns</div>
                    <div className="text-xs text-slate-500">{formatAmount(data.paid)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState text="No data for this period." />}
        </div>
      </section>

      {/* System Overview */}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mb-4">System Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatBlock label="Total Centers" value={String(centers.length)} />
          <StatBlock label="Active Operators" value={String(activeOps)} sub={`${operators.length} total`} />
          <StatBlock label="Active Packages" value={String(packages.filter((p) => p.isActive).length)} sub={`${packages.length} total`} />
          <StatBlock label="Total Transactions" value={String(transactions.length)} />
          <StatBlock label="Total Balance" value={formatAmount(analytics?.totalBalance)} />
        </div>
      </section>
    </div>
  )
}
