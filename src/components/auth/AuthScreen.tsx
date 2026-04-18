import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { login, register } from '../../api/auth'
import { FileText, AlertCircle } from 'lucide-react'

interface Props { onAuth: () => void }

export default function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')

  const extractError = (err: any): string => {
    const detail = err?.response?.data?.detail
    if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(' · ')
    if (typeof detail === 'string') return detail
    return err?.message ?? 'Something went wrong.'
  }

  const loginMut = useMutation({
    mutationFn: () => login({ username: form.username, password: form.password }),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token)
      onAuth()
    },
    onError: (err) => setError(extractError(err)),
  })

  const registerMut = useMutation({
    mutationFn: () => register({ username: form.username, email: form.email, password: form.password }),
    onSuccess: () => {
      setMode('login')
      setError('')
      setForm((f) => ({ ...f, password: '' }))
    },
    onError: (err) => setError(extractError(err)),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (mode === 'login') loginMut.mutate()
    else registerMut.mutate()
  }

  const busy = loginMut.isPending || registerMut.isPending

  return (
    <div className="w-screen h-screen flex items-center justify-center" style={{ background: '#e8dcc8' }}>
      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\' opacity=\'0.1\'/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: '#5c3d11', boxShadow: '0 4px 16px rgba(92,61,17,0.35)' }}>
            <FileText size={32} color="#f5e6c8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#2c1a06' }}>DocFlow</h1>
          <p className="text-sm mt-1" style={{ color: '#7a6548' }}>Document Management</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 window-shadow"
          style={{ background: 'rgba(255,250,242,0.92)', border: '1px solid rgba(92,61,17,0.15)' }}>

          {/* Tab toggle */}
          <div className="flex rounded-lg mb-5 p-1" style={{ background: '#e8dcc8' }}>
            {(['login', 'register'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-1.5 rounded-md text-sm font-medium transition-all capitalize"
                style={{
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#2c1a06' : '#7a6548',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              required
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{ background: '#f5ede0', border: '1.5px solid #d4c4a8', color: '#2c1a06' }}
              onFocus={(e) => e.target.style.borderColor = '#8b6914'}
              onBlur={(e) => e.target.style.borderColor = '#d4c4a8'}
            />
            {mode === 'register' && (
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{ background: '#f5ede0', border: '1.5px solid #d4c4a8', color: '#2c1a06' }}
                onFocus={(e) => e.target.style.borderColor = '#8b6914'}
                onBlur={(e) => e.target.style.borderColor = '#d4c4a8'}
              />
            )}
            <input
              required
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{ background: '#f5ede0', border: '1.5px solid #d4c4a8', color: '#2c1a06' }}
              onFocus={(e) => e.target.style.borderColor = '#8b6914'}
              onBlur={(e) => e.target.style.borderColor = '#d4c4a8'}
            />

            {error && (
              <div className="flex items-center gap-2 text-sm rounded-lg px-3 py-2"
                style={{ background: '#fde8e8', color: '#c0392b' }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button type="submit" disabled={busy}
              className="w-full py-2.5 rounded-lg text-sm font-semibold mt-1 transition-all"
              style={{
                background: busy ? '#b8966a' : '#5c3d11',
                color: '#f5e6c8',
                cursor: busy ? 'not-allowed' : 'pointer',
              }}>
              {busy ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
