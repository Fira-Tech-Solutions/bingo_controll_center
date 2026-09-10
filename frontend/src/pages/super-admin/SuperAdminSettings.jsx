import { Banner } from '../../components/UI'

export default function SuperAdminSettings() {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Application and system configuration</p>
      </section>
      <div className="bg-white rounded-2xl p-8 shadow-soft border border-coral-100/50 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300">settings</span>
        <h3 className="font-extrabold text-lg text-slate-900 mt-4">Backend API Required</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">System settings require backend endpoints for reading and updating application configuration (general, business, security, notifications).</p>
        <div className="mt-4 p-4 rounded-xl bg-coral-50 border border-coral-100 text-left max-w-md mx-auto">
          <p className="text-xs font-bold text-coral-600 mb-2">Required Endpoints:</p>
          <code className="text-xs text-slate-700 block font-mono">GET /api/settings</code>
          <code className="text-xs text-slate-700 block font-mono mt-1">PUT /api/settings</code>
        </div>
      </div>
    </div>
  )
}
