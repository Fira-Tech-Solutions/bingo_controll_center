import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Banner, Field, EmptyState } from '../components/UI'

const DEFAULT_OPERATOR = { username: '', full_name: '', email: '', password: '' }
const inputClass = "w-full h-11 px-4 rounded-xl bg-coral-50/50 focus:bg-white outline-none border border-coral-100 focus:border-coral-500 text-sm font-medium text-slate-800 transition-colors"

export default function UsersPage() {
  const { token } = useAuth()
  const [operators, setOperators] = useState([])
  const [operatorForm, setOperatorForm] = useState(DEFAULT_OPERATOR)
  const [resetPassword, setResetPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.getOperators(token)
      setOperators(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOperator(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.createOperator(token, operatorForm)
      setOperatorForm(DEFAULT_OPERATOR)
      setNotice(`Operator ${operatorForm.username} created.`)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleBan(username) {
    setLoading(true)
    setError('')
    try {
      await api.toggleOperatorBan(token, username)
      setNotice(`Operator status updated: ${username}`)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(username) {
    if (!resetPassword.trim()) {
      setError('Enter a new password first.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.resetOperatorPassword(token, username, { newPassword: resetPassword })
      setNotice(`Password reset for ${username}`)
      setResetPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteOperator(username) {
    const yes = window.confirm(`Delete operator ${username}?`)
    if (!yes) return
    setLoading(true)
    setError('')
    try {
      await api.deleteOperator(token, username)
      setNotice(`Operator deleted: ${username}`)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid xl:grid-cols-12 gap-6">
      {error && <div className="xl:col-span-12"><Banner tone="error" text={error} /></div>}
      {notice && <div className="xl:col-span-12"><Banner tone="success" text={notice} /></div>}

      {/* Create Operator Form */}
      <section className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Create Operator</h3>
        <p className="text-sm text-slate-500 mt-1">Uses `POST /api/operators`.</p>
        <form onSubmit={handleCreateOperator} className="space-y-4 mt-4">
          <Field label="Username"><input className={`${inputClass} font-mono`} value={operatorForm.username} onChange={(e) => setOperatorForm((s) => ({ ...s, username: e.target.value }))} required /></Field>
          <Field label="Full Name"><input className={inputClass} value={operatorForm.full_name} onChange={(e) => setOperatorForm((s) => ({ ...s, full_name: e.target.value }))} required /></Field>
          <Field label="Email"><input className={inputClass} type="email" value={operatorForm.email} onChange={(e) => setOperatorForm((s) => ({ ...s, email: e.target.value }))} required /></Field>
          <Field label="Password"><input className={inputClass} type="password" value={operatorForm.password} onChange={(e) => setOperatorForm((s) => ({ ...s, password: e.target.value }))} required /></Field>
          <button disabled={loading} className="w-full h-11 rounded-xl bg-coral-500 text-white font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">
            <i className="fa-solid fa-user-plus mr-2"></i>Create Operator
          </button>
        </form>
      </section>

      {/* Operators List */}
      <section className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Users & Agents</h3>
            <p className="text-sm text-slate-500 mt-1">Uses admin operator endpoints for listing, ban/unban, reset password, and delete.</p>
          </div>
          <div className="px-3 py-2 rounded-full bg-coral-50 text-coral-600 font-mono text-sm font-bold border border-coral-100">{operators.length} operators</div>
        </div>
        <div className="space-y-4">
          {operators.map((op) => (
            <div key={op.username} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900">{op.full_name}</div>
                  <div className="text-sm text-slate-500 font-mono">{op.username} • {op.email}</div>
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-1 rounded-full font-bold ${op.isBanned ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>
                      {op.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleToggleBan(op.username)} disabled={loading} className="px-3 py-2 rounded-lg bg-coral-50 text-coral-600 text-sm font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">
                      {op.isBanned ? 'Unban' : 'Ban'}
                    </button>
                    <button onClick={() => handleDeleteOperator(op.username)} disabled={loading} className="px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-md shadow-red-500/20">
                      <i className="fa-solid fa-trash mr-1"></i>Delete
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input placeholder="New password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="h-10 px-3 rounded-lg bg-white border border-coral-100 min-w-[180px] text-sm font-medium focus:outline-none focus:border-coral-500" />
                    <button onClick={() => handleResetPassword(op.username)} disabled={loading} className="px-3 py-2 rounded-lg bg-coral-500 text-white text-sm font-bold hover:bg-coral-600 transition-colors shadow-md shadow-coral-500/20">
                      <i className="fa-solid fa-key mr-1"></i>Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {operators.length === 0 && <EmptyState text="No operators found." />}
        </div>
      </section>
    </div>
  )
}
