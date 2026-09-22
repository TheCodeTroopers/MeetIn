'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user'
          }
        }
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      toast.success('Account created successfully! Please sign in.')
      setAuthMode('signin')
      setLoading(false)
      return
    }

    // Sign in flow
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // RBAC: Fetch user profile to determine dashboard redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const destination =
      profile?.role === 'admin' ? '/admin/dashboard' :
      profile?.role === 'faculty' ? '/faculty/dashboard' :
      '/user/dashboard'

    toast.success('Signed in successfully!')
    router.push(destination)
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#FAF5EF] via-[#F8F2EC] to-[#F3EBE3] font-sans text-[#1b1c1a] p-4 sm:p-8 lg:p-12 selection:bg-[#701a28]/20 selection:text-[#701a28]">
      
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#701a28] text-[#e5a93c] flex items-center justify-center font-bold shadow-md shadow-[#701a28]/10 flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-serif text-[#701a28] tracking-tight leading-none">
              Vichaara
            </div>
            <div className="text-[10px] font-bold text-[#887272] tracking-wider uppercase mt-1">
              Faculty Appointment Platform • SMVITM
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#554243]">
          <Link href="/" className="hover:text-[#701a28] transition-colors">
            Home
          </Link>
          <a href="#faculty" className="hover:text-[#701a28] transition-colors">
            Faculty
          </a>
          <a href="#about" className="hover:text-[#701a28] transition-colors">
            About Vichaara
          </a>
          <Link href="/login">
            <button className="bg-[#701a28] hover:bg-[#520114] text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-sm cursor-pointer">
              Sign in
            </button>
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto my-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column Content */}
          <div className="lg:col-span-6 space-y-6 lg:pr-6 my-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#e5a93c]/50 text-[#701a28] text-xs font-semibold shadow-xs">
              <Shield className="w-3.5 h-3.5 text-[#e5a93c]" />
              <span className="uppercase tracking-wider text-[10px]">Private & Confidential</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold font-serif text-[#701a28] tracking-tight leading-tight">
              Sign in to your <span className="italic text-[#e5a93c]">Vichaara</span> space.
            </h1>

            <p className="text-sm sm:text-base text-[#554243] leading-relaxed max-w-lg font-normal">
              Your account is used only to book appointments and track your own sessions. Faculty members see only what you choose to share with them.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-[#554243]">
              <li className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5a93c] flex-shrink-0" />
                <span>Book appointments with any faculty member</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5a93c] flex-shrink-0" />
                <span>Track the status of your appointments — pending, approved, done</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e5a93c] flex-shrink-0" />
                <span>Your appointment notes are strictly private and secure</span>
              </li>
            </ul>
          </div>

          {/* Right Column Auth Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end w-full my-auto">
            <div className="bg-white border border-[#e4e2de] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl shadow-[#701a28]/10 flex flex-col gap-5 my-4 mx-auto">
              
              {/* Mode Switcher */}
              <div className="bg-[#F5EFE8] rounded-full p-1 flex text-xs font-semibold text-[#554243] border border-[#e4e2de]/40">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-2.5 rounded-full transition-all text-center cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-[#701a28] shadow-sm font-bold'
                      : 'hover:text-[#701a28]'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2.5 rounded-full transition-all text-center cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-[#701a28] shadow-sm font-bold'
                      : 'hover:text-[#701a28]'
                  }`}
                >
                  Create account
                </button>
              </div>

              {/* Google SSO Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-11 px-4 rounded-xl border border-[#e4e2de] bg-white hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-3 text-xs font-bold text-[#1b1c1a] shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Clean Horizontal Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e4e2de]"></div>
                </div>
                <div className="relative bg-white px-3 text-[10px] font-bold text-[#887272] uppercase tracking-widest">
                  OR WITH EMAIL
                </div>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleAuth} className="flex flex-col gap-4">
                
                {authMode === 'signup' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#554243]">
                      FULL NAME
                    </label>
                    <div className="relative w-full">
                      <BookOpen className="w-4 h-4 text-[#887272] absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{ paddingLeft: '2.75rem', paddingRight: '1rem' }}
                        className="w-full h-11 bg-[#FAF8F5] border border-[#e4e2de] rounded-xl text-xs font-medium text-[#1b1c1a] placeholder:text-[#887272] focus:outline-none focus:border-[#701a28] focus:bg-white focus:ring-2 focus:ring-[#701a28]/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#554243]">
                    COLLEGE EMAIL
                  </label>
                  <div className="relative w-full">
                    <Mail className="w-4 h-4 text-[#887272] absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="you@sode-edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      style={{ paddingLeft: '2.75rem', paddingRight: '1rem' }}
                      className="w-full h-11 bg-[#FAF8F5] border border-[#e4e2de] rounded-xl text-xs font-medium text-[#1b1c1a] placeholder:text-[#887272] focus:outline-none focus:border-[#701a28] focus:bg-white focus:ring-2 focus:ring-[#701a28]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#554243]">
                      PASSWORD
                    </label>
                  </div>
                  <div className="relative w-full">
                    <Lock className="w-4 h-4 text-[#887272] absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                      className="w-full h-11 bg-[#FAF8F5] border border-[#e4e2de] rounded-xl text-xs font-medium text-[#1b1c1a] placeholder:text-[#887272] focus:outline-none focus:border-[#701a28] focus:bg-white focus:ring-2 focus:ring-[#701a28]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887272] hover:text-[#701a28] transition-colors p-1 cursor-pointer z-10"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {authMode === 'signin' && (
                    <div className="text-right pt-0.5">
                      <a href="#" className="text-xs text-[#701a28] hover:underline font-semibold">
                        Forgot password?
                      </a>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-2 rounded-full bg-[#701a28] hover:bg-[#520114] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#701a28]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign in' : 'Create account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Card Footer Note */}
              <div className="text-center flex flex-col gap-2 pt-2 border-t border-[#f5efe8]">
                <p className="text-xs text-[#554243]">
                  {authMode === 'signin' ? 'New here? ' : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                    className="text-[#701a28] font-bold hover:underline cursor-pointer"
                  >
                    {authMode === 'signin' ? 'Create an account' : 'Sign in'}
                  </button>
                </p>

                <p className="text-[10px] text-[#887272] leading-relaxed max-w-xs mx-auto">
                  By continuing you agree that Vichaara will use your account only for appointment scheduling at SMVITM.{' '}
                  <a href="#" className="underline hover:text-[#701a28]">Learn more.</a>
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 text-center text-xs text-[#887272]">
        © {new Date().getFullYear()} Vichaara Platform • Shri Madhwa Vadiraja Institute of Technology & Management.
      </footer>

    </div>
  )
}
