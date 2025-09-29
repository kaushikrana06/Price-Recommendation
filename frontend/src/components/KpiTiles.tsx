import { ReactNode } from 'react'

export function Kpi({ label, value, icon }: {label: string, value: ReactNode, icon?: ReactNode}){
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  )
}
