import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, Field, EmptyState, formatDate } from '../../components/UI'

const inputClass = "w-full h-11 px-4 rounded-xl bg-coral-50/50 focus:bg-white outline-none border border-coral-100 focus:border-coral-500 text-sm font-medium text-slate-800 transition-colors"

export default function SuperAdminAdmins() {
  const { token, user } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '', confirmPassword: '' })
  const [formStep, setFormStep] = useState('form')
  const [resetPasswords, setResetPasswords] = useState({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.getAdmins(token)
      setAdmins(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search) return admins
    const q = search.toLowerCase()
    return admins.filter((a) => a.full_name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
  }, [admins, search])

  function handleFormChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
  }

  function handleReview(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError('')
    setFormStep('review')
  }

  async function handleCreate() {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.createAdmin(token, { username: form.username, full_name: form.full_name, email: form.email, password: form.password })
      setNotice(`Administrator ${form.username} created successfully.`)
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
    setError('')
    try {
      await api.toggleAdminBan(token, username)
      setNotice(`Administrator ${username} status updated.`)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(username) {
    const pw = resetPasswords[username]
    if (!pw || pw.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.resetAdminPassword(token, username, { newPassword: pw })
      setNotice(`Password reset for ${username}.`)
      setResetPasswords((s) => ({ ...s, [username]: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(username) {
    if (!window.confirm(`Delete administrator ${username}? This action cannot be undone.`)) return
    setLoading(true)
    setError('')
    try {
      await api.deleteAdmin(token, username)
      setNotice(`Administrator ${username} deleted.`)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}
      {notice && <Banner tone="success" text={notice} />}

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search administrators..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-coral-100 text-sm font-medium focus:outline-none focus:border-coral-500" />
      </div>

      {/* Create Form */}
      {showCreate && (
        <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
          {formStep === 'form' ? (
            <>
              <h3 className="font-extrabold text-lg text-slate-900">Create Administrator</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Administrators can create and manage Agent accounts according to their permissions.</p>
              <form onSubmit={handleReview} className="space-y-4">
                <Field label="Full Name">
                  <input name="full_name" className={inputClass} value={form.full_name} onChange={handleFormChange} required />
                </Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Username">
                    <input name="username" className={`${inputClass} font-mono`} value={form.username} onChange={handleFormChange} required />
                  </Field>
                  <Field label="Email">
                    <input name="email" type="email" className={inputClass} value={form.email} onChange={handleFormChange} required />
                  </Field>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Password">
                    <input name="password" type="password" className={inputClass} value={form.password} onChange={handleFormChange} required />
                  </Field>
                  <Field label="Confirm Password">
                    <input name="confirmPassword" type="password" className={inputClass} value={form.confirmPassword} onChange={handleFormChange} required />
                  </Field>
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
                <div className="flex justify-between"><span className="text-sm text-slate-500">Role</span><span className="text-sm font-bold text-coral-600">ADMINISTRATOR</span></div>
              </div>
              <p className="text-xs text-slate-500 mt-3">Administrators can create and manage Agent accounts according to their permissions.</p>
              <div className="flex gap-3 mt-4">
                <button onClick={handleCreate} disabled={loading} className="px-6 py-2.5 rounded-xl bg-coral-500 text-white font-bold text-sm shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">
                  {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Create Administrator'}
                </button>
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
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Administrator</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Created</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((op) => (
              <tr key={op.username} className="border-b border-coral-100/50 hover:bg-coral-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center font-bold text-sm">{op.full_name?.charAt(0)}</div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{op.full_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{op.username} • {op.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${op.isBanned ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                    {op.isBanned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-slate-500">{formatDate(op.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleToggleBan(op.username)} disabled={loading} className="px-3 py-1.5 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">{op.isBanned ? 'Unban' : 'Ban'}</button>
                    <button onClick={() => handleDelete(op.username)} disabled={loading} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200 hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="No administrators found." />}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filtered.map((op) => (
          <div key={op.username} className="bg-white rounded-2xl p-4 shadow-soft border border-coral-100/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center font-bold text-sm shrink-0">{op.full_name?.charAt(0)}</div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{op.full_name}</div>
                  <div className="text-xs text-slate-500 font-mono truncate">{op.username}</div>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${op.isBanned ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                {op.isBanned ? 'Banned' : 'Active'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => handleToggleBan(op.username)} disabled={loading} className="flex-1 py-2 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100">{op.isBanned ? 'Unban' : 'Ban'}</button>
              <button onClick={() => handleDelete(op.username)} disabled={loading} className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200">Delete</button>
            </div>
            <div className="flex gap-2 mt-2">
              <input placeholder="New password" value={resetPasswords[op.username] || ''} onChange={(e) => setResetPasswords((s) => ({ ...s, [op.username]: e.target.value }))} className="flex-1 h-9 px-3 rounded-lg bg-white border border-coral-100 text-xs font-medium focus:outline-none focus:border-coral-500" />
              <button onClick={() => handleResetPassword(op.username)} disabled={loading} className="px-3 py-2 rounded-lg bg-coral-500 text-white text-xs font-bold hover:bg-coral-600 transition-colors">Reset</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState text="No administrators found." />}
      </div>


    </div>
  )
}
