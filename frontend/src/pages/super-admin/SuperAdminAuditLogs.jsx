import { Banner } from '../../components/UI'

export default function SuperAdminAuditLogs() {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Audit Logs</h2>
        <p className="text-sm text-slate-500 mt-1">Security and accountability record</p>
      </section>

      <div className="bg-white rounded-2xl p-8 shadow-soft border border-coral-100/50 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300">history</span>
        <h3 className="font-extrabold text-lg text-slate-900 mt-4">Backend API Required</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Audit log functionality requires a backend endpoint that records all user actions with timestamps, actors, resources, and results.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-coral-50 border border-coral-100 text-left max-w-md mx-auto">
          <p className="text-xs font-bold text-coral-600 mb-2">Required Endpoint:</p>
          <code className="text-xs text-slate-700 block font-mono">GET /api/audit-logs</code>
          <p className="text-xs text-slate-500 mt-2">Query params: dateFrom, dateTo, user, role, action, resource, result</p>
        </div>
      </div>
    </div>
  )
}
