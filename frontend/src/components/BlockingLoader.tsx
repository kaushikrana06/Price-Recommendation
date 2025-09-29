import React from 'react'

export default function BlockingLoader({text="AI is predicting…"}:{
  text?: string
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/15 backdrop-blur-[1px] flex items-center justify-center">
      <div className="rounded-2xl bg-white shadow-xl px-6 py-5 flex items-center gap-3">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <span className="text-sm text-slate-700">{text}</span>
      </div>
    </div>
  )
}
