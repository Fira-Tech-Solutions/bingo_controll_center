import { NavLink } from 'react-router-dom'

const MORE_ITEMS = [
  { to: '/files/balance', label: 'Balance Files', icon: 'key' },
  { to: '/files/credentials', label: 'Credential Files', icon: 'badge' },
  { to: '/packages', label: 'Packages', icon: 'inventory_2' },
  { to: '/reports', label: 'Reports', icon: 'query_stats' },
  { to: '/activity', label: 'Activity', icon: 'bolt' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/profile', label: 'Profile', icon: 'person' },
  { to: '/security', label: 'Security', icon: 'shield' },
]

export default function AdminMoreSheet({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[#1b1b2f] rounded-t-3xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#334155]"></div>
        </div>
        <div className="px-5 pb-2">
          <h3 className="font-extrabold text-lg text-white">More</h3>
        </div>
        <div className="flex-1 overflow-auto px-5 pb-8">
          <div className="grid grid-cols-3 gap-3">
            {MORE_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors ${
                    isActive ? 'bg-[#1976d2]/20 text-[#38bdf8]' : 'bg-[#1e293b] text-slate-400 hover:bg-[#334155]'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                <span className="text-xs font-semibold text-center leading-tight">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
