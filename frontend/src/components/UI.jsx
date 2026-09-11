export function Banner({ tone, text }) {
  const toneClass = tone === 'error'
    ? 'bg-red-50 text-red-500 border-red-200'
    : 'bg-coral-50 text-coral-500 border-coral-200'
  return (
    <div className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${toneClass}`}>
      <i className={`fa-solid ${tone === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
      {text}
    </div>
  )
}

export function MetricCard({ title, value, sub, icon, accent }) {
  const accentClasses = accent === 'secondary'
    ? 'text-coral-500 bg-coral-50'
    : 'text-white bg-coral-500/10'

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{title}</div>
          <div className="mt-2 text-3xl font-extrabold text-white tracking-tight tabular-nums">{value}</div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentClasses}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-400">{sub}</div>
    </div>
  )
}

export function StatCard({ label, value }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-lg font-bold mt-1 text-white">{value}</div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-300 mb-2">{label}</div>
      {children}
    </label>
  )
}

export function InfoPill({ label, value, valueClass }) {
  return (
    <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/5">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`font-bold mt-1 ${valueClass || 'text-white'}`}>{value}</div>
    </div>
  )
}

export function InfoBox({ label, value, mono = false }) {
  return (
    <div className="p-4 rounded-xl bg-coral-50 border border-coral-100/50">
      <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{label}</div>
      <div className={`mt-2 font-bold break-all text-white ${mono ? 'font-mono text-sm' : ''}`}>{value || '—'}</div>
    </div>
  )
}

export function EmptyState({ text }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/5 p-5 text-sm text-slate-400 text-center font-medium">
      {text}
    </div>
  )
}

export function LedgerRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold ${highlight || 'text-white'}`}>{value}</span>
    </div>
  )
}

export function formatAmount(value) {
  const number = Number(value || 0)
  return `${number.toLocaleString()} ETB`
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export function downloadEncryptedFile(file, fallbackExt = '.enc') {
  if (!file?.filePayload) return

  const isBinary = Boolean(file.downloadAsBinary)
  const raw = isBinary ? atob(file.filePayload) : file.filePayload
  const bytes = isBinary ? Uint8Array.from(raw, (c) => c.charCodeAt(0)) : new TextEncoder().encode(raw)
  const blob = new Blob([bytes], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.fileName || `download${fallbackExt}`
  a.click()
  URL.revokeObjectURL(url)
}
