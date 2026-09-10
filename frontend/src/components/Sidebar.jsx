import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  OPERATOR: 'Agent',
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, isAdmin } = useAuth()

  const navItems = [
    { to: '/', label: 'Dashboard', icon: 'grid_view' },
    { to: '/centers', label: 'Bingo Centers', icon: 'storefront' },
    { to: '/balance-file', label: 'Generate Balance File', icon: 'key' },
    { to: '/credential-file', label: 'Generate Credential File', icon: 'badge' },
    { to: '/transactions', label: 'Transactions & Ledgers', icon: 'receipt_long' },
    ...(isAdmin ? [
      { to: '/users', label: 'Users & Agents', icon: 'group' },
      { to: '/packages', label: 'Packages', icon: 'inventory_2' },
    ] : []),
  ]

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Brand Header */}
      <div className="p-5 border-b border-coral-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-coral-500 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-coral-500/20">BC</div>
          <div>
            <div className="font-extrabold text-lg text-slate-900 tracking-tight">Bingo Control</div>
            <div className="text-xs text-slate-500 font-medium">Terminal Core</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1 overflow-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-150 ${
                isActive
                  ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20'
                  : 'text-slate-600 hover:bg-coral-50 hover:text-coral-600'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="font-semibold text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Role Badge */}
      <div className="p-4 m-3 bg-coral-50 rounded-xl border border-coral-100">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Role</span>
          <span className="text-coral-600 font-bold">{ROLE_LABELS[user?.role] || user?.role}</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white shadow-soft border-r border-coral-100 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex justify-end p-2">
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-coral-50 text-slate-600">
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
