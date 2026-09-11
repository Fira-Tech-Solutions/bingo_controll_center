import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_SECTIONS = [
  {
    label: 'Command',
    items: [
      { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/centers', label: 'Bingo Centers', icon: 'storefront' },
      { to: '/agents', label: 'Agents', icon: 'badge' },
      { to: '/transactions', label: 'Transactions', icon: 'receipt_long' },
      { to: '/files/balance', label: 'Balance Files', icon: 'key' },
      { to: '/files/credentials', label: 'Credential Files', icon: 'badge' },
    ],
  },
  {
    label: 'Financial',
    items: [
      { to: '/packages', label: 'Packages', icon: 'inventory_2' },
      { to: '/reports', label: 'Reports', icon: 'query_stats' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { to: '/activity', label: 'Activity', icon: 'bolt' },
      { to: '/notifications', label: 'Notifications', icon: 'notifications' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile', icon: 'person' },
      { to: '/security', label: 'Security', icon: 'shield' },
    ],
  },
]

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { user } = useAuth()

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#2563eb] text-white flex items-center justify-center font-extrabold text-sm shadow-lg shadow-blue-500/30">BC</div>
          <div className="min-w-0">
            <div className="font-extrabold text-lg text-white tracking-tight truncate">Bingo Control</div>
            <div className="text-xs text-[#38bdf8] font-bold">Admin</div>
          </div>
        </div>
      </div>

      <nav className="p-3 space-y-5 flex-1 overflow-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{section.label}</div>
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
                        ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
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

      <div className="p-4 m-3 bg-[#131b2e] rounded-xl border border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center font-bold text-sm">
            {user?.full_name?.charAt(0) || 'A'}
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
      <aside className="hidden lg:flex w-72 bg-[#0e1526] shadow-soft border-r border-white/[0.07] flex-col shrink-0">
        {sidebarContent}
      </aside>
    </>
  )
}
