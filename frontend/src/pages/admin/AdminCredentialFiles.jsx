import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatDate } from '../../components/UI'

export default function AdminCredentialFiles() {
  const { token, user } = useAuth()
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.getCenters(token)
      setCenters(res.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    if (!search) return centers
    const q = search.toLowerCase()
    return centers.filter((c) => c.full_name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q))
  }, [centers, search])

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Credential Files</h2>
        <p className="text-sm text-slate-500 mt-1">{filtered.length} center(s) • Encrypted terminal credential files</p>
      </section>
      <div className="relative"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search centers..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-coral-100 text-sm font-medium focus:outline-none focus:border-coral-500" /></div>
      <div className="hidden lg:block bg-white rounded-2xl shadow-soft border border-coral-100/50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-coral-100"><th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">File ID</th><th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Center</th><th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">MAC</th><th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Created By</th><th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Date</th></tr></thead>
          <tbody>{filtered.map((c) => (
            <tr key={c.username} className="border-b border-coral-100/50 hover:bg-coral-50/30 transition-colors">
              <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900">CRED-{c.username}</td>
              <td className="px-6 py-4"><div className="font-bold text-sm text-slate-900">{c.full_name}</div><div className="text-xs text-slate-500 font-mono">{c.username}</div></td>
              <td className="px-6 py-4 text-sm font-mono text-slate-700">{c.mac_address}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{c.createdBy}</td>
              <td className="px-6 py-4 text-right text-xs text-slate-500">{formatDate(c.createdAt)}</td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="No credential files found." />}
      </div>
      <div className="lg:hidden space-y-3">{filtered.map((c) => (
        <div key={c.username} className="bg-white rounded-2xl p-4 shadow-soft border border-coral-100/50">
          <div className="flex items-center justify-between"><span className="text-xs font-mono font-bold text-slate-900">CRED-{c.username}</span><span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200">Active</span></div>
          <div className="font-semibold text-sm text-slate-900 mt-1">{c.full_name}</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">{c.mac_address}</div>
          <div className="text-xs text-slate-500 mt-1">by {c.createdBy} • {formatDate(c.createdAt)}</div>
        </div>
      ))}{filtered.length === 0 && <EmptyState text="No credential files found." />}</div>
    </div>
  )
}
