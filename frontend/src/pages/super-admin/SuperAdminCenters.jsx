import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatAmount, formatDate, downloadEncryptedFile } from '../../components/UI'

const STATUS_FILTERS = ['All', 'Active', 'Inactive']
const STEPS = ['info', 'review', 'done']

export default function SuperAdminCenters() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [centers, setCenters] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ full_name: '', username: '', password: '', mac_address: '' })
  const [creating, setCreating] = useState(false)
  const [createResult, setCreateResult] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [c, t] = await Promise.all([
        api.getCenters(token),
        api.getTransactions(token),
      ])
      setCenters(c.data)
      setTransactions(t.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const centersWithStats = useMemo(() => {
    return centers.map((c) => {
      const ct = transactions.filter((t) => t.bingoCenterUsername === c.username)
      const lastTxn = ct[0]
      const totalPaid = ct.reduce((s, t) => s + Number(t.actualAmount || 0), 0)
      const totalIssued = ct.reduce((s, t) => s + Number(t.generatedAmount || 0), 0)
      const status = Number(c.balance) > 0 ? 'Active' : 'Inactive'
      return { ...c, lastTxn, totalPaid, totalIssued, status, txnCount: ct.length }
    })
  }, [centers, transactions])

  const filtered = useMemo(() => {
    return centersWithStats.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return c.full_name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)
      }
      return true
    })
  }, [centersWithStats, search, statusFilter])

  const statusColor = (s) => s === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'

  function openWizard() {
    setWizardOpen(true)
    setStep(0)
    setForm({ full_name: '', username: '', password: '', mac_address: '' })
    setCreateResult(null)
    setError('')
  }

  function closeWizard() { setWizardOpen(false); setStep(0); setCreateResult(null) }
  function goBack() { if (step > 0 && step < 2) setStep(step - 1); else closeWizard() }
  function handleFormChange(e) {
    const { name, value } = e.target
    if (name === 'mac_address') {
      setForm((s) => ({ ...s, mac_address: formatMac(value) }))
    } else {
      setForm((s) => ({ ...s, [name]: value }))
    }
  }

  function formatMac(v) {
    const hex = v.replace(/[^a-fA-F0-9]/g, '').toUpperCase().slice(0, 12)
    const parts = hex.match(/.{1,2}/g)
    return parts ? parts.join(':') : ''
  }

  function validateInfo() {
    if (!form.full_name || !form.username || !form.password || !form.mac_address) { setError('All fields are required.'); return false }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return false }
    if (!/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i.test(form.mac_address)) { setError('MAC address must be in AA:BB:CC:DD:EE:FF format.'); return false }
    setError(''); return true
  }

  function nextStep() { if (step === 0 && validateInfo()) setStep(1) }

  async function handleCreate() {
    setCreating(true); setError('')
    try {
      const res = await api.createCenter(token, { full_name: form.full_name, username: form.username, password: form.password, mac_address: form.mac_address, balance: 0, actualAmount: 0, createdBy: user.username })
      setCreateResult(res); setStep(2); await loadData()
    } catch (err) { setError(err.message) } finally { setCreating(false) }
  }

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      <section className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search centers..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-coral-100 text-sm font-medium focus:outline-none focus:border-coral-500" /></div>
        <div className="flex flex-wrap gap-2">{STATUS_FILTERS.map((s) => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${statusFilter === s ? 'bg-coral-500 text-white' : 'bg-white text-slate-600 border border-coral-100 hover:bg-coral-50'}`}>{s}</button>))}</div>
      </section>

      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeWizard} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col animate-slide-up overflow-hidden">
            <div className="h-1 bg-slate-100 shrink-0"><div className="h-full progress-shimmer rounded-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
            <div className="flex items-center justify-center gap-2 pt-4 pb-2 shrink-0">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-coral-500 text-white scale-110 shadow-md shadow-coral-500/30' : 'bg-slate-100 text-slate-400'}`}>
                    {i < step ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className={`w-8 h-0.5 rounded-full transition-colors duration-300 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {error && (
                <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-red-500 shrink-0 mt-0.5">error</span>
                  <div>
                    <p className="text-sm font-bold text-red-800">{error}</p>
                  </div>
                </div>
              )}
              {step === 0 && (
                <div className="animate-fade-up space-y-5">
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-coral-50 flex items-center justify-center mb-3"><span className="material-symbols-outlined text-[28px] text-coral-500">storefront</span></div>
                    <h3 className="font-extrabold text-xl text-slate-900">New Bingo Center</h3>
                    <p className="text-sm text-slate-500 mt-1">Register a new terminal. Balance starts at zero.</p>
                  </div>
                  <div className="space-y-4">
                    <div><label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Full Name</label><input name="full_name" value={form.full_name} onChange={handleFormChange} className="w-full h-12 px-4 rounded-2xl bg-slate-50 focus:bg-white outline-none border-2 border-slate-100 focus:border-coral-400 text-sm font-medium text-slate-800 transition-all" placeholder="e.g. Merkato Branch" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Username</label><input name="username" value={form.username} onChange={handleFormChange} className="w-full h-12 px-4 rounded-2xl bg-slate-50 focus:bg-white outline-none border-2 border-slate-100 focus:border-coral-400 text-sm font-medium text-slate-800 font-mono transition-all" placeholder="merkato01" /></div>
                      <div><label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Password</label><input name="password" type="password" value={form.password} onChange={handleFormChange} className="w-full h-12 px-4 rounded-2xl bg-slate-50 focus:bg-white outline-none border-2 border-slate-100 focus:border-coral-400 text-sm font-medium text-slate-800 transition-all" placeholder="min 6 chars" /></div>
                    </div>
                    <div><label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">MAC Address</label><input name="mac_address" value={form.mac_address} onChange={handleFormChange} className="w-full h-12 px-4 rounded-2xl bg-slate-50 focus:bg-white outline-none border-2 border-slate-100 focus:border-coral-400 text-sm font-medium text-slate-800 font-mono transition-all" placeholder="AA:BB:CC:DD:EE:FF" /></div>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="animate-fade-up space-y-5">
                  <div className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-coral-50 flex items-center justify-center mb-3"><span className="material-symbols-outlined text-[28px] text-coral-500">fact_check</span></div>
                    <h3 className="font-extrabold text-xl text-slate-900">Review & Confirm</h3>
                    <p className="text-sm text-slate-500 mt-1">Confirm the center details</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Center Name</span><span className="text-sm font-bold text-slate-900">{form.full_name}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Username</span><span className="text-sm font-bold text-slate-900 font-mono">{form.username}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</span><span className="text-sm font-bold text-slate-900 font-mono">{form.password}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">MAC Address</span><span className="text-sm font-bold text-slate-900 font-mono">{form.mac_address}</span></div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Initial Balance</span><span className="text-sm font-bold text-slate-400">0.00 ETB</span></div>
                  </div>
                </div>
              )}
              {step === 2 && createResult && (
                <div className="animate-fade-up text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center animate-pop-in"><svg className="w-10 h-10 success-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" /></svg></div>
                  <div><h3 className="font-extrabold text-xl text-slate-900">Center Created!</h3><p className="text-sm text-slate-500 mt-1">Encrypted terminal file generated</p></div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                    <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Username</span><span className="text-sm font-bold font-mono text-slate-900">{form.username}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</span><span className="text-sm font-bold text-slate-900">{form.full_name}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Balance</span><span className="text-sm font-bold text-slate-400">0.00 ETB</span></div>
                    {createResult.encryptedFile && (<>
                      <div className="h-px bg-slate-200" />
                      <div className="flex justify-between items-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">File</span><span className="text-xs font-mono font-semibold text-slate-700">{createResult.encryptedFile.fileName}</span></div>
                      <div><span className="text-xs font-bold uppercase tracking-wider text-slate-400">SHA-256</span><div className="mt-1 p-2 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-600 break-all leading-relaxed">{createResult.encryptedFile.checksum}</div></div>
                    </>)}
                  </div>
                  {createResult.encryptedFile && (
                    <button onClick={() => downloadEncryptedFile(createResult.encryptedFile)} className="w-full py-3 rounded-2xl bg-coral-500 text-white font-bold text-sm shadow-lg shadow-coral-500/25 hover:bg-coral-600 active:scale-[0.97] transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">download</span>Download .enc File
                    </button>
                  )}
                </div>
              )}
            </div>

            {step < 2 && (
              <div className="shrink-0 px-5 py-4 border-t border-slate-100 flex gap-3 bg-white">
                {step > 0 && <button onClick={goBack} className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 active:scale-[0.97] transition-all">Back</button>}
                <button onClick={step === 1 ? handleCreate : nextStep} disabled={creating}
                  className="flex-1 py-3 rounded-2xl bg-coral-500 text-white font-bold text-sm shadow-lg shadow-coral-500/25 hover:bg-coral-600 active:scale-[0.97] transition-all disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2">
                  {creating ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Creating...</> :
                   step === 1 ? <><span className="material-symbols-outlined text-[18px]">check_circle</span>Create Center</> :
                   <><span className="material-symbols-outlined text-[18px]">arrow_forward</span>Continue</>}
                </button>
                <button onClick={step === 0 ? closeWizard : goBack} className="px-5 py-3 rounded-2xl text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors">Cancel</button>
              </div>
            )}
            {step === 2 && <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-white"><button onClick={closeWizard} className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.97] transition-all">Done</button></div>}
          </div>
        </div>
      )}

      <div className="hidden lg:block bg-white rounded-2xl shadow-soft border border-coral-100/50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-coral-100">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Center</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Balance</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Transactions</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Total Paid</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Last Activity</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
          </tr></thead>
          <tbody>{filtered.map((c) => (
            <tr key={c.username} className="border-b border-coral-100/50 hover:bg-coral-50/30 transition-colors">
              <td className="px-6 py-4"><div className="font-bold text-sm text-slate-900">{c.full_name}</div><div className="text-xs text-slate-500 font-mono">{c.username}</div></td>
              <td className="px-6 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor(c.status)}`}>{c.status}</span></td>
              <td className="px-6 py-4 text-right font-bold text-sm text-slate-900">{formatAmount(c.balance)}</td>
              <td className="px-6 py-4 text-right text-sm text-slate-700">{c.txnCount}</td>
              <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{formatAmount(c.totalPaid)}</td>
              <td className="px-6 py-4 text-right text-xs text-slate-500">{c.lastTxn ? formatDate(c.lastTxn.timestamp) : '—'}</td>
              <td className="px-6 py-4 text-right"><button onClick={() => navigate(`/centers/${c.username}`)} className="px-3 py-1.5 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">View</button></td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="No centers match your filters." />}
      </div>

      <div className="lg:hidden space-y-3">{filtered.map((c) => (
        <div key={c.username} className="bg-white rounded-2xl p-4 shadow-soft border border-coral-100/50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><div className="font-bold text-slate-900">{c.full_name}</div><div className="text-xs text-slate-500 font-mono">{c.username}</div></div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusColor(c.status)}`}>{c.status}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-center">
            <div className="p-2 rounded-lg bg-coral-50/50"><div className="text-xs text-slate-500">Balance</div><div className="font-bold text-sm text-slate-900">{formatAmount(c.balance)}</div></div>
            <div className="p-2 rounded-lg bg-coral-50/50"><div className="text-xs text-slate-500">Transactions</div><div className="font-bold text-sm text-slate-900">{c.txnCount}</div></div>
            <div className="p-2 rounded-lg bg-coral-50/50"><div className="text-xs text-slate-500">Paid</div><div className="font-bold text-sm text-slate-900">{formatAmount(c.totalPaid)}</div></div>
          </div>
          <button onClick={() => navigate(`/centers/${c.username}`)} className="w-full mt-3 py-2 rounded-xl bg-coral-50 text-coral-600 text-sm font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">View Details</button>
        </div>
      ))}{filtered.length === 0 && <EmptyState text="No centers match your filters." />}</div>

      <button onClick={openWizard} className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-40 w-14 h-14 rounded-full bg-[#2563eb] text-white shadow-lg shadow-blue-500/30 hover:bg-[#1d4ed8] active:scale-95 transition-all duration-150 flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  )
}
