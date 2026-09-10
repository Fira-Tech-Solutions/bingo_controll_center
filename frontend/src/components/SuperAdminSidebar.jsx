import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_SECTIONS = [
  {
    label: 'Command',
    items: [
      { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
      { to: '/analytics', label: 'Analytics', icon: 'analytics' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/centers', label: 'Bingo Centers', icon: 'storefront' },
      { to: '/users/admins', label: 'Administrators', icon: 'admin_panel_settings' },
      { to: '/users/agents', label: 'Agents', icon: 'badge' },
      { to: '/packages', label: 'Packages', icon: 'inventory_2' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/transactions', label: 'Transactions', icon: 'receipt_long' },
      { to: '/files/balance', label: 'Balance Files', icon: 'key' },
      { to: '/files/credentials', label: 'Credential Files', icon: 'badge' },
      { to: '/reports', label: 'Financial Reports', icon: 'query_stats' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/audit-logs', label: 'Audit Logs', icon: 'history' },
      { to: '/activity', label: 'Activity', icon: 'bolt' },
      { to: '/notifications', label: 'Notifications', icon: 'notifications' },
      { to: '/settings', label: 'System Settings', icon: 'settings' },
      { to: '/profile', label: 'Profile', icon: 'person' },
      { to: '/security', label: 'Security', icon: 'shield' },
    ],
  },
]

export default function SuperAdminSidebar({ mobileOpen, onClose }) {
  const { user } = useAuth()

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-5 border-b border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#1976d2] text-white flex items-center justify-center font-extrabold text-sm shadow-lg shadow-[#1976d2]/30">BC</div>
          <div className="min-w-0">
            <div className="font-extrabold text-lg text-white tracking-tight truncate">Bingo Control</div>
            <div className="text-xs text-[#38bdf8] font-bold">Super Admin</div>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-5 flex-1 overflow-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{section.label}</div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-[#1976d2] text-white shadow-lg shadow-[#1976d2]/20'
                        : 'text-slate-400 hover:bg-[#334155] hover:text-white'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-semibold text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 m-3 bg-[#1e293b] rounded-xl border border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1976d2] text-white flex items-center justify-center font-bold text-sm">
            {user?.full_name?.charAt(0) || 'SA'}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-white truncate">{user?.full_name}</div>
            <div className="text-xs text-slate-400 truncate">{user?.username}</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex w-72 bg-[#1b1b2f] shadow-soft border-r border-[#334155] flex-col shrink-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#1b1b2f] shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex justify-end p-2">
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#334155] text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
