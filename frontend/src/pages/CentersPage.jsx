import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Banner, Field, InfoPill, EmptyState, formatDate, formatAmount } from '../components/UI'

const DEFAULT_CREATE_CENTER = { full_name: '', username: '', password: '', mac_address: '', balance: 150000, actualAmount: 10000 }
const DEFAULT_RECHARGE = { bingoCenterUsername: '', generatedAmount: 150000, actualAmount: 10000 }
const DEFAULT_ONLINE_TOPUP = { bingoCenterUsername: '', amount: 150000, actualAmount: 10000 }

const inputClass = "w-full h-11 px-4 rounded-xl bg-coral-50/50 focus:bg-white outline-none border border-coral-100 focus:border-coral-500 text-sm font-medium text-slate-800 transition-colors"

export default function CentersPage() {
  const { token, user, isAdmin, canOperateCenters } = useAuth()
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [createCenterForm, setCreateCenterForm] = useState(DEFAULT_CREATE_CENTER)
  const [rechargeForm, setRechargeForm] = useState(DEFAULT_RECHARGE)
  const [onlineTopupForm, setOnlineTopupForm] = useState(DEFAULT_ONLINE_TOPUP)

  const visibleCenters = isAdmin ? centers : centers.filter((c) => c.createdBy === user.username)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const centerFilter = isAdmin ? undefined : user.username
      const centersRes = await api.getCenters(token, centerFilter)
      setCenters(centersRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!rechargeForm.bingoCenterUsername && visibleCenters[0]?.username) {
      setRechargeForm((s) => ({ ...s, bingoCenterUsername: visibleCenters[0].username }))
    }
    if (!onlineTopupForm.bingoCenterUsername && visibleCenters[0]?.username) {
      setOnlineTopupForm((s) => ({ ...s, bingoCenterUsername: visibleCenters[0].username }))
    }
  }, [visibleCenters])

  async function handleCreateCenter(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.createCenter(token, { ...createCenterForm, createdBy: user.username })
      setNotice(`Center ${createCenterForm.username} created.`)
      setCreateCenterForm(DEFAULT_CREATE_CENTER)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRechargeCenter(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.rechargeCenter(token, { ...rechargeForm, debitedBy: user.username })
      setNotice(`Balance file generated for ${rechargeForm.bingoCenterUsername}.`)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleOnlineTopup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.addOnlineTopup(token, onlineTopupForm)
      setNotice(`Online top-up added for ${onlineTopupForm.bingoCenterUsername}.`)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerateUserFile(username) {
    setLoading(true)
    setError('')
    setNotice('')
    try {
      await api.regenerateUserFile(token, { username })
      setNotice(`User credential file regenerated for ${username}.`)
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

      <section className="grid xl:grid-cols-12 gap-6">
        {/* Centers List */}
        <div className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Bingo Centers</h3>
              <p className="text-sm text-slate-500">Uses `GET /api/bingo-centers` and supports file regeneration per center.</p>
            </div>
          </div>
          <div className="space-y-3">
            {visibleCenters.map((center) => (
              <div key={center.username} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">{center.full_name}</div>
                  <div className="text-sm text-slate-500 font-mono truncate">{center.username} • {center.mac_address}</div>
                  <div className="text-xs text-slate-500 mt-1">Created by: {center.createdBy} • {formatDate(center.createdAt)}</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm min-w-[340px]">
                  <InfoPill label="Ledger" value={formatAmount(center.balance)} valueClass="text-slate-900" />
                  <InfoPill label="Pending" value={formatAmount(center.onlineBalance)} valueClass="text-coral-600" />
                  <InfoPill label="Claimed" value={formatAmount(center.onlinePaidBalance)} valueClass="text-emerald-600" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleRegenerateUserFile(center.username)} className="px-3 py-2 rounded-lg bg-coral-500 text-white text-sm font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors">
                    <i className="fa-solid fa-file-lines mr-1"></i>Generate User File
                  </button>
                  <button onClick={() => setRechargeForm((s) => ({ ...s, bingoCenterUsername: center.username }))} className="px-3 py-2 rounded-lg bg-coral-50 text-coral-600 text-sm font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">
                    Use for Balance
                  </button>
                </div>
              </div>
            ))}
            {visibleCenters.length === 0 && <EmptyState text="No bingo centers found." />}
          </div>
        </div>

        {/* Forms */}
        <div className="xl:col-span-5 space-y-6">
          {canOperateCenters && (
            <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Generate Balance File (.enc)</h3>
              <p className="text-sm text-slate-500 mt-1">Uses `POST /api/bingo-centers/recharge` and returns the encrypted top-up file.</p>
              <form onSubmit={handleRechargeCenter} className="space-y-4 mt-4">
                <Field label="Target Center">
                  <select value={rechargeForm.bingoCenterUsername} onChange={(e) => setRechargeForm((s) => ({ ...s, bingoCenterUsername: e.target.value }))} className={inputClass} required>
                    <option value="">Select center</option>
                    {visibleCenters.map((center) => <option key={center.username} value={center.username}>{center.full_name} ({center.username})</option>)}
                  </select>
                </Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Generated Amount">
                    <input type="number" value={rechargeForm.generatedAmount} onChange={(e) => setRechargeForm((s) => ({ ...s, generatedAmount: Number(e.target.value) }))} className={inputClass} />
                  </Field>
                  <Field label="Actual Amount Paid">
                    <input type="number" value={rechargeForm.actualAmount} onChange={(e) => setRechargeForm((s) => ({ ...s, actualAmount: Number(e.target.value) }))} className={inputClass} />
                  </Field>
                </div>
                <button disabled={loading} className="w-full h-11 rounded-xl bg-coral-500 text-white font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">
                  <i className="fa-solid fa-key mr-2"></i>Generate Balance File
                </button>
              </form>
            </section>
          )}

          {isAdmin && (
            <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Register Center & Generate User File</h3>
              <p className="text-sm text-slate-500 mt-1">Uses `POST /api/bingo-centers` and returns the encrypted user credential file.</p>
              <form onSubmit={handleCreateCenter} className="space-y-4 mt-4">
                <Field label="Center Name"><input className={inputClass} value={createCenterForm.full_name} onChange={(e) => setCreateCenterForm((s) => ({ ...s, full_name: e.target.value }))} required /></Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Username"><input className={`${inputClass} font-mono`} value={createCenterForm.username} onChange={(e) => setCreateCenterForm((s) => ({ ...s, username: e.target.value }))} required /></Field>
                  <Field label="Password"><input className={inputClass} type="password" value={createCenterForm.password} onChange={(e) => setCreateCenterForm((s) => ({ ...s, password: e.target.value }))} required /></Field>
                </div>
                <Field label="MAC Address"><input className={`${inputClass} font-mono uppercase`} value={createCenterForm.mac_address} onChange={(e) => setCreateCenterForm((s) => ({ ...s, mac_address: e.target.value.toUpperCase() }))} required /></Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Generated Balance"><input type="number" className={inputClass} value={createCenterForm.balance} onChange={(e) => setCreateCenterForm((s) => ({ ...s, balance: Number(e.target.value) }))} required /></Field>
                  <Field label="Actual Starting Amount"><input type="number" className={inputClass} value={createCenterForm.actualAmount} onChange={(e) => setCreateCenterForm((s) => ({ ...s, actualAmount: Number(e.target.value) }))} required /></Field>
                </div>
                <button disabled={loading} className="w-full h-11 rounded-xl bg-coral-500 text-white font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">
                  <i className="fa-solid fa-plus mr-2"></i>Create Center & Generate Credential
                </button>
              </form>
            </section>
          )}

          {canOperateCenters && (
            <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Online Top-Up Queue</h3>
              <p className="text-sm text-slate-500 mt-1">Uses `POST /api/bingo-centers/online-topup` for terminal-claimable balances.</p>
              <form onSubmit={handleOnlineTopup} className="space-y-4 mt-4">
                <Field label="Target Center">
                  <select value={onlineTopupForm.bingoCenterUsername} onChange={(e) => setOnlineTopupForm((s) => ({ ...s, bingoCenterUsername: e.target.value }))} className={inputClass}>
                    <option value="">Select center</option>
                    {visibleCenters.map((center) => <option key={center.username} value={center.username}>{center.full_name} ({center.username})</option>)}
                  </select>
                </Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Queued Balance Amount"><input type="number" className={inputClass} value={onlineTopupForm.amount} onChange={(e) => setOnlineTopupForm((s) => ({ ...s, amount: Number(e.target.value) }))} /></Field>
                  <Field label="Actual Paid Amount"><input type="number" className={inputClass} value={onlineTopupForm.actualAmount} onChange={(e) => setOnlineTopupForm((s) => ({ ...s, actualAmount: Number(e.target.value) }))} /></Field>
                </div>
                <button disabled={loading} className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors disabled:opacity-60">
                  <i className="fa-solid fa-cloud-arrow-up mr-2"></i>Queue Online Top-Up
                </button>
              </form>
            </section>
          )}
        </div>
      </section>
    </div>
  )
}
