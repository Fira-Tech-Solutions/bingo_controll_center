import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatAmount, formatDate, downloadEncryptedFile } from '../../components/UI'

export default function AdminCenterDetail() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [center, setCenter] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState('overview')

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [c, t] = await Promise.all([
        api.getCenters(token),
        api.getTransactions(token, user?.username),
      ])
      const found = c.data.find((x) => x.username === id)
      setCenter(found)
      setTransactions(t.data.filter((x) => x.bingoCenterUsername === id))
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  async function handleRegenerate() {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const res = await api.regenerateUserFile(token, { username: id })
      setNotice('Credential file regenerated.')
      if (res.encryptedFile) downloadEncryptedFile(res.encryptedFile)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  if (!center && !loading) {
    return (
      <div className="space-y-6">
        <Banner tone="error" text="Center not found." />
        <button onClick={() => navigate('/centers')} className="px-4 py-2 rounded-xl bg-coral-50 text-coral-600 text-sm font-semibold border border-coral-100">← Back to Centers</button>
      </div>
    )
  }

  const tabs = ['overview', 'transactions']
  const totalPaid = transactions.reduce((s, t) => s + Number(t.actualAmount || 0), 0)
  const totalIssued = transactions.reduce((s, t) => s + Number(t.generatedAmount || 0), 0)

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}
      {notice && <Banner tone="success" text={notice} />}

      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <button onClick={() => navigate('/centers')} className="text-xs font-semibold text-coral-600 hover:text-coral-700 mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>Back to Centers
        </button>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div>
            <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">{center?.full_name || 'Loading...'}</h2>
            <p className="text-sm text-slate-500 mt-1 font-mono">{center?.username} • {center?.mac_address}</p>
          </div>
          <button onClick={handleRegenerate} disabled={loading} className="px-4 py-2 rounded-xl bg-coral-500 text-white font-bold text-sm shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">
            <i className="fa-solid fa-file-lines mr-1.5"></i>Regenerate File
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Balance</div><div className="mt-2 text-2xl font-extrabold text-slate-900">{formatAmount(center?.balance)}</div></div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Total Paid</div><div className="mt-2 text-2xl font-extrabold text-slate-900">{formatAmount(totalPaid)}</div></div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Issued</div><div className="mt-2 text-2xl font-extrabold text-coral-600">{formatAmount(totalIssued)}</div></div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50"><div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Transactions</div><div className="mt-2 text-2xl font-extrabold text-slate-900">{transactions.length}</div></div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap capitalize transition-colors ${tab === t ? 'bg-coral-500 text-white' : 'bg-white text-slate-600 border border-coral-100 hover:bg-coral-50'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mb-4">Center Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50"><div className="text-xs text-slate-500">Full Name</div><div className="font-bold text-slate-900 mt-1">{center?.full_name}</div></div>
            <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50"><div className="text-xs text-slate-500">Username</div><div className="font-bold text-slate-900 mt-1 font-mono">{center?.username}</div></div>
            <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50"><div className="text-xs text-slate-500">MAC Address</div><div className="font-bold text-slate-900 mt-1 font-mono">{center?.mac_address}</div></div>
            <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50"><div className="text-xs text-slate-500">Status</div><div className="font-bold text-emerald-600 mt-1">Active</div></div>
          </div>
          {(center?.owner_name || center?.phone || center?.additional_contact || center?.region || center?.address || center?.notes) && (
            <>
              <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mt-6 mb-4">Registration Info</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {center?.owner_name && <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50"><div className="text-xs text-slate-500">Owner</div><div className="font-bold text-slate-900 mt-1">{center.owner_name}</div></div>}
                {center?.phone && <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50"><div className="text-xs text-slate-500">Phone</div><div className="font-bold text-slate-900 mt-1">{center.phone}</div></div>}
                {center?.additional_contact && <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50"><div className="text-xs text-slate-500">Additional Contact</div><div className="font-bold text-slate-900 mt-1">{center.additional_contact}</div></div>}
                {center?.region && <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50"><div className="text-xs text-slate-500">Region</div><div className="font-bold text-slate-900 mt-1">{center.region}</div></div>}
                {center?.address && <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50"><div className="text-xs text-slate-500">Address</div><div className="font-bold text-slate-900 mt-1">{center.address}</div></div>}
                {center?.notes && <div className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 md:col-span-2"><div className="text-xs text-slate-500">Notes</div><div className="font-bold text-slate-900 mt-1">{center.notes}</div></div>}
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'transactions' && (
        <section className="bg-white rounded-2xl shadow-soft border border-coral-100/50 overflow-hidden">
          <div className="p-6 pb-3"><h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Transactions</h3></div>
          {transactions.length > 0 ? (
            <div className="divide-y divide-coral-100/50">
              {transactions.map((tx) => (
                <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900">TX-{String(tx.id).padStart(4, '0')}</div>
                    <div className="text-xs text-slate-500">{formatDate(tx.timestamp)} • by {tx.debitedBy}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{formatAmount(tx.actualAmount)}</div>
                    <div className="text-xs text-coral-600">→ {formatAmount(tx.generatedAmount)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="p-6"><EmptyState text="No transactions for this center." /></div>}
        </section>
      )}
    </div>
  )
}
