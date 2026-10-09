import { Banner } from '../../components/UI'

export default function AgentSecurity() {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-emerald-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Security</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your account security</p>
      </section>
      <div className="bg-white rounded-2xl p-8 shadow-soft border border-emerald-100/50 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300">shield</span>
        <h3 className="font-extrabold text-lg text-slate-900 mt-4">Contact Admin</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">To change your password or manage security settings, please contact your administrator.</p>
      </div>
    </div>
  )
}
