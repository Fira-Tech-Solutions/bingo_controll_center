import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatAmount, formatDate, downloadEncryptedFile } from '../../components/UI'

const STEPS = ['package', 'center', 'result']

export default function AdminBalanceFiles() {
  const { token, user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [packages, setPackages] = useState([])
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [selectedCenter, setSelectedCenter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [txRes, pkgRes, centerRes] = await Promise.all([
        api.getTransactions(token, user?.username),
        api.getActivePackages(token),
        api.getCenters(token),
      ])
      setTransactions(txRes.data)
      setPackages(pkgRes.data)
      setCenters(centerRes.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    if (!search) return transactions
    const q = search.toLowerCase()
    return transactions.filter((t) => String(t.id).includes(q) || t.bingoCenterUsername.toLowerCase().includes(q))
  }, [transactions, search])

  function openWizard() {
    setWizardOpen(true)
    setStep(0)
    setSelectedPkg(null)
    setSelectedCenter('')
    setResult(null)
    setError('')
  }

  function closeWizard() {
    setWizardOpen(false)
    setStep(0)
    setSelectedPkg(null)
    setSelectedCenter('')
    setResult(null)
  }

  function selectPackage(pkg) {
    setSelectedPkg(pkg)
    setStep(1)
  }

  function goBack() {
    if (step === 1) { setStep(0); setSelectedCenter('') }
    else if (step === 2) { closeWizard() }
  }

  async function handleGenerate() {
    if (!selectedPkg || !selectedCenter) { setError('Select a center.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.rechargeCenter(token, {
        bingoCenterUsername: selectedCenter,
        package_id: selectedPkg.id,
        debitedBy: user.username,
      })
      setResult(res)
      setStep(2)
      await loadData()
    } catch (err) { setError(err.message) } finally { setSubmitting(false) }
  }

  const selectedCenterObj = centers.find((c) => c.username === selectedCenter)

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      {/* Header */}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Balance Files</h2>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} file(s) generated</p>
        </div>
        <button onClick={openWizard} className="px-5 py-3 rounded-2xl bg-coral-500 text-white font-bold text-sm shadow-lg shadow-coral-500/25 hover:bg-coral-600 active:scale-[0.97] transition-all duration-150 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Generate Balance File
        </button>
      </section>

      {/* ─── WIZARD OVERLAY ────────────────────────────────── */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeWizard} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col animate-slide-up overflow-hidden">

            {/* Progress bar */}
            <div className="h-1 bg-slate-100 shrink-0">
              <div className="h-full progress-shimmer rounded-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 pt-4 pb-2 shrink-0">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i < step ? 'bg-emerald-500 text-white' :
                    i === step ? 'bg-coral-500 text-white scale-110 shadow-md shadow-coral-500/30' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {i < step ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : i + 1}
                  </div>
                  {i < STEPS.length - 1 && <div className={`w-8 h-0.5 rounded-full transition-colors duration-300 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {error && (
                <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-red-500 shrink-0 mt-0.5">error</span>
                  <div>
                    <p className="text-sm font-bold text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* ── Step 0: Package Selection ────────────────── */}
              {step === 0 && (
                <div className="animate-fade-up">
                  <div className="text-center mb-5">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-coral-50 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[28px] text-coral-500">inventory_2</span>
                    </div>
                    <h3 className="font-extrabold text-xl text-slate-900">Choose a Package</h3>
                    <p className="text-sm text-slate-500 mt-1">Select the recharge package for this balance file</p>
                  </div>

                  {packages.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-[48px] text-slate-300">inventory_2</span>
                      <p className="text-sm text-slate-400 mt-2">No active packages available</p>
                      <p className="text-xs text-slate-400">Ask Super Admin to create one</p>
                    </div>
                  ) : (
                    <div className="space-y-3 stagger-children">
                      {packages.map((pkg) => (
                        <button key={pkg.id} onClick={() => selectPackage(pkg)}
                          className="animate-pop-in w-full text-left p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-coral-300 hover:shadow-lg hover:shadow-coral-500/5 active:scale-[0.98] transition-all duration-200 group">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="font-bold text-base text-slate-900 group-hover:text-coral-600 transition-colors">{pkg.name}</div>
                              {pkg.description && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{pkg.description}</div>}
                            </div>
                            <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-coral-400 transition-colors">chevron_right</span>
                          </div>
                          <div className="flex items-baseline gap-4 mt-3">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">You Pay</div>
                              <div className="text-xl font-extrabold text-slate-900">{formatAmount(pkg.paymentAmount)}</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance</div>
                              <div className="text-xl font-extrabold text-emerald-600">{formatAmount(pkg.balanceAmount)}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 1: Center Selection ─────────────────── */}
              {step === 1 && (
                <div className="animate-fade-up">
                  <div className="text-center mb-5">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-coral-50 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[28px] text-coral-500">storefront</span>
                    </div>
                    <h3 className="font-extrabold text-xl text-slate-900">Select Bingo Center</h3>
                    <p className="text-sm text-slate-500 mt-1">Choose which center to generate the file for</p>
                  </div>

                  {/* Selected package summary */}
                  <div className="p-4 rounded-2xl bg-coral-50 border border-coral-100 mb-5 animate-scale-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-coral-400">Selected Package</div>
                        <div className="font-bold text-slate-900 mt-0.5">{selectedPkg?.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Balance</div>
                        <div className="font-extrabold text-coral-600">{formatAmount(selectedPkg?.balanceAmount)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Center list */}
                  {centers.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-[48px] text-slate-300">storefront</span>
                      <p className="text-sm text-slate-400 mt-2">No bingo centers found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 stagger-children">
                      {centers.map((c) => (
                        <button key={c.username} onClick={() => setSelectedCenter(c.username)}
                          className={`animate-pop-in w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                            selectedCenter === c.username
                              ? 'border-coral-500 bg-coral-50 pkg-card-selected'
                              : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                              selectedCenter === c.username ? 'bg-coral-500 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {c.fullName?.charAt(0) || c.username.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-slate-900 truncate">{c.fullName || c.username}</div>
                              <div className="text-xs text-slate-400 font-mono">{c.username}</div>
                            </div>
                            {selectedCenter === c.username && (
                              <span className="material-symbols-outlined text-[20px] text-coral-500">check_circle</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 2: Result ──────────────────────────── */}
              {step === 2 && result?.encryptedFile && (
                <div className="animate-fade-up text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4 animate-pop-in">
                    <svg className="w-10 h-10 success-check" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="8 12 11 15 16 9" />
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900">File Generated!</h3>
                  <p className="text-sm text-slate-500 mt-1">Encrypted balance file is ready for download</p>

                  <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Center</span>
                      <span className="text-sm font-bold text-slate-900">{selectedCenterObj?.fullName || selectedCenter}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Package</span>
                      <span className="text-sm font-bold text-coral-600">{selectedPkg?.name}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">File</span>
                      <span className="text-xs font-mono font-semibold text-slate-700">{result.encryptedFile.fileName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ref</span>
                      <span className="text-xs font-mono font-semibold text-slate-700">{result.encryptedFile.transactionRef}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Format</span>
                      <span className="text-xs font-mono font-semibold text-slate-700">{result.encryptedFile.format}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SHA-256</span>
                      <div className="mt-1 p-2 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-600 break-all leading-relaxed">{result.encryptedFile.checksum}</div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button onClick={() => downloadEncryptedFile(result.encryptedFile)} className="flex-1 py-3 rounded-2xl bg-coral-500 text-white font-bold text-sm shadow-lg shadow-coral-500/25 hover:bg-coral-600 active:scale-[0.97] transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">download</span>Download .enc
                    </button>
                    <button onClick={() => navigator.clipboard?.writeText(result.encryptedFile.checksum)} className="py-3 px-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 active:scale-[0.97] transition-all">
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom actions */}
            {step < 2 && (
              <div className="shrink-0 px-5 py-4 border-t border-slate-100 flex gap-3 bg-white">
                {step > 0 && (
                  <button onClick={goBack} className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 active:scale-[0.97] transition-all">
                    Back
                  </button>
                )}
                {step === 1 && (
                  <button onClick={handleGenerate} disabled={submitting || !selectedCenter}
                    className="flex-1 py-3 rounded-2xl bg-coral-500 text-white font-bold text-sm shadow-lg shadow-coral-500/25 hover:bg-coral-600 active:scale-[0.97] transition-all disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2">
                    {submitting ? (
                      <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Generating...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">lock</span>Generate File</>
                    )}
                  </button>
                )}
                <button onClick={step === 0 ? closeWizard : goBack} className="px-5 py-3 rounded-2xl text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors">
                  Cancel
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
                <button onClick={closeWizard} className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 active:scale-[0.97] transition-all">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TRANSACTION HISTORY ──────────────────────────── */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-coral-100 text-sm font-medium focus:outline-none focus:border-coral-500" />
      </div>

      <div className="hidden lg:block bg-white rounded-2xl shadow-soft border border-coral-100/50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-coral-100">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">File ID</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Center</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Package</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Payment</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Balance</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">By</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
          </tr></thead>
          <tbody>{filtered.map((tx) => (
            <tr key={tx.id} className="border-b border-coral-100/50 hover:bg-coral-50/30 transition-colors">
              <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-900">BAL-{String(tx.id).padStart(4, '0')}</td>
              <td className="px-6 py-4 text-sm font-semibold text-slate-900">{tx.bingoCenterUsername}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{tx.package?.name || <span className="text-slate-400 italic">manual</span>}</td>
              <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{formatAmount(tx.actualAmount)}</td>
              <td className="px-6 py-4 text-right text-sm font-bold text-coral-600">{formatAmount(tx.generatedAmount)}</td>
              <td className="px-6 py-4 text-sm text-slate-700">{tx.debitedBy}</td>
              <td className="px-6 py-4 text-right text-xs text-slate-500">{formatDate(tx.timestamp)}</td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="No balance files found." />}
      </div>

      <div className="lg:hidden space-y-3">{filtered.map((tx) => (
        <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-soft border border-coral-100/50">
          <div className="flex items-center justify-between"><span className="text-xs font-mono font-bold text-slate-900">BAL-{String(tx.id).padStart(4, '0')}</span><span className="text-xs text-slate-500">{formatDate(tx.timestamp)}</span></div>
          <div className="font-semibold text-sm text-slate-900 mt-1">{tx.bingoCenterUsername}</div>
          {tx.package && <div className="text-xs text-coral-600 font-semibold mt-0.5">{tx.package.name}</div>}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-2 rounded-lg bg-coral-50/50 text-center"><div className="text-xs text-slate-500">Payment</div><div className="font-bold text-sm">{formatAmount(tx.actualAmount)}</div></div>
            <div className="p-2 rounded-lg bg-coral-50/50 text-center"><div className="text-xs text-slate-500">Balance</div><div className="font-bold text-sm text-coral-600">{formatAmount(tx.generatedAmount)}</div></div>
          </div>
          <div className="text-xs text-slate-500 mt-2">by {tx.debitedBy}</div>
        </div>
      ))}{filtered.length === 0 && <EmptyState text="No balance files found." />}</div>
    </div>
  )
}
