import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Banner, Field, InfoBox, LedgerRow, EmptyState, downloadEncryptedFile, formatAmount, formatDate } from '../components/UI'

const inputClass = "w-full h-11 px-4 rounded-xl bg-coral-50/50 focus:bg-white outline-none border border-coral-100 focus:border-coral-500 text-sm font-medium text-slate-800 transition-colors"

export default function BalanceFilePage() {
  const { token, user } = useAuth()
  const [centers, setCenters] = useState([])
  const [rechargeForm, setRechargeForm] = useState({ bingoCenterUsername: '', generatedAmount: 150000, actualAmount: 10000 })
  const [generatedFile, setGeneratedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const centerFilter = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? undefined : user.username
      const centersRes = await api.getCenters(token, centerFilter)
      setCenters(centersRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedCenter = centers.find((c) => c.username === rechargeForm.bingoCenterUsername)
  const projectedBalance = Number(selectedCenter?.balance || 0) + Number(rechargeForm.actualAmount || 0)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.rechargeCenter(token, { ...rechargeForm, debitedBy: user.username })
      setGeneratedFile(res.encryptedFile)
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

      <div className="xl:col-span-7 space-y-6">
        {/* Target Center Info */}
        <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500 uppercase font-semibold">Target Bingo Venue</div>
              <h3 className="font-extrabold text-2xl text-slate-900 mt-1 tracking-tight">{selectedCenter?.full_name || 'Select a center'}</h3>
            </div>
            <div className="px-3 py-2 rounded-lg bg-coral-50 text-coral-600 font-mono text-sm font-bold border border-coral-100">{selectedCenter?.username || '—'}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <InfoBox label="MAC Address" value={selectedCenter?.mac_address || '—'} />
            <InfoBox label="Current Ledger Balance" value={formatAmount(selectedCenter?.balance)} />
          </div>
        </section>

        {/* Payment Form */}
        <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
          <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Review & Verify Payment</h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Field label="Target Center">
              <select value={rechargeForm.bingoCenterUsername} onChange={(e) => setRechargeForm((s) => ({ ...s, bingoCenterUsername: e.target.value }))} className={inputClass} required>
                <option value="">Select center</option>
                {centers.map((center) => <option key={center.username} value={center.username}>{center.full_name} ({center.username})</option>)}
              </select>
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Generated Amount">
                <input type="number" className={inputClass} value={rechargeForm.generatedAmount} onChange={(e) => setRechargeForm((s) => ({ ...s, generatedAmount: Number(e.target.value) }))} required />
              </Field>
              <Field label="Actual Amount Paid">
                <input type="number" className={inputClass} value={rechargeForm.actualAmount} onChange={(e) => setRechargeForm((s) => ({ ...s, actualAmount: Number(e.target.value) }))} required />
              </Field>
            </div>
            <div className="p-4 rounded-xl bg-coral-50 border border-coral-100 text-sm text-slate-600">
              <i className="fa-solid fa-info-circle mr-2 text-coral-500"></i>
              The backend will create a `RechargeHistory` record, update balances, and return an encrypted top-up file from `generateTopupFile()`.
            </div>
            <button disabled={loading} className="w-full h-12 rounded-xl bg-coral-500 text-white font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">
              <i className="fa-solid fa-lock mr-2"></i>Generate Encrypted File (.enc)
            </button>
          </form>
        </section>
      </div>

      <div className="xl:col-span-5 space-y-6">
        {/* Balance Impact */}
        <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-soft">
          <h3 className="font-extrabold text-xl tracking-tight">Balance Impact Computation</h3>
          <div className="space-y-3 mt-4 text-sm">
            <LedgerRow label="Current Terminal Credit" value={formatAmount(selectedCenter?.balance)} />
            <LedgerRow label="Top-up Value Injected" value={formatAmount(rechargeForm.generatedAmount)} highlight="text-coral-400" />
            <LedgerRow label="Customer Payment Due" value={formatAmount(rechargeForm.actualAmount)} />
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white/60 text-sm">Projected New Balance</div>
                <div className="text-xs text-white/40">Post-sync on terminal</div>
              </div>
              <div className="text-2xl font-extrabold text-coral-400">{formatAmount(projectedBalance)}</div>
            </div>
          </div>
        </section>

        {/* Generated File */}
        <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50 h-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">File Ready for Deployment</h3>
              <p className="text-sm text-slate-500 mt-1">Latest encrypted file returned by the backend.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-coral-50 text-coral-600 text-xs font-bold border border-coral-100">Balance File</span>
          </div>
          {!generatedFile ? (
            <div className="mt-6"><EmptyState text="No balance file generated yet in this session." /></div>
          ) : (
            <div className="space-y-4 mt-5">
              <div className="p-4 rounded-xl bg-coral-50 border border-coral-100">
                <div className="font-mono text-sm break-all font-bold text-coral-600">{generatedFile.fileName}</div>
                <div className="text-xs text-slate-500 mt-1">Transaction Ref: {generatedFile.transactionRef}</div>
              </div>
              <div className="grid gap-3">
                <InfoBox label="Format" value={generatedFile.format} />
                <InfoBox label="Checksum" value={generatedFile.checksum} mono />
                <InfoBox label="Key Fingerprint" value={generatedFile.keyFingerprint} mono />
                <InfoBox label="Timestamp" value={formatDate(generatedFile.timestamp)} />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => downloadEncryptedFile(generatedFile)} className="px-4 py-3 rounded-xl bg-coral-500 text-white font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors">
                  <i className="fa-solid fa-download mr-2"></i>Download File
                </button>
                <button onClick={() => navigator.clipboard?.writeText(generatedFile.checksum)} className="px-4 py-3 rounded-xl bg-coral-50 text-coral-600 font-bold border border-coral-100 hover:bg-coral-100 transition-colors">
                  <i className="fa-solid fa-copy mr-2"></i>Copy SHA256
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
