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
  { label: 'This Year', value: 'year' },
]

function getPeriodRange(period) {
  const now = new Date()
  const start = new Date(now)
  switch (period) {
    case 'today': start.setHours(0, 0, 0, 0); break
    case '7d': start.setDate(now.getDate() - 7); break
    case '30d': start.setDate(now.getDate() - 30); break
    case '90d': start.setDate(now.getDate() - 90); break
    case 'year': start.setMonth(0, 1); start.setHours(0, 0, 0, 0); break
    default: start.setHours(0, 0, 0, 0)
  }
  return start
}

function KpiCard({ title, value, trend, trendLabel, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50 text-left w-full hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{title}</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-coral-50 text-coral-600 shrink-0">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend !== undefined && (
            <span className={`font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
          {trendLabel && <span className="text-slate-400">{trendLabel}</span>}
        </div>
      )}
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

function InsightCard({ text, icon }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-coral-50/50 border border-coral-100/50">
      <span className="material-symbols-outlined text-coral-500 text-[20px] mt-0.5">{icon}</span>
      <p className="text-sm text-slate-700 font-medium">{text}</p>
    </div>
  )
}

function ActivityRow({ item }) {
  const iconMap = {
    created: 'add_circle',
    generated: 'key',
    updated: 'edit',
    banned: 'block',
    deactivated: 'cancel',
    completed: 'check_circle',
    suspended: 'pause_circle',
  }
  return (
    <div className="flex items-start gap-3 py-3 border-b border-coral-100/50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-coral-50 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-coral-500 text-[16px]">{iconMap[item.type] || 'circle'}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-800">
          <span className="font-bold">{item.actor}</span>{' '}
          <span className="text-slate-500">{item.action}</span>{' '}
          <span className="font-semibold">{item.resource}</span>
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{formatDate(item.timestamp)}</p>
      </div>
      {item.amount && (
        <span className="text-sm font-bold text-slate-900 shrink-0">{formatAmount(item.amount)}</span>
      )}
    </div>
  )
}

function CenterRankRow({ rank, name, activity, balance, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-2.5 border-b border-coral-100/50 last:border-0 text-left hover:opacity-80 transition-opacity">
      <span className="w-6 h-6 rounded-full bg-coral-50 text-coral-600 flex items-center justify-center text-xs font-bold">{rank}</span>
      <span className="font-semibold text-sm text-slate-900 flex-1 min-w-0 truncate">{name}</span>
      <span className="text-xs text-slate-500 shrink-0">{activity}</span>
      <span className="text-sm font-bold text-slate-900 shrink-0">{formatAmount(balance)}</span>
    </button>
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
      <span className="text-xs opacity-60 shrink-0">{formatDate(item.timestamp)}</span>
    </div>
  )
}

export default function SuperAdminDashboard() {
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
      const [analyticsRes, centersRes, transactionsRes, operatorsRes, packagesRes] = await Promise.allSettled([
        api.getAnalytics(token),
        api.getCenters(token),
        api.getTransactions(token),
        api.getOperators(token),
        api.getPackages(token, 1, 50),
      ])
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data)
      if (centersRes.status === 'fulfilled') setCenters(centersRes.value.data)
      if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value.data)
      if (operatorsRes.status === 'fulfilled') setOperators(operatorsRes.value.data)
      if (packagesRes.status === 'fulfilled') setPackages(packagesRes.value.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const periodStart = useMemo(() => getPeriodRange(period), [period])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => new Date(t.timestamp) >= periodStart)
  }, [transactions, periodStart])

  const totalPayments = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + Number(t.actualAmount || 0), 0)
  }, [filteredTransactions])

  const totalBalanceIssued = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + Number(t.generatedAmount || 0), 0)
  }, [filteredTransactions])

  const avgPayment = filteredTransactions.length > 0 ? Math.round(totalPayments / filteredTransactions.length) : 0

  const activeCenters = centers.length
  const activeOperators = operators.filter((o) => !o.isBanned).length
  const activePackages = packages.filter((p) => p.isActive).length

  const recentTransactions = filteredTransactions.slice(0, 8)

  const centerRanking = useMemo(() => {
    const map = {}
    filteredTransactions.forEach((t) => {
      if (!map[t.bingoCenterUsername]) map[t.bingoCenterUsername] = { count: 0, balance: 0 }
      map[t.bingoCenterUsername].count++
      map[t.bingoCenterUsername].balance += Number(t.actualAmount || 0)
    })
    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredTransactions])

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
        <p className="text-slate-500 mt-1 text-sm">System overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </section>

      {/* Period Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              period === p.value
                ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20'
                : 'bg-white text-slate-600 border border-coral-100 hover:bg-coral-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Bingo Centers" value={activeCenters} icon="storefront" onClick={() => navigate('/super-admin/centers')} />
        <KpiCard title="Administrators" value={operators.length} icon="admin_panel_settings" onClick={() => navigate('/super-admin/users/admins')} />
        <KpiCard title="Agents" value={activeOperators} icon="badge" onClick={() => navigate('/super-admin/users/agents')} />
        <KpiCard title="Packages Active" value={activePackages} icon="inventory_2" onClick={() => navigate('/super-admin/packages')} />
        <KpiCard title="Transactions" value={filteredTransactions.length} icon="receipt_long" onClick={() => navigate('/super-admin/transactions')} />
        <KpiCard title="Today's Payments" value={formatAmount(totalPayments)} icon="payments" onClick={() => navigate('/super-admin/reports')} />
      </section>

      {/* Financial Overview */}
      <section className="grid xl:grid-cols-12 gap-6">
        <SectionCard title="Financial Overview" subtitle={`${period.toUpperCase()} period`} className="xl:col-span-8" action={
          <button onClick={() => navigate('/super-admin/reports')} className="text-xs font-semibold text-coral-600 hover:text-coral-700">View Reports →</button>
        }>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/super-admin/reports')} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 text-left hover:shadow-md transition-shadow">
              <div className="text-xs text-slate-500 font-semibold">Total Payments</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{formatAmount(totalPayments)}</div>
            </button>
            <button onClick={() => navigate('/super-admin/reports')} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 text-left hover:shadow-md transition-shadow">
              <div className="text-xs text-slate-500 font-semibold">Balance Issued</div>
              <div className="mt-1 text-xl font-extrabold text-coral-600">{formatAmount(totalBalanceIssued)}</div>
            </button>
            <button onClick={() => navigate('/super-admin/transactions')} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 text-left hover:shadow-md transition-shadow">
              <div className="text-xs text-slate-500 font-semibold">Transactions</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{filteredTransactions.length}</div>
            </button>
            <button onClick={() => navigate('/super-admin/reports')} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 text-left hover:shadow-md transition-shadow">
              <div className="text-xs text-slate-500 font-semibold">Avg Payment</div>
              <div className="mt-1 text-xl font-extrabold text-slate-900">{formatAmount(avgPayment)}</div>
            </button>
          </div>
        </SectionCard>

        {/* Needs Attention */}
        <SectionCard title="Needs Attention" subtitle="System alerts" className="xl:col-span-4">
          <div className="space-y-3">
            {centers.filter((c) => Number(c.balance) === 0).length > 0 && (
              <AlertRow item={{ severity: 'warning', title: `${centers.filter((c) => Number(c.balance) === 0).length} center(s) with zero balance`, detail: 'Consider recharging these centers', timestamp: new Date() }} />
            )}
            {operators.filter((o) => o.isBanned).length > 0 && (
              <AlertRow item={{ severity: 'critical', title: `${operators.filter((o) => o.isBanned).length} banned operator(s)`, detail: 'Review banned accounts', timestamp: new Date() }} />
            )}
            {packages.filter((p) => !p.isActive).length > 0 && (
              <AlertRow item={{ severity: 'info', title: `${packages.filter((p) => !p.isActive).length} inactive package(s)`, detail: 'Packages are deactivated and unavailable', timestamp: new Date() }} />
            )}
            {centers.filter((c) => Number(c.balance) === 0).length === 0 && operators.filter((o) => o.isBanned).length === 0 && (
              <div className="text-center py-6 text-sm text-slate-400 font-medium">All systems operating normally</div>
            )}
          </div>
        </SectionCard>
      </section>

      {/* Center Activity + Recent Transactions */}
      <section className="grid xl:grid-cols-12 gap-6">
        <SectionCard title="Center Activity" subtitle="Ranked by transaction volume" className="xl:col-span-5">
          {centerRanking.length > 0 ? (
            <div>
              {centerRanking.map((c, i) => (
                <CenterRankRow key={c.name} rank={i + 1} name={c.name} activity={`${c.count} txns`} balance={c.balance} onClick={() => navigate('/super-admin/centers')} />
              ))}
            </div>
          ) : (
            <EmptyState text="No center activity in this period." />
          )}
        </SectionCard>

        <SectionCard title="Recent Transactions" subtitle="Latest ledger events" className="xl:col-span-7" action={
          <button onClick={() => navigate('/super-admin/transactions')} className="text-xs font-semibold text-coral-600 hover:text-coral-700">View All →</button>
        }>
          <div className="space-y-1">
            {recentTransactions.map((tx) => (
              <button key={tx.id} onClick={() => navigate('/super-admin/transactions')} className="w-full flex items-center justify-between py-2.5 border-b border-coral-100/50 last:border-0 text-left hover:opacity-80 transition-opacity">
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
            {recentTransactions.length === 0 && <EmptyState text="No transactions in this period." />}
          </div>
        </SectionCard>
      </section>

      {/* Activity Feed + Insights */}
      <section className="grid xl:grid-cols-12 gap-6">
        <SectionCard title="System Activity" subtitle="Recent operations" className="xl:col-span-7">
          <div>
            {filteredTransactions.slice(0, 6).map((tx) => (
              <ActivityRow key={tx.id} item={{
                actor: tx.debitedBy,
                action: 'generated balance file for',
                resource: tx.bingoCenterUsername,
                amount: tx.actualAmount,
                timestamp: tx.timestamp,
                type: 'generated',
              }} />
            ))}
            {operators.slice(0, 3).map((op) => (
              <ActivityRow key={op.username} item={{
                actor: 'System',
                action: 'registered',
                resource: op.full_name,
                timestamp: op.createdAt,
                type: 'created',
              }} />
            ))}
            {filteredTransactions.length === 0 && operators.length === 0 && (
              <EmptyState text="No activity recorded yet." />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Insights" subtitle="System analytics" className="xl:col-span-5">
          <div className="space-y-3">
            {totalPayments > 0 && (
              <InsightCard text={`Total payment volume of ${formatAmount(totalPayments)} across ${filteredTransactions.length} transactions in the ${period === 'today' ? 'current day' : period.replace('d', ' days')}.`} icon="payments" />
            )}
            {totalBalanceIssued > 0 && (
              <InsightCard text={`Issued ${formatAmount(totalBalanceIssued)} in balance across ${activeCenters} active center(s).`} icon="generating_tokens" />
            )}
            {activePackages > 0 && (
              <InsightCard text={`${activePackages} package(s) currently active and available for balance generation.`} icon="inventory_2" />
            )}
            {centerRanking.length > 0 && (
              <InsightCard text={`${centerRanking[0].name} leads with ${centerRanking[0].count} transaction(s) in this period.`} icon="leaderboard" />
            )}
            {totalPayments === 0 && totalBalanceIssued === 0 && (
              <div className="text-center py-6 text-sm text-slate-400 font-medium">No data available for insights yet.</div>
            )}
          </div>
        </SectionCard>
      </section>
    </div>
  )
}
