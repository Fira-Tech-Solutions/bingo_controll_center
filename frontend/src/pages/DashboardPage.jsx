import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Banner, MetricCard, EmptyState, formatDate, formatAmount } from '../components/UI'

export default function DashboardPage() {
  const { token, user, isAdmin } = useAuth()
  const navigate = useNavigate()
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
      const centerFilter = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? undefined : user.username
      const [analyticsRes, centersRes, transactionsRes] = await Promise.all([
        api.getAnalytics(token),
        api.getCenters(token, centerFilter),
        api.getTransactions(token, user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? undefined : user.username),
      ])
      setAnalytics(analyticsRes.data)
      setCenters(centersRes.data)
      setTransactions(transactionsRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      {/* Hero Banner */}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50 flex flex-col xl:flex-row gap-5 justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-50 text-coral-600 text-sm font-bold border border-coral-100">
            <span className="w-2 h-2 rounded-full bg-coral-500"></span>
            OPERATIONAL CLEARANCE
          </div>
          <h2 className="font-extrabold text-3xl text-slate-900 mt-3 tracking-tight">Executive Control & System Telemetry</h2>
          <p className="text-slate-500 mt-2 max-w-3xl text-sm">Live values come from the backend analytics, centers, and recharge history endpoints. Use the balance and credential actions to generate the encrypted files used by terminals.</p>
        </div>
        <div className="flex items-center">
          <button onClick={() => navigate('/balance-file')} className="px-5 py-3 rounded-xl bg-coral-500 text-white font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors text-sm">
            <i className="fa-solid fa-plus mr-2"></i>Quick Generate Balance File
          </button>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Active Bingo Centers" value={String(analytics?.activeCenters || centers.length)} accent="primary" icon="storefront" sub={`Loaded centers: ${centers.length}`} />
        <MetricCard title="Customer Payments Settled" value={formatAmount(analytics?.totalBalance)} accent="secondary" icon="payments" sub="Based on actual_amount ledger" />
        <MetricCard title="Issued Balance Today" value={formatAmount(analytics?.todayGeneratedTopups)} accent="primary" icon="generating_tokens" sub="Based on generated_amount today" />
        <MetricCard title="Transactions Recorded" value={String(transactions.length)} accent="secondary" icon="receipt_long" sub="Recharge history entries" />
      </section>

      {/* Center Balances & Recent Transactions */}
      <section className="grid xl:grid-cols-12 gap-6">
        {/* Recent Center Balances */}
        <div className="xl:col-span-7 bg-white rounded-2xl shadow-soft p-6 border border-coral-100/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Recent Center Balances</h3>
              <p className="text-slate-500 text-sm mt-1">Actual and online balances aggregated from the API.</p>
            </div>
          </div>
          <div className="space-y-3">
            {centers.slice(0, 6).map((center) => (
              <div key={center.username} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900">{center.full_name}</div>
                  <div className="text-sm text-slate-500 font-mono">{center.username} • {center.mac_address}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm min-w-[320px]">
                  <div>
                    <div className="text-slate-500 text-xs">Ledger Balance</div>
                    <div className="font-bold text-slate-900">{formatAmount(center.balance)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Online Pending</div>
                    <div className="font-bold text-coral-600">{formatAmount(center.onlineBalance)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Paid Online</div>
                    <div className="font-bold text-emerald-600">{formatAmount(center.onlinePaidBalance)}</div>
                  </div>
                </div>
              </div>
            ))}
            {centers.length === 0 && <EmptyState text="No centers found for this account." />}
          </div>
        </div>

        {/* Recent Ledger Events */}
        <div className="xl:col-span-5 bg-white rounded-2xl shadow-soft p-6 border border-coral-100/50">
          <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Recent Ledger Events</h3>
          <div className="mt-4 space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{tx.bingoCenterUsername}</div>
                    <div className="text-xs text-slate-500 font-mono">{formatDate(tx.timestamp)}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-coral-50 text-coral-600 font-bold border border-coral-100">{tx.debitedBy}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  <div>
                    <div className="text-slate-500 text-xs">Paid</div>
                    <div className="font-bold text-emerald-600">{formatAmount(tx.actualAmount)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">Generated</div>
                    <div className="font-bold text-coral-600">{formatAmount(tx.generatedAmount)}</div>
                  </div>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && <EmptyState text="No transactions available yet." />}
          </div>
        </div>
      </section>
    </div>
  )
}
