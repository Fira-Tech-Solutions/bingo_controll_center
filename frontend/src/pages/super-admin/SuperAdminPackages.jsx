import { useEffect, useState, useMemo } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { Banner, Field, EmptyState, formatAmount, formatDate } from '../../components/UI'

const inputClass = "w-full h-11 px-4 rounded-xl bg-coral-50/50 focus:bg-white outline-none border border-coral-100 focus:border-coral-500 text-sm font-medium text-slate-800 transition-colors"

export default function SuperAdminPackages() {
  const { token } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', payment_amount: '', balance_amount: '', description: '', is_bonus: false })
  const [formStep, setFormStep] = useState('form')
  const [usageMap, setUsageMap] = useState({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.getPackages(token, 1, 100)
      setPackages(res.data)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  function handleFormChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }))
  }

  function handleReview(e) {
    e.preventDefault()
    if (!form.name || !form.payment_amount || !form.balance_amount) { setError('Name, payment and balance amounts are required.'); return }
    setError('')
    setFormStep('review')
  }

  async function handleCreate() {
    setLoading(true)
    setError('')
    setNotice('')
    try {
        const body = { name: form.name, payment_amount: Number(form.payment_amount), balance_amount: Number(form.balance_amount), description: form.description || undefined, is_bonus: form.is_bonus }
      if (editingId) {
        await api.updatePackage(token, editingId, body)
        setNotice('Package updated.')
      } else {
        await api.createPackage(token, body)
        setNotice('Package created.')
      }
      setForm({ name: '', payment_amount: '', balance_amount: '', description: '', is_bonus: false })
      setEditingId(null)
      setFormStep('form')
      setShowCreate(false)
      await loadData()
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  async function handleToggle(id) {
    setLoading(true)
    try {
      await api.togglePackage(token, id)
      setNotice('Package status updated.')
      await loadData()
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  async function loadUsage(id) {
    try {
      const res = await api.getPackageUsage(token, id)
      setUsageMap((s) => ({ ...s, [id]: res.data }))
    } catch {}
  }

  function startEdit(pkg) {
    setEditingId(pkg.id)
    setForm({ name: pkg.name, payment_amount: String(pkg.paymentAmount), balance_amount: String(pkg.balanceAmount), description: pkg.description || '', is_bonus: pkg.isBonus || false })
    setFormStep('form')
    setShowCreate(true)
  }

  const preview = useMemo(() => {
    const pay = Number(form.payment_amount) || 0
    const bal = Number(form.balance_amount) || 0
    return { pay, bal, diff: bal - pay }
  }, [form.payment_amount, form.balance_amount])

  return (
    <div className="space-y-6">
      {error && <Banner tone="error" text={error} />}
      {notice && <Banner tone="success" text={notice} />}

      <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">Packages</h2>
          <p className="text-sm text-slate-500 mt-1">{packages.length} package(s) • Full CRUD available</p>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setEditingId(null); setForm({ name: '', payment_amount: '', balance_amount: '', description: '' }); setFormStep('form'); }} className="px-4 py-2.5 rounded-xl bg-coral-500 text-white font-bold text-sm shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors">
          <i className="fa-solid fa-plus mr-1.5"></i>Create Package
        </button>
      </section>

      {/* Create/Edit Form */}
      {showCreate && (
        <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
          {formStep === 'form' ? (
            <>
              <h3 className="font-extrabold text-lg text-slate-900">{editingId ? 'Edit Package' : 'Create Package'}</h3>
              <form onSubmit={handleReview} className="space-y-4 mt-4">
                <Field label="Package Name"><input name="name" className={inputClass} value={form.name} onChange={handleFormChange} required /></Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Payment Amount (ETB)"><input name="payment_amount" type="number" className={inputClass} value={form.payment_amount} onChange={handleFormChange} required /></Field>
                  <Field label="Balance Amount (ETB)"><input name="balance_amount" type="number" className={inputClass} value={form.balance_amount} onChange={handleFormChange} required /></Field>
                </div>
                <Field label="Description (optional)"><textarea name="description" className={`${inputClass} h-20 resize-none`} value={form.description} onChange={handleFormChange} /></Field>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="is_bonus" name="is_bonus" checked={form.is_bonus} onChange={(e) => setForm((s) => ({ ...s, is_bonus: e.target.checked }))} className="w-4 h-4 rounded border-coral-300 text-coral-500 focus:ring-coral-500" />
                  <label htmlFor="is_bonus" className="text-sm font-medium text-slate-700">Bonus Package (one-time use per center)</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-coral-500 text-white font-bold text-sm shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors">Preview & Confirm</button>
                  <button type="button" onClick={() => { setShowCreate(false); setEditingId(null); }} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h3 className="font-extrabold text-lg text-slate-900">{editingId ? 'Review Edit' : 'Confirm Package'}</h3>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-coral-50 border border-coral-100 text-center">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Customer Pays</div>
                  <div className="mt-2 text-2xl font-extrabold text-slate-900">{formatAmount(preview.pay)}</div>
                </div>
                <div className="p-5 rounded-xl bg-coral-50 border border-coral-100 text-center">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Application Balance</div>
                  <div className="mt-2 text-2xl font-extrabold text-coral-600">{formatAmount(preview.bal)}</div>
                </div>
                <div className="p-5 rounded-xl bg-coral-50 border border-coral-100 text-center">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Difference</div>
                  <div className="mt-2 text-2xl font-extrabold text-emerald-600">{formatAmount(preview.diff)}</div>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Name</span><span className="font-bold text-slate-900">{form.name}</span></div>
                {form.is_bonus && <div className="flex justify-between text-sm"><span className="text-slate-500">Type</span><span className="font-bold text-amber-600">Bonus (one-time use)</span></div>}
                {form.description && <div className="flex justify-between text-sm"><span className="text-slate-500">Description</span><span className="text-slate-700">{form.description}</span></div>}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleCreate} disabled={loading} className="px-6 py-2.5 rounded-xl bg-coral-500 text-white font-bold text-sm shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors disabled:opacity-60">{loading ? <i className="fa-solid fa-spinner fa-spin"></i> : editingId ? 'Save Changes' : 'Create Package'}</button>
                <button onClick={() => setFormStep('form')} className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors">Back</button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-soft border border-coral-100/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-coral-100">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Package</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Payment</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Balance</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Usage</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Created</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id} className="border-b border-coral-100/50 hover:bg-coral-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm text-slate-900">{pkg.name}</div>
                  {pkg.isBonus && <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">BONUS</span>}
                  {pkg.description && <div className="text-xs text-slate-500 truncate max-w-[200px]">{pkg.description}</div>}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{formatAmount(pkg.paymentAmount)}</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-coral-600">{formatAmount(pkg.balanceAmount)}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-700">{pkg.usageCount}x</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${pkg.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{pkg.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-slate-500">{formatDate(pkg.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => startEdit(pkg)} className="px-3 py-1.5 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">Edit</button>
                    <button onClick={() => handleToggle(pkg.id)} disabled={loading} className="px-3 py-1.5 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">{pkg.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => loadUsage(pkg.id)} className="px-3 py-1.5 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100 hover:bg-coral-100 transition-colors">Usage</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {packages.length === 0 && <EmptyState text="No packages created yet." />}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-2xl p-4 shadow-soft border border-coral-100/50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-slate-900">{pkg.name}</div>
                {pkg.isBonus && <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">BONUS</span>}
                {pkg.description && <div className="text-xs text-slate-500 truncate">{pkg.description}</div>}
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${pkg.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{pkg.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2 rounded-lg bg-coral-50/50">
                <div className="text-xs text-slate-500">Pay</div>
                <div className="font-bold text-sm text-slate-900">{formatAmount(pkg.paymentAmount)}</div>
              </div>
              <div className="p-2 rounded-lg bg-coral-50/50">
                <div className="text-xs text-slate-500">Balance</div>
                <div className="font-bold text-sm text-coral-600">{formatAmount(pkg.balanceAmount)}</div>
              </div>
              <div className="p-2 rounded-lg bg-coral-50/50">
                <div className="text-xs text-slate-500">Used</div>
                <div className="font-bold text-sm text-slate-900">{pkg.usageCount}x</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => startEdit(pkg)} className="flex-1 py-2 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100">Edit</button>
              <button onClick={() => handleToggle(pkg.id)} disabled={loading} className="flex-1 py-2 rounded-lg bg-coral-50 text-coral-600 text-xs font-semibold border border-coral-100">{pkg.isActive ? 'Deactivate' : 'Activate'}</button>
            </div>
          </div>
        ))}
        {packages.length === 0 && <EmptyState text="No packages created yet." />}
      </div>
    </div>
  )
}
