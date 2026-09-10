import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { Banner, InfoBox, EmptyState, downloadEncryptedFile, formatDate } from '../components/UI'

export default function CredentialFilePage() {
  const { token, user } = useAuth()
  const [centers, setCenters] = useState([])
  const [generatedFile, setGeneratedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const centerFilter = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? undefined : user.username
      const centersRes = await api.getCenters(token, centerFilter)
      setCenters(centersRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerate(username) {
    setLoading(true)
    setError('')
    try {
      const res = await api.regenerateUserFile(token, { username })
      setGeneratedFile(res.encryptedFile)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid xl:grid-cols-12 gap-6">
      {error && <div className="xl:col-span-12"><Banner tone="error" text={error} /></div>}

      <section className="xl:col-span-7 bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50">
        <h3 className="font-extrabold text-2xl text-slate-900 tracking-tight">Generate Credential File (.enc)</h3>
        <p className="text-slate-500 mt-2 text-sm">This uses `POST /api/bingo-centers/regenerate-user-file` and the backend `generateUserFile()` implementation with the stored center password hash and MAC address.</p>
        <div className="space-y-3 mt-5">
          {centers.map((center) => (
            <div key={center.username} className="p-4 rounded-xl bg-coral-50/50 border border-coral-100/50 flex flex-col md:flex-row justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900">{center.full_name}</div>
                <div className="text-sm text-slate-500 font-mono">{center.username} • {center.mac_address}</div>
              </div>
              <button disabled={loading} onClick={() => handleRegenerate(center.username)} className="px-4 py-2 rounded-lg bg-coral-500 text-white font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors text-sm disabled:opacity-60">
                <i className="fa-solid fa-file-lines mr-2"></i>Generate User Credential File
              </button>
            </div>
          ))}
          {centers.length === 0 && <EmptyState text="No centers available for credential regeneration." />}
        </div>
      </section>

      <section className="xl:col-span-5">
        <section className="bg-white rounded-2xl p-6 shadow-soft border border-coral-100/50 h-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">File Ready for Deployment</h3>
              <p className="text-sm text-slate-500 mt-1">Latest encrypted file returned by the backend.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-coral-50 text-coral-600 text-xs font-bold border border-coral-100">Credential File</span>
          </div>
          {!generatedFile ? (
            <div className="mt-6"><EmptyState text="No credential file generated yet in this session." /></div>
          ) : (
            <div className="space-y-4 mt-5">
              <div className="p-4 rounded-xl bg-coral-50 border border-coral-100">
                <div className="font-mono text-sm break-all font-bold text-coral-600">{generatedFile.fileName}</div>
                <div className="text-xs text-slate-500 mt-1">Transaction Ref: {generatedFile.transactionRef}</div>
              </div>
              <div className="grid gap-3">
                <InfoBox label="Format" value={generatedFile.format} />
                <InfoBox label="Checksum" value={generatedFile.checksum} mono />
                <InfoBox label="Key Fingerprint" value={generatedFile.keyFingerprint} mono />
                <InfoBox label="Timestamp" value={formatDate(generatedFile.timestamp)} />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => downloadEncryptedFile(generatedFile)} className="px-4 py-3 rounded-xl bg-coral-500 text-white font-bold shadow-md shadow-coral-500/20 hover:bg-coral-600 transition-colors">
                  <i className="fa-solid fa-download mr-2"></i>Download File
                </button>
                <button onClick={() => navigator.clipboard?.writeText(generatedFile.checksum)} className="px-4 py-3 rounded-xl bg-coral-50 text-coral-600 font-bold border border-coral-100 hover:bg-coral-100 transition-colors">
                  <i className="fa-solid fa-copy mr-2"></i>Copy SHA256
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  )
}
