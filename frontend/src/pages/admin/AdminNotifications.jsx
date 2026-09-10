import { Banner } from '../../components/UI'

export default function AdminNotifications() {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Notifications</h2>
        <p className="text-sm text-slate-500 mt-1">System alerts and notifications</p>
      </section>
      <div className="bg-white rounded-2xl p-8 shadow-soft border border-coral-100/50 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300">notifications</span>
        <h3 className="font-extrabold text-lg text-slate-900 mt-4">Backend API Required</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Notification system requires endpoints for creating, reading, and managing notifications per user.</p>
      </div>
    </div>
  )
}
