import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, EmptyState, formatDate, downloadEncryptedFile } from '../../components/UI'

export default function AgentCredentialFiles() {
  const { token, user } = useAuth()
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [wizardOpen, setWizardOpen] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.getMyCenters(token)
      setCenters(res.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    if (!search) return centers
    const q = search.toLowerCase()
    return centers.filter((c) => c.full_name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q))
  }, [centers, search])

  function openWizard() {
    setWizardOpen(true)
    setSelectedCenter('')
    setResult(null)
    setError('')
  }

  function closeWizard() {
    setWizardOpen(false)
    setSelectedCenter('')
    setResult(null)
  }

  async function handleRegenerate() {
    if (!selectedCenter) { setError('Select a center.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await api.regenerateUserFile(token, { username: selectedCenter })
      setResult(res)
      await loadData()
    } catch (err) { setError(err.message) } finally { setSubmitting(false) }
  }

  const selectedCenterObj = centers.find((c) => c.username === selectedCenter)

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}

      {/* ─── WIZARD OVERLAY ────────────────────────────────── */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeWizard} />
          <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col animate-slide-up overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">Regenerate Credential File</h3>
              <button onClick={closeWizard} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-slate-500">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {error && (
                <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-red-500 shrink-0 mt-0.5">error</span>
                  <div><p className="text-sm font-bold text-red-800">{error}</p></div>
                </div>
              )}

              {!result ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[28px] text-[#059669]">badge</span>
                    </div>
                    <p className="text-sm text-slate-500">Select a center to regenerate its credential file</p>
                  </div>

                  {centers.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-[48px] text-slate-300">storefront</span>
                      <p className="text-sm text-slate-400 mt-2">No centers assigned to you</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {centers.map((c) => (
                        <button key={c.username} onClick={() => setSelectedCenter(c.username)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                            selectedCenter === c.username
                              ? 'border-[#059669] bg-emerald-50'
                              : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                              selectedCenter === c.username ? 'bg-[#059669] text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {c.full_name?.charAt(0) || c.username.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-slate-900 truncate">{c.full_name}</div>
                              <div className="text-xs text-slate-400 font-mono">{c.username}</div>
                            </div>
                            {selectedCenter === c.username && (
                              <span className="material-symbols-outlined text-[20px] text-[#059669]">check_circle</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center animate-pop-in">
                    <svg className="w-10 h-10 success-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" /></svg>
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900">File Regenerated!</h3>
                  <p className="text-sm text-slate-500">New encrypted credential file is ready</p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Center</span>
                      <span className="text-sm font-bold text-slate-900">{selectedCenterObj?.full_name || selectedCenter}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">File</span>
                      <span className="text-xs font-mono font-semibold text-slate-700">{result.encryptedFile.fileName}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SHA-256</span>
                      <div className="mt-1 p-2 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-600 break-all leading-relaxed">{result.encryptedFile.checksum}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => downloadEncryptedFile(result.encryptedFile)}
                      className="flex-1 py-3 rounded-2xl bg-[#059669] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 active:scale-[0.97] transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">download</span>Download File
                    </button>
                    <button onClick={closeWizard} className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 active:scale-[0.97] transition-all">Done</button>
                  </div>
                </div>
              )}
            </div>

            {!result && (
              <div className="shrink-0 px-5 py-4 border-t border-slate-100 flex gap-3 bg-white">
                <button onClick={handleRegenerate} disabled={submitting || !selectedCenter}
                  className="flex-1 py-3 rounded-2xl bg-[#059669] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 active:scale-[0.97] transition-all disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2">
                  {submitting ? (
                    <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>Regenerating...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">refresh</span>Regenerate</>
                  )}
                </button>
                <button onClick={closeWizard} className="px-5 py-3 rounded-2xl text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors">Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── HEADER ──────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-emerald-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Credential Files</h2>
        <p className="text-sm text-slate-500 mt-1">{filtered.length} center(s)</p>
      </section>

      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search centers..." className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-emerald-100 text-sm font-medium focus:outline-none focus:border-[#059669]" />
      </div>

      <div className="hidden lg:block bg-white rounded-2xl shadow-soft border border-emerald-100/50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-emerald-100">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Center</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Username</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">MAC Address</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Created</th>
          </tr></thead>
          <tbody>{filtered.map((c) => (
            <tr key={c.username} className="border-b border-emerald-100/50 hover:bg-emerald-50/30 transition-colors">
              <td className="px-6 py-4 font-bold text-sm text-slate-900">{c.full_name}</td>
              <td className="px-6 py-4 text-sm font-mono text-slate-700">{c.username}</td>
              <td className="px-6 py-4 text-sm font-mono text-slate-700">{c.mac_address}</td>
              <td className="px-6 py-4 text-xs text-slate-500">{formatDate(c.createdAt)}</td>
            </tr>
          ))}</tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="No credential files found." />}
      </div>

      <div className="lg:hidden space-y-3">{filtered.map((c) => (
        <div key={c.username} className="bg-white rounded-2xl p-4 shadow-soft border border-emerald-100/50">
          <div className="font-bold text-slate-900">{c.full_name}</div>
          <div className="text-xs text-slate-500 font-mono mt-1">{c.username}</div>
          <div className="text-xs text-slate-400 mt-1">MAC: {c.mac_address}</div>
          <div className="text-xs text-slate-400 mt-1">Created: {formatDate(c.createdAt)}</div>
        </div>
      ))}{filtered.length === 0 && <EmptyState text="No credential files found." />}</div>

      <button onClick={openWizard} className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-40 w-14 h-14 rounded-full bg-[#059669] text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 active:scale-95 transition-all duration-150 flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  )
}
