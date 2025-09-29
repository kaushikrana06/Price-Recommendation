import { Link, NavLink, useLocation } from 'react-router-dom'
import RoutesView from './routes'
import { useEffect, useState } from 'react'
import { api } from './lib/api'

function TopNav() {
  const location = useLocation()
  const [healthy, setHealthy] = useState<'ok'|'down'|'checking'>('checking')
  useEffect(() => {
    let active = true
    api.get('/health/').then(() => active && setHealthy('ok')).catch(()=> active && setHealthy('down'))
    return () => { active = false }
  }, [location.pathname])
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-md" />
          <div className="font-semibold text-lg tracking-tight">Pricing Intel</div>
        </Link>
        <nav className="ml-auto flex items-center gap-6 text-sm">
          <NavLink to="/" end className={({isActive})=> isActive? 'text-brand-600 font-medium' : 'text-slate-600 hover:text-slate-900'}>Dashboard</NavLink>
          <NavLink to="/compare" className={({isActive})=> isActive? 'text-brand-600 font-medium' : 'text-slate-600 hover:text-slate-900'}>Compare</NavLink>
          <NavLink to="/doc" className={({isActive})=> isActive? 'text-brand-600 font-medium' : 'text-slate-600 hover:text-slate-900'}>Doc</NavLink>
          <span className={"inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium " + (healthy==='ok'?'bg-emerald-50 text-emerald-700':'bg-rose-50 text-rose-700')}>
            <span className={"h-2 w-2 rounded-full " + (healthy==='ok'?'bg-emerald-500':'bg-rose-500')}></span>
            {healthy==='checking'?'Checking API…': healthy==='ok'? 'API healthy' : 'API error'}
          </span>
        </nav>
      </div>
    </header>
  )
}

export default function App(){
  return (
    <div className="min-h-screen">
      <TopNav />
      <RoutesView />
    </div>
  )
}
