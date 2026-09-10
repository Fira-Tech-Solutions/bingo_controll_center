export function Banner({ tone, text }) {
  const toneClass = tone === 'error'
    ? 'bg-red-50 text-red-600 border-red-200'
    : 'bg-coral-50 text-coral-600 border-coral-200'
  return (
    <div className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${toneClass}`}>
      <i className={`fa-solid ${tone === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
      {text}
    </div>
  )
}

export function MetricCard({ title, value, sub, icon, accent }) {
  const accentClasses = accent === 'secondary'
    ? 'text-coral-600 bg-coral-50'
    : 'text-slate-900 bg-coral-500/10'

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{title}</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentClasses}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-500">{sub}</div>
    </div>
  )
}

export function StatCard({ label, value }) {
  return (
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
      <div className="text-sm text-white/70">{label}</div>
      <div className="text-lg font-bold mt-1">{value}</div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-700 mb-2">{label}</div>
      {children}
    </label>
  )
}

export function InfoPill({ label, value, valueClass }) {
  return (
    <div className="bg-white rounded-lg px-3 py-2 border border-coral-100/50">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`font-bold mt-1 ${valueClass || 'text-slate-900'}`}>{value}</div>
    </div>
  )
}

export function InfoBox({ label, value, mono = false }) {
  return (
    <div className="p-4 rounded-xl bg-coral-50 border border-coral-100/50">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{label}</div>
      <div className={`mt-2 font-bold break-all text-slate-900 ${mono ? 'font-mono text-sm' : ''}`}>{value || '—'}</div>
    </div>
  )
}

export function EmptyState({ text }) {
  return (
    <div className="rounded-xl bg-coral-50 border border-coral-100 p-5 text-sm text-slate-500 text-center font-medium">
      {text}
    </div>
  )
}

export function LedgerRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/70">{label}</span>
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
