import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import SuperAdminSidebar from './components/SuperAdminSidebar'
import MobileBottomNav from './components/MobileBottomNav'
import MobileMoreSheet from './components/MobileMoreSheet'
import AdminSidebar from './components/AdminSidebar'
import AdminBottomNav from './components/AdminBottomNav'
import AdminMoreSheet from './components/AdminMoreSheet'
import QueryProvider from './QueryProvider'
import { useState, useRef, useEffect, Suspense, lazy } from 'react'

import LoginPage from './pages/LoginPage'

// Eagerly loaded core pages (visited frequently)
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import SuperAdminCenters from './pages/super-admin/SuperAdminCenters'
import AdminCenters from './pages/admin/AdminCenters'
import SuperAdminCenterDetail from './pages/super-admin/SuperAdminCenterDetail'
import AdminCenterDetail from './pages/admin/AdminCenterDetail'

// Lazy-loaded pages (less frequently visited, heavier)
const SuperAdminAnalytics = lazy(() => import('./pages/super-admin/SuperAdminAnalytics'))
const SuperAdminAdmins = lazy(() => import('./pages/super-admin/SuperAdminAdmins'))
const SuperAdminAgents = lazy(() => import('./pages/super-admin/SuperAdminAgents'))
const SuperAdminPackages = lazy(() => import('./pages/super-admin/SuperAdminPackages'))
const SuperAdminTransactions = lazy(() => import('./pages/super-admin/SuperAdminTransactions'))
const SuperAdminBalanceFiles = lazy(() => import('./pages/super-admin/SuperAdminBalanceFiles'))
const SuperAdminCredentialFiles = lazy(() => import('./pages/super-admin/SuperAdminCredentialFiles'))
const SuperAdminReports = lazy(() => import('./pages/super-admin/SuperAdminReports'))
const SuperAdminAuditLogs = lazy(() => import('./pages/super-admin/SuperAdminAuditLogs'))
const SuperAdminActivity = lazy(() => import('./pages/super-admin/SuperAdminActivity'))
const SuperAdminNotifications = lazy(() => import('./pages/super-admin/SuperAdminNotifications'))
const SuperAdminSettings = lazy(() => import('./pages/super-admin/SuperAdminSettings'))
const SuperAdminProfile = lazy(() => import('./pages/super-admin/SuperAdminProfile'))
const SuperAdminSecurity = lazy(() => import('./pages/super-admin/SuperAdminSecurity'))
const SuperAdminMore = lazy(() => import('./pages/super-admin/SuperAdminMore'))

const AdminAgents = lazy(() => import('./pages/admin/AdminAgents'))
const AdminPackages = lazy(() => import('./pages/admin/AdminPackages'))
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'))
const AdminBalanceFiles = lazy(() => import('./pages/admin/AdminBalanceFiles'))
const AdminCredentialFiles = lazy(() => import('./pages/admin/AdminCredentialFiles'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))
const AdminActivity = lazy(() => import('./pages/admin/AdminActivity'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'))
const AdminSecurity = lazy(() => import('./pages/admin/AdminSecurity'))
const AdminMore = lazy(() => import('./pages/admin/AdminMore'))

const TITLES = {
  '/': 'Dashboard',
  '/analytics': 'System Analytics',
  '/centers': 'Bingo Centers',
  '/users/admins': 'Administrators',
  '/users/agents': 'Agents',
  '/packages': 'Packages',
  '/transactions': 'Transactions',
  '/files/balance': 'Balance Files',
  '/files/credentials': 'Credential Files',
  '/reports': 'Financial Reports',
  '/audit-logs': 'Audit Logs',
  '/activity': 'Activity',
  '/notifications': 'Notifications',
  '/settings': 'System Settings',
  '/profile': 'Profile',
  '/security': 'Security',
  '/more': 'More',
}

function PageLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-[#1e293b] rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[#1e293b] rounded-2xl"></div>
        ))}
      </div>
      <div className="h-64 bg-[#1e293b] rounded-2xl"></div>
    </div>
  )
}

