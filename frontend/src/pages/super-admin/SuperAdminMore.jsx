import { NavLink } from 'react-router-dom'

const MORE_ITEMS = [
  { to: '/super-admin/analytics', label: 'Analytics', icon: 'analytics' },
  { to: '/super-admin/users/admins', label: 'Administrators', icon: 'admin_panel_settings' },
  { to: '/super-admin/users/agents', label: 'Agents', icon: 'badge' },
  { to: '/super-admin/files/balance', label: 'Balance Files', icon: 'key' },
  { to: '/super-admin/files/credentials', label: 'Credential Files', icon: 'badge' },
  { to: '/super-admin/reports', label: 'Financial Reports', icon: 'query_stats' },
  { to: '/super-admin/audit-logs', label: 'Audit Logs', icon: 'history' },
  { to: '/super-admin/activity', label: 'Activity', icon: 'bolt' },
  { to: '/super-admin/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/super-admin/settings', label: 'System Settings', icon: 'settings' },
  { to: '/super-admin/profile', label: 'Profile', icon: 'person' },
  { to: '/super-admin/security', label: 'Security', icon: 'shield' },
]

export default function SuperAdminMore() {
  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">More</h2>
        <p className="text-sm text-slate-500 mt-1">All available sections</p>
      </section>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {MORE_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className="bg-white rounded-2xl p-5 shadow-soft border border-coral-100/50 flex flex-col items-center gap-3 hover:shadow-md transition-shadow text-center">
            <span className="material-symbols-outlined text-3xl text-coral-500">{item.icon}</span>
            <span className="font-bold text-sm text-slate-900">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
