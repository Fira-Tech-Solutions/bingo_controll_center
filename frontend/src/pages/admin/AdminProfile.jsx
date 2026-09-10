import { useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, Field } from '../../components/UI'

const inputClass = "w-full h-11 px-4 rounded-xl bg-coral-50/50 focus:bg-white outline-none border border-coral-100 focus:border-coral-500 text-sm font-medium text-slate-800 transition-colors"

export default function AdminProfile() {
  const { token, user } = useAuth()
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.updateProfile(token, form)
      setNotice('Profile updated.')
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}
      {notice && <Banner tone="success" text={notice} />}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your account information</p>
      </section>
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50 max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-coral-500 text-white flex items-center justify-center font-extrabold text-xl">{user?.full_name?.charAt(0) || 'A'}</div>
          <div><div className="font-extrabold text-lg text-slate-900">{user?.full_name}</div><div className="text-sm text-slate-500">{user?.username} • {user?.role}</div></div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Full Name"><input className={inputClass} value={form.full_name} onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))} /></Field>
          <Field label="Email"><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} /></Field>
          <Field label="Phone"><input className={inputClass} value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} /></Field>
          <button disabled={loading} className="px-6 py-2.5 rounded-xl bg-coral-500 text-white font-bold text-sm shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">Save Changes</button>
        </form>
      </section>
    </div>
  )
}
