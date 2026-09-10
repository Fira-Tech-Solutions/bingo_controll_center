import { Banner } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'

export default function SuperAdminSecurity() {
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
          <div className="flex justify-between py-2 border-b border-coral-100/50">
            <span className="text-sm text-slate-500">Role</span>
            <span className="text-sm font-bold text-coral-600">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-coral-100/50">
            <span className="text-sm text-slate-500">Username</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{user?.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-coral-100/50">
            <span className="text-sm text-slate-500">Email</span>
            <span className="text-sm font-bold text-slate-900">{user?.email}</span>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-8 shadow-soft border border-coral-100/50 max-w-xl">
        <span className="material-symbols-outlined text-4xl text-slate-300">shield</span>
        <h3 className="font-extrabold text-lg text-slate-900 mt-3">Advanced Security</h3>
        <p className="text-sm text-slate-500 mt-2">Password policy, session management, and security settings require backend API support.</p>
        <div className="mt-4 p-4 rounded-xl bg-coral-50 border border-coral-100">
          <p className="text-xs font-bold text-coral-600 mb-2">Required Endpoints:</p>
          <code className="text-xs text-slate-700 block font-mono">PUT /api/auth/change-password</code>
          <code className="text-xs text-slate-700 block font-mono mt-1">GET /api/auth/sessions</code>
        </div>
      </section>
    </div>
  )
}
