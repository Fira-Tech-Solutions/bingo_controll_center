import { NavLink } from 'react-router-dom'

export default function AgentBottomNav({ onMoreClick }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e1526] border-t border-white/[0.07] lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 w-16 ${isActive ? 'text-[#059669]' : 'text-slate-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined text-[22px]">dashboard</span>
              <span className="text-[10px] font-semibold">Home</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#059669] mt-0.5"></span>}
            </>
          )}
        </NavLink>
        <NavLink
          to="/centers"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 w-16 ${isActive ? 'text-[#059669]' : 'text-slate-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined text-[22px]">storefront</span>
              <span className="text-[10px] font-semibold">Centers</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#059669] mt-0.5"></span>}
            </>
          )}
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 w-16 ${isActive ? 'text-[#059669]' : 'text-slate-400'}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              <span className="text-[10px] font-semibold">Activity</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#059669] mt-0.5"></span>}
            </>
          )}
        </NavLink>
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-0.5 w-16 text-slate-400"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </div>
    </nav>
  )
}