// ─── Single Shell (role-based rendering) ──────────────────────
function AppShell() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const { pathname } = useLocation()
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const Sidebar = isSuperAdmin ? SuperAdminSidebar : AdminSidebar
  const BottomNav = isSuperAdmin ? MobileBottomNav : AdminBottomNav
  const MoreSheet = isSuperAdmin ? MobileMoreSheet : AdminMoreSheet

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 min-w-0 pb-20 lg:pb-0">
          <header className="sticky top-0 z-20 bg-[#1e293b]/90 backdrop-blur border-b border-[#334155] px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-[#334155] text-slate-300"><span className="material-symbols-outlined">menu</span></button>
              <div className="min-w-0">
                <div className="font-extrabold text-xl text-white tracking-tight truncate">{TITLES[pathname] || 'Dashboard'}</div>
              </div>
            </div>
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="w-10 h-10 rounded-full bg-[#1976d2] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-[#1976d2]/30 hover:bg-[#1565c0] transition-colors">
                {userInitial}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-64 bg-[#1e293b] rounded-2xl shadow-xl border border-[#334155] py-2 animate-fade-up z-50">
                  <div className="px-4 py-3 border-b border-[#334155]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#1976d2] text-white flex items-center justify-center font-bold text-lg">{userInitial}</div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate">{user?.full_name}</div>
                        <div className="text-xs text-slate-400 truncate">@{user?.username}</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[16px] text-slate-400">mail</span><span className="text-slate-300 truncate">{user?.email || '—'}</span></div>
                    <div className="flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[16px] text-slate-400">badge</span><span className="text-slate-300">{isSuperAdmin ? 'Super Admin' : 'Admin'}</span></div>
                  </div>
                  <div className="border-t border-[#334155] pt-2 px-2">
                    <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[#e53935] hover:bg-[rgba(229,57,53,0.1)] text-sm font-semibold transition-colors">
                      <span className="material-symbols-outlined text-[18px]">logout</span>Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>
          <main className="p-4 lg:p-8 space-y-6">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Shared routes - core pages eagerly loaded */}
                <Route index element={isSuperAdmin ? <SuperAdminDashboard /> : <AdminDashboard />} />
                <Route path="centers" element={isSuperAdmin ? <SuperAdminCenters /> : <AdminCenters />} />
                <Route path="centers/:id" element={isSuperAdmin ? <SuperAdminCenterDetail /> : <AdminCenterDetail />} />
                <Route path="users/agents" element={isSuperAdmin ? <SuperAdminAgents /> : <Navigate to="/agents" replace />} />
                <Route path="agents" element={isSuperAdmin ? <Navigate to="/users/agents" replace /> : <AdminAgents />} />
                <Route path="packages" element={isSuperAdmin ? <SuperAdminPackages /> : <AdminPackages />} />
                <Route path="transactions" element={isSuperAdmin ? <SuperAdminTransactions /> : <AdminTransactions />} />
                <Route path="files/balance" element={isSuperAdmin ? <SuperAdminBalanceFiles /> : <AdminBalanceFiles />} />
                <Route path="files/credentials" element={isSuperAdmin ? <SuperAdminCredentialFiles /> : <AdminCredentialFiles />} />
                <Route path="reports" element={isSuperAdmin ? <SuperAdminReports /> : <AdminReports />} />
                <Route path="activity" element={isSuperAdmin ? <SuperAdminActivity /> : <AdminActivity />} />
                <Route path="notifications" element={isSuperAdmin ? <SuperAdminNotifications /> : <AdminNotifications />} />
                <Route path="profile" element={isSuperAdmin ? <SuperAdminProfile /> : <AdminProfile />} />
                <Route path="security" element={isSuperAdmin ? <SuperAdminSecurity /> : <AdminSecurity />} />
                <Route path="more" element={isSuperAdmin ? <SuperAdminMore /> : <AdminMore />} />

                {/* Super Admin only routes */}
                {isSuperAdmin && (
                  <>
                    <Route path="analytics" element={<SuperAdminAnalytics />} />
                    <Route path="users/admins" element={<SuperAdminAdmins />} />
                    <Route path="audit-logs" element={<SuperAdminAuditLogs />} />
                    <Route path="settings" element={<SuperAdminSettings />} />
                  </>
                )}

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
      <div className="lg:hidden"><BottomNav onMoreClick={() => setMoreOpen(true)} /></div>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  )
}

// ─── Root Router ───────────────────────────────────────────────
function AppRoutes() {
  const { token, user } = useAuth()

  if (!token || !user) return <LoginPage />

  return <AppShell />
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  )
}
