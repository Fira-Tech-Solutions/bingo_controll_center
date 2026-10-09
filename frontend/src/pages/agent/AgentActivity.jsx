import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatDate } from '../../components/UI'

export default function AgentActivity() {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.getMyTransactions(token)
      setTransactions(res.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const activities = useMemo(() => {
    return transactions.slice(0, 30).map((tx) => ({
      type: 'generated',
      actor: tx.debitedBy,
      action: 'generated balance file for',
      resource: tx.bingoCenterUsername,
      timestamp: tx.timestamp,
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [transactions])

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-emerald-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Activity</h2>
        <p className="text-sm text-slate-500 mt-1">Operational timeline for your assigned centers</p>
      </section>
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-emerald-100/50">
        {activities.length > 0 ? (
          <div className="space-y-1">
            {activities.map((item, i) => {
              const iconMap = { created: 'add_circle', generated: 'key', updated: 'edit', banned: 'block' }
              return (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-emerald-100/50 last:border-0">
                  <span className="material-symbols-outlined text-[20px] text-[#059669]">{iconMap[item.type] || 'info'}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-slate-900">{item.actor}</span>
                    <span className="text-sm text-slate-500"> {item.action} </span>
                    <span className="text-sm font-semibold text-slate-900">{item.resource}</span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{formatDate(item.timestamp)}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState text="No activity recorded yet." />
        )}
      </section>
    </div>
  )
}
