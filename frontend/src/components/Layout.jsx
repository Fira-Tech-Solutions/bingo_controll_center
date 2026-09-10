import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur border-b border-surface-container px-4 lg:px-8 h-16 flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface-container-high">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </header>
          <main className="p-4 lg:p-8 space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
