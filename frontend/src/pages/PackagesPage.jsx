import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Banner, Field, EmptyState, formatAmount } from '../components/UI'

const DEFAULT_PACKAGE = { name: '', payment_amount: '', balance_amount: '', description: '' }
const inputClass = "w-full h-11 px-4 rounded-xl bg-coral-50/50 focus:bg-white outline-none border border-coral-100 focus:border-coral-500 text-sm font-medium text-slate-800 transition-colors"

export default function PackagesPage() {
  const { token } = useAuth()
  const [packages, setPackages] = useState([])
  const [packageForm, setPackageForm] = useState(DEFAULT_PACKAGE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/packages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load packages')
      setPackages(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePackage(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const url = editingId
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/packages/${editingId}`
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/packages`
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: packageForm.name,
          payment_amount: Number(packageForm.payment_amount),
          balance_amount: Number(packageForm.balance_amount),
          description: packageForm.description || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save package')
      setNotice(editingId ? 'Package updated.' : 'Package created.')
      setPackageForm(DEFAULT_PACKAGE)
      setEditingId(null)
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(id) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/packages/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to toggle package')
      setNotice('Package status updated.')
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(pkg) {
    setEditingId(pkg.id)
    setPackageForm({
      name: pkg.name,
      payment_amount: pkg.paymentAmount,
      balance_amount: pkg.balanceAmount,
      description: pkg.description || '',
    })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setPackageForm(DEFAULT_PACKAGE)
  }

  return (
    <div className="grid xl:grid-cols-12 gap-6">
      {error && <div className="xl:col-span-12"><Banner tone="error" text={error} /></div>}
      {notice && <div className="xl:col-span-12"><Banner tone="success" text={notice} /></div>}

      {/* Package Form */}
      <section className="xl:col-span-5 bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">{editingId ? 'Edit Package' : 'Create Package'}</h3>
        <p className="text-sm text-slate-500 mt-1">Defines recharge tiers for centers.</p>
        <form onSubmit={handleCreatePackage} className="space-y-4 mt-4">
          <Field label="Package Name">
            <input className={inputClass} value={packageForm.name} onChange={(e) => setPackageForm((s) => ({ ...s, name: e.target.value }))} required />
          </Field>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Payment Amount (ETB)">
              <input type="number" className={inputClass} value={packageForm.payment_amount} onChange={(e) => setPackageForm((s) => ({ ...s, payment_amount: e.target.value }))} required />
            </Field>
            <Field label="Balance Amount (ETB)">
              <input type="number" className={inputClass} value={packageForm.balance_amount} onChange={(e) => setPackageForm((s) => ({ ...s, balance_amount: e.target.value }))} required />
            </Field>
          </div>
          <Field label="Description">
            <textarea className="w-full px-4 py-3 rounded-xl bg-coral-50/50 focus:bg-white outline-none border border-coral-100 focus:border-coral-500 text-sm font-medium text-slate-800 transition-colors" rows={3} value={packageForm.description} onChange={(e) => setPackageForm((s) => ({ ...s, description: e.target.value }))} />
          </Field>
          <div className="flex gap-3">
            <button disabled={loading} className="flex-1 h-11 rounded-xl bg-coral-500 text-white font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">
              <i className={`fa-solid ${editingId ? 'fa-save' : 'fa-plus'} mr-2`}></i>
              {editingId ? 'Update Package' : 'Create Package'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="h-11 px-4 rounded-xl bg-coral-50 text-coral-600 font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Packages List */}
      <section className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Packages</h3>
            <p className="text-sm text-slate-500 mt-1">Manages recharge package tiers.</p>
          </div>
          <div className="px-3 py-2 rounded-full bg-coral-50 text-coral-600 font-mono text-sm font-bold border border-coral-100">{packages.length} packages</div>
        </div>
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">{pkg.name}</div>
                  <div className="text-sm mt-1">
                    <span className="text-emerald-600 font-bold">{formatAmount(pkg.paymentAmount)}</span>
                    <span className="text-slate-400 mx-2">→</span>
                    <span className="text-coral-600 font-bold">{formatAmount(pkg.balanceAmount)}</span>
                  </div>
                  {pkg.description && <div className="text-xs text-slate-500 mt-1">{pkg.description}</div>}
                  <div className="text-xs text-slate-500 mt-1">Created by: {pkg.createdBy} • Used {pkg.usageCount} times</div>
                </div>
                <div className="flex flex-wrap gap-2 lg:items-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${pkg.isActive ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => handleEdit(pkg)} disabled={loading} className="px-3 py-2 rounded-lg bg-coral-50 text-coral-600 text-sm font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">
                    <i className="fa-solid fa-pen mr-1"></i>Edit
                  </button>
                  <button onClick={() => handleToggleActive(pkg.id)} disabled={loading} className="px-3 py-2 rounded-lg bg-coral-500 text-white text-sm font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors">
                    {pkg.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {packages.length === 0 && <EmptyState text="No packages created yet." />}
        </div>
      </section>
    </div>
  )
}
