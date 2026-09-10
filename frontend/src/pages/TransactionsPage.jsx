import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Banner, EmptyState, formatDate, formatAmount } from '../components/UI'

export default function TransactionsPage() {
  const { token, user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const debitedBy = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? undefined : user.username
      const res = await api.getTransactions(token, debitedBy)
      setTransactions(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
      {error && <Banner tone="error" text={error} />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Transactions & Ledgers</h3>
          <p className="text-slate-500 text-sm mt-1">Loaded from `GET /api/transactions`.</p>
        </div>
        <div className="px-3 py-2 rounded-full bg-coral-50 text-coral-600 font-mono text-sm font-bold border border-coral-100">{transactions.length} records</div>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-coral-100">
              <th className="py-3 pr-4 font-semibold">Center</th>
              <th className="py-3 pr-4 font-semibold">Paid</th>
              <th className="py-3 pr-4 font-semibold">Generated</th>
              <th className="py-3 pr-4 font-semibold">Debited By</th>
              <th className="py-3 pr-4 font-semibold">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-coral-50 hover:bg-coral-50/30 transition-colors">
                <td className="py-3 pr-4 font-bold text-slate-900">{tx.bingoCenterUsername}</td>
                <td className="py-3 pr-4 text-emerald-600 font-bold">{formatAmount(tx.actualAmount)}</td>
                <td className="py-3 pr-4 text-coral-600 font-bold">{formatAmount(tx.generatedAmount)}</td>
                <td className="py-3 pr-4 font-mono text-xs text-slate-500">{tx.debitedBy}</td>
                <td className="py-3 pr-4 text-slate-600">{formatDate(tx.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && <div className="mt-4"><EmptyState text="No transactions found." /></div>}
    </section>
  )
}
