import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      <div className="flex min-h-screen">
        <div className="flex-1 min-w-0">
          <main className="p-4 lg:p-8 space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
