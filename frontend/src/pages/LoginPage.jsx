import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(form.username, form.password)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex font-sans">
      {/* Left: Hero */}
      <div className="relative hidden md:flex md:w-[45%] flex-col justify-end p-10" style={{ background: 'linear-gradient(135deg, #000072 0%, #1b1b2f 100%)' }}>
        <div className="absolute inset-0 topo-lines opacity-50 pointer-events-none"></div>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 70%, rgba(25, 118, 210, 0.3) 0%, transparent 60%)' }}></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-[#1976d2] p-3 rounded-2xl shadow-lg shadow-[#1976d2]/30">
              <span className="text-2xl font-extrabold text-white">BC</span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white leading-tight drop-shadow-sm tracking-tight">BINGO CONTROL</h2>
              <p className="text-[11px] font-medium text-white/60 tracking-wider uppercase">Centralized Operator Node</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0 z-20 wave-separator leading-none">
          <svg className="w-full block text-[#0f172a] fill-current" fill="none" viewBox="0 0 400 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C80,20 160,60 280,35 C340,22 370,38 400,42 L400,60 L0,60 Z"></path>
          </svg>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center space-x-3 mb-8 md:hidden">
            <div className="bg-[#1976d2] p-2 rounded-xl shadow-lg shadow-[#1976d2]/30">
              <span className="text-xl font-extrabold text-white">BC</span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">BINGO CONTROL</h2>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase">Centralized Operator Node</p>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">Sign in</h1>
          <span className="block w-14 h-1.5 bg-[#1976d2] rounded-full mt-2"></span>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-[rgba(229,57,53,0.1)] border border-[rgba(229,57,53,0.3)] text-sm font-medium text-[#e53935] flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Username</label>
              <div className="relative">
                <span className="absolute left-1 text-slate-500 text-sm flex items-center space-x-1.5 pointer-events-none">
                  <i className="fa-regular fa-user"></i>
                  <span className="text-slate-600">|</span>
                </span>
                <input
                  className="clean-underline-input w-full text-sm font-medium text-white bg-transparent focus:outline-none placeholder:text-slate-500"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="py-2">
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <span className="absolute left-1 text-slate-500 text-sm flex items-center space-x-1.5 pointer-events-none">
                  <i className="fa-solid fa-lock"></i>
                  <span className="text-slate-600">|</span>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="clean-underline-input w-full text-sm font-medium text-white bg-transparent focus:outline-none pr-10 py-2 placeholder:text-slate-500"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 focus:outline-none transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1976d2] hover:bg-[#1565c0] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#1976d2]/25 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-60"
              style={{ boxShadow: '0 0 10px rgba(25, 118, 210, 0.5)' }}
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin text-xs"></i>
              ) : (
                <>
                  <span>Sign in</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
