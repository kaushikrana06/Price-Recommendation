import { useMemo } from 'react'

export default function Settings(){
  const baseURL = useMemo(()=> import.meta.env.VITE_API_BASE_URL ?? '/api', [])
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mb-6 text-sm text-slate-600">Environment & debugging aids.</p>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm">
          <div className="mb-2 font-medium">API Base URL</div>
          <code className="rounded bg-slate-50 px-2 py-1">{baseURL}</code>
        </div>
        <p className="mt-4 text-sm text-slate-600">Change by setting <code>VITE_API_BASE_URL</code> in your <code>.env</code> (e.g., <code>http://localhost/api</code> behind nginx).</p>
      </div>
    </main>
  )
}
