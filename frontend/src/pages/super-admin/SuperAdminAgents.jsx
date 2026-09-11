import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, Field, EmptyState, formatAmount, formatDate } from '../../components/UI'

const inputClass = "w-full h-11 px-4 rounded-xl bg-coral-50/50 focus:bg-white outline-none border border-coral-100 focus:border-coral-500 text-sm font-medium text-slate-800 transition-colors"

export default function SuperAdminAgents() {
  const { token } = useAuth()
  const [operators, setOperators] = useState([])
  const [centers, setCenters] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '', confirmPassword: '' })
  const [formStep, setFormStep] = useState('form')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [opsRes, centersRes, txRes] = await Promise.all([
        api.getOperators(token),
        api.getCenters(token),
        api.getTransactions(token),
      ])
      setOperators(opsRes.data)
      setCenters(centersRes.data)
      setTransactions(txRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const agentsWithStats = useMemo(() => {
    return operators.map((op) => {
      const agentCenters = centers.filter((c) => c.createdBy === op.username)
      const agentTxns = transactions.filter((t) => t.debitedBy === op.username)
      const totalIssued = agentTxns.reduce((s, t) => s + Number(t.generatedAmount || 0), 0)
      const lastTxn = agentTxns[0]
      return { ...op, agentCenters, agentTxns, totalIssued, lastTxn, txnCount: agentTxns.length }
    })
  }, [operators, centers, transactions])

  const filtered = useMemo(() => {
    if (!search) return agentsWithStats
    const q = search.toLowerCase()
    return agentsWithStats.filter((a) => a.full_name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q))
  }, [agentsWithStats, search])

  function handleFormChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
  }

  function handleReview(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError('')
    setFormStep('review')
  }

  async function handleCreate() {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.createOperator(token, { username: form.username, full_name: form.full_name, email: form.email, password: form.password })
      setNotice(`Agent ${form.username} created.`)
      setForm({ username: '', full_name: '', email: '', password: '', confirmPassword: '' })
      setFormStep('form')
      setShowCreate(false)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleBan(username) {
    setLoading(true)
    try {
      await api.toggleOperatorBan(token, username)
      setNotice(`Agent ${username} status updated.`)
      await loadData()
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  async function handleDelete(username) {
    if (!window.confirm(`Delete agent ${username}? This action cannot be undone.`)) return
    setLoading(true)
    try {
      await api.deleteOperator(token, username)
      setNotice(`Agent ${username} deleted.`)
      await loadData()
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}
      {notice && <Banner tone="success" text={notice} />}

      <section className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agents..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-coral-100 text-sm font-medium focus:outline-none focus:border-coral-500" /></div>
      </section>

      {showCreate && (
        <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
          {formStep === 'form' ? (
            <>
              <h3 className="font-extrabold text-lg text-slate-900">Create Agent</h3>
              <form onSubmit={handleReview} className="space-y-4 mt-4">
                <Field label="Full Name"><input name="full_name" className={inputClass} value={form.full_name} onChange={handleFormChange} required /></Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Username"><input name="username" className={`${inputClass} font-mono`} value={form.username} onChange={handleFormChange} required /></Field>
                  <Field label="Email"><input name="email" type="email" className={inputClass} value={form.email} onChange={handleFormChange} required /></Field>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Password"><input name="password" type="password" className={inputClass} value={form.password} onChange={handleFormChange} required /></Field>
                  <Field label="Confirm Password"><input name="confirmPassword" type="password" className={inputClass} value={form.confirmPassword} onChange={handleFormChange} required /></Field>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-coral-500 text-white font-bold text-sm shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors">Review</button>
                  <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h3 className="font-extrabold text-lg text-slate-900">Review & Confirm</h3>
              <div className="mt-4 p-5 rounded-xl bg-coral-50 border border-coral-100 space-y-3">
                <div className="flex justify-between"><span className="text-sm text-slate-500">Name</span><span className="text-sm font-bold text-slate-900">{form.full_name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500">Username</span><span className="text-sm font-bold text-slate-900 font-mono">{form.username}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500">Email</span><span className="text-sm font-bold text-slate-900">{form.email}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500">Role</span><span className="text-sm font-bold text-coral-600">OPERATOR (Agent)</span></div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleCreate} disabled={loading} className="px-6 py-2.5 rounded-xl bg-coral-500 text-white font-bold text-sm shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">{loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Create Agent'}</button>
                <button onClick={() => setFormStep('form')} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors">Back</button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-soft border border-coral-100/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-coral-100">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Agent</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Centers</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Transactions</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Balance Issued</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Last Activity</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.username} className="border-b border-coral-100/50 hover:bg-coral-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center font-bold text-sm">{a.full_name?.charAt(0)}</div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{a.full_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{a.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${a.isBanned ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>{a.isBanned ? 'Banned' : 'Active'}</span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{a.agentCenters.length}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-700">{a.txnCount}</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{formatAmount(a.totalIssued)}</td>
                <td className="px-6 py-4 text-right text-xs text-slate-500">{a.lastTxn ? formatDate(a.lastTxn.timestamp) : '—'}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleToggleBan(a.username)} disabled={loading} className="px-3 py-1.5 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">{a.isBanned ? 'Unban' : 'Ban'}</button>
                    <button onClick={() => handleDelete(a.username)} disabled={loading} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="No agents found." />}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filtered.map((a) => (
          <div key={a.username} className="bg-white rounded-2xl p-4 shadow-soft border border-coral-100/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center font-bold text-sm shrink-0">{a.full_name?.charAt(0)}</div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{a.full_name}</div>
                  <div className="text-xs text-slate-500 font-mono truncate">{a.username}</div>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${a.isBanned ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>{a.isBanned ? 'Banned' : 'Active'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2 rounded-lg bg-coral-50/50">
                <div className="text-xs text-slate-500">Centers</div>
                <div className="font-bold text-sm text-slate-900">{a.agentCenters.length}</div>
              </div>
              <div className="p-2 rounded-lg bg-coral-50/50">
                <div className="text-xs text-slate-500">Transactions</div>
                <div className="font-bold text-sm text-slate-900">{a.txnCount}</div>
              </div>
              <div className="p-2 rounded-lg bg-coral-50/50">
                <div className="text-xs text-slate-500">Issued</div>
                <div className="font-bold text-sm text-slate-900">{formatAmount(a.totalIssued)}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleToggleBan(a.username)} disabled={loading} className="flex-1 py-2 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100">{a.isBanned ? 'Unban' : 'Ban'}</button>
              <button onClick={() => handleDelete(a.username)} disabled={loading} className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200">Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState text="No agents found." />}
      </div>

    </div>
  )
}
