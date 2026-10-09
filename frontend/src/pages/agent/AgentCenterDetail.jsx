import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, formatAmount, formatDate, downloadEncryptedFile } from '../../components/UI'

export default function AgentCenterDetail() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [center, setCenter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await api.getMyCenterDetail(token, id)
        setCenter(res.data)
      } catch (err) { setError(err.message) } finally { setLoading(false) }
    }
    load()
  }, [token, id])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[#131b2e] rounded-lg"></div>
        <div className="h-48 bg-[#131b2e] rounded-2xl"></div>
      </div>
    )
  }

  if (error) return <Banner tone="error" text={error} />
  if (!center) return <Banner tone="error" text="Center not found or not assigned to you" />

  const status = Number(center.balance) > 0 ? 'Active' : 'Inactive'

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/centers')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to Centers
      </button>

      <section className="bg-white rounded-2xl p-6 shadow-soft border border-emerald-100/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">{center.full_name}</h2>
            <div className="text-sm text-slate-500 font-mono mt-1">{center.username}</div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{status}</span>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100/50">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Balance</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{formatAmount(center.balance)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100/50">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Online Balance</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{formatAmount(center.onlineBalance)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-emerald-100/50">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">MAC Address</div>
          <div className="mt-2 text-lg font-bold text-slate-900 font-mono">{center.mac_address}</div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 shadow-soft border border-emerald-100/50">
        <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mb-4">Center Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Owner</div><div className="mt-1 text-sm font-semibold text-slate-900">{center.owner_name || '—'}</div></div>
          <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</div><div className="mt-1 text-sm font-semibold text-slate-900">{center.phone || '—'}</div></div>
          <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Additional Contact</div><div className="mt-1 text-sm font-semibold text-slate-900">{center.additional_contact || '—'}</div></div>
          <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Region</div><div className="mt-1 text-sm font-semibold text-slate-900">{center.region || '—'}</div></div>
          <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Address</div><div className="mt-1 text-sm font-semibold text-slate-900">{center.address || '—'}</div></div>
          <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Created</div><div className="mt-1 text-sm font-semibold text-slate-900">{formatDate(center.createdAt)}</div></div>
        </div>
        {center.notes && (
          <div className="mt-4"><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes</div><div className="mt-1 text-sm text-slate-700">{center.notes}</div></div>
        )}
      </section>
    </div>
  )
}
