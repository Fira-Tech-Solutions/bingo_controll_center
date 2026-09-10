import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatDate } from '../../components/UI'

export default function AdminActivity() {
  const { token, user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [t, o] = await Promise.all([
        api.getTransactions(token, user?.username),
        api.getOperators(token),
      ])
      setTransactions(t.data)
      setOperators(o.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const activities = useMemo(() => {
    const items = []
    transactions.slice(0, 20).forEach((tx) => {
      items.push({ type: 'generated', actor: tx.debitedBy, action: 'generated balance file for', resource: tx.bingoCenterUsername, timestamp: tx.timestamp })
    })
    operators.slice(0, 5).forEach((op) => {
      items.push({ type: 'created', actor: 'System', action: 'registered', resource: op.full_name, timestamp: op.createdAt })
    })
    return items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [transactions, operators])

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Activity</h2>
        <p className="text-sm text-slate-500 mt-1">Operational timeline for your scope</p>
      </section>
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        {activities.length > 0 ? (
          <div className="space-y-1">
            {activities.map((item, i) => {
              const iconMap = { created: 'add_circle', generated: 'key', updated: 'edit', banned: 'block' }
              return (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-coral-100/50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-coral-50 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-coral-500 text-[16px]">{iconMap[item.type] || 'circle'}</span></div>
                  <div className="min-w-0 flex-1"><p className="text-sm text-slate-800"><span className="font-bold">{item.actor}</span> <span className="text-slate-500">{item.action}</span> <span className="font-semibold">{item.resource}</span></p><p className="text-xs text-slate-400 mt-0.5">{formatDate(item.timestamp)}</p></div>
                </div>
              )
            })}
          </div>
        ) : <EmptyState text="No activity recorded yet." />}
      </section>
    </div>
  )
}
