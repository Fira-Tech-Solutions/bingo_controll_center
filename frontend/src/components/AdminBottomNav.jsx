import { NavLink } from 'react-router-dom'

const BOTTOM_ITEMS = [
  { to: '/', label: 'Home', icon: 'dashboard', end: true },
  { to: '/centers', label: 'Centers', icon: 'storefront' },
  { to: '/agents', label: 'Agents', icon: 'badge' },
  { to: '/transactions', label: 'Activity', icon: 'receipt_long' },
  { to: '/more', label: 'More', icon: 'menu' },
]

export default function AdminBottomNav({ onMoreClick }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e1526] border-t border-white/[0.07] lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {BOTTOM_ITEMS.map((item) =>
          item.label === 'More' ? (
            <button
              key={item.to}
              onClick={onMoreClick}
              className="flex flex-col items-center justify-center gap-0.5 w-16 text-slate-400"
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 w-16 ${
                  isActive ? 'text-[#3b82f6]' : 'text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                  {isActive && <span className="w-1 h-1 rounded-full bg-[#3b82f6] mt-0.5"></span>}
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
