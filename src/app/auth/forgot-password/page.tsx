'use client'
// src/app/auth/forgot-password/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Store, ArrowLeft, CheckCircle2 } from 'lucide-react'

type Step = 'email' | 'otp' | 'newpass' | 'done'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendOTP() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      setStep('otp')
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  async function verifyOTP() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: 'password_reset' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid OTP'); return }
      setStep('newpass')
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  async function resetPassword() {
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      setStep('done')
      setTimeout(() => router.push('/auth/login'), 2000)
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  const titles: Record<Step, string> = {
    email: 'Reset your password',
    otp: 'Check your email',
    newpass: 'Create new password',
    done: 'Password reset!',
  }
  const subtitles: Record<Step, string> = {
    email: 'Enter your email and we\'ll send you a 6-digit code.',
    otp: `We sent a 6-digit code to ${email}`,
    newpass: 'Enter your new password below.',
    done: 'Redirecting you to login…',
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-900/15 rounded-full blur-[100px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-700 text-white">Sample Website</span>
          </Link>
          <h1 className="font-display text-3xl font-800 text-white">{titles[step]}</h1>
          <p className="text-white/40 mt-2 text-sm">{subtitles[step]}</p>
        </div>

        <div className="glass rounded-2xl border border-white/8 p-8">
          {error && <div className="bg-red-900/20 border border-red-700/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

          {step === 'done' ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-14 h-14 text-brand-500 mx-auto mb-3" />
              <p className="text-white/60 text-sm">Your password has been updated successfully.</p>
            </div>
          ) : step === 'email' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/60 transition-all text-sm" />
              </div>
              <button onClick={sendOTP} disabled={loading || !email} className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send reset code'}
              </button>
            </div>
          ) : step === 'otp' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">6-digit OTP</label>
                <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" maxLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/60 transition-all text-sm font-mono tracking-[0.5em] text-center text-xl" />
              </div>
              <button onClick={verifyOTP} disabled={loading || otp.length !== 6} className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</> : 'Verify code'}
              </button>
              <button onClick={sendOTP} className="w-full text-white/40 hover:text-white/70 text-sm transition-colors">Resend code</button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">New password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-brand-600/60 transition-all text-sm" />
              </div>
              <button onClick={resetPassword} disabled={loading} className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Set new password'}
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-sm transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
