import { useAuth } from '../../context/AuthContext'

export default function AdminSecurity() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Security</h2>
        <p className="text-sm text-slate-500 mt-1">Account security and access control</p>
      </section>
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50 max-w-xl">
        <h3 className="font-extrabold text-lg text-slate-900 mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-coral-100/50"><span className="text-sm text-slate-500">Role</span><span className="text-sm font-bold text-coral-600">{user?.role}</span></div>
          <div className="flex justify-between py-2 border-b border-coral-100/50"><span className="text-sm text-slate-500">Username</span><span className="text-sm font-bold text-slate-900 font-mono">{user?.username}</span></div>
          <div className="flex justify-between py-2 border-b border-coral-100/50"><span className="text-sm text-slate-500">Email</span><span className="text-sm font-bold text-slate-900">{user?.email}</span></div>
        </div>
      </section>
      <section className="bg-white rounded-2xl p-8 shadow-soft border border-coral-100/50 max-w-xl">
        <span className="material-symbols-outlined text-4xl text-slate-300">shield</span>
        <h3 className="font-extrabold text-lg text-slate-900 mt-3">Advanced Security</h3>
        <p className="text-sm text-slate-500 mt-2">Password policy and session management require backend API support.</p>
      </section>
    </div>
  )
}
