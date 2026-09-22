'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  BookOpen, Mail, Lock, User, GraduationCap,
  Calendar, ArrowRight, Loader2, CheckCircle2, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [department, setDepartment] = useState('Computer Science & Engineering')
  const [year, setYear] = useState('1st Year')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            department,
            year,
            role: 'user',
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        // Ensure profile record is created/updated
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName.trim(),
          email: email.trim(),
          department,
          year,
          role: 'user',
          is_active: true,
        })

        toast.success('Account created successfully!')
        router.push('/user/dashboard')
      }
    } catch {
      toast.error('An unexpected error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: '#FBF7F2' }}>
      {/* Top Navigation Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#E9DED8] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A1F57] text-[#E8B52D] flex items-center justify-center font-bold shadow-md shadow-[#7A1F57]/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-[#7A1F57] leading-tight">
                Vichaara
              </div>
              <div className="text-[10px] font-bold text-[#75676C] uppercase tracking-wider">
                College Faculty Appointment System
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#75676C] hidden sm:inline">Already have an account?</span>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-[#E9DED8] hover:bg-[#F7EFE8] text-[#7A1F57] font-semibold text-xs rounded-xl h-10 px-5"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full max-w-6xl">
          
          {/* Left Column: Context & Value Props */}
          <div className="lg:col-span-5 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-xs font-bold border border-[#E8B52D]/30">
              <Shield className="w-3.5 h-3.5 text-[#7A1F57]" />
              <span>OFFICIAL STUDENT REGISTRATION</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#34252D] tracking-tight leading-[1.15]">
                Join the <span className="text-[#7A1F57]">campus</span> scheduling platform.
              </h1>
              <p className="text-base text-[#75676C] leading-relaxed">
                Create your student profile to browse verified faculty office hours, book appointments with no schedule friction, and track approvals seamlessly.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#34252D]">Instant Office Hour Access</h4>
                  <p className="text-xs text-[#75676C] mt-0.5">Direct access to published schedules across all departments.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#34252D]">Clear Status Notifications</h4>
                  <p className="text-xs text-[#75676C] mt-0.5">Receive prompt updates when requests are approved or scheduled.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F1DCE8] text-[#7A1F57] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#34252D]">Institutional Security</h4>
                  <p className="text-xs text-[#75676C] mt-0.5">Protected and authenticated college network access.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E9DED8] shadow-sm relative">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#34252D]">Create Account</h2>
                <p className="text-xs text-[#75676C] mt-1">
                  Fill in your details below to activate your student portal.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#34252D]">
                    Full Name <span className="text-[#B64242]">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ paddingLeft: '2.75rem' }}
                      className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-sm focus:border-[#7A1F57] focus:ring-[#7A1F57]/10"
                    />
                    <User className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* College Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#34252D]">
                    College Email <span className="text-[#B64242]">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="student@sode-edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ paddingLeft: '2.75rem' }}
                      className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-sm focus:border-[#7A1F57] focus:ring-[#7A1F57]/10"
                    />
                    <Mail className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Department & Year Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#34252D]">
                      Department
                    </label>
                    <div className="relative">
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{ paddingLeft: '2.75rem' }}
                        className="w-full h-11 rounded-xl border border-[#E9DED8] bg-[#FCF9F6] text-xs font-medium text-[#34252D] focus:outline-none focus:border-[#7A1F57] pr-4 appearance-none"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Eng</option>
                        <option value="Electronics & Communication">Electronics & Comm</option>
                        <option value="Information Science & Engineering">Information Science</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Civil Engineering">Civil Engineering</option>
                        <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                      </select>
                      <GraduationCap className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#34252D]">
                      Academic Year
                    </label>
                    <div className="relative">
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        style={{ paddingLeft: '2.75rem' }}
                        className="w-full h-11 rounded-xl border border-[#E9DED8] bg-[#FCF9F6] text-xs font-medium text-[#34252D] focus:outline-none focus:border-[#7A1F57] pr-4 appearance-none"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                      <Calendar className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#34252D]">
                      Password <span className="text-[#B64242]">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ paddingLeft: '2.75rem' }}
                        className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-sm focus:border-[#7A1F57] focus:ring-[#7A1F57]/10"
                      />
                      <Lock className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#34252D]">
                      Confirm Password <span className="text-[#B64242]">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ paddingLeft: '2.75rem' }}
                        className="h-11 rounded-xl border-[#E9DED8] bg-[#FCF9F6] text-sm focus:border-[#7A1F57] focus:ring-[#7A1F57]/10"
                      />
                      <Lock className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-sm shadow-md shadow-[#7A1F57]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-[#75676C]">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-[#7A1F57] hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-[#E9DED8] bg-white text-center text-xs text-[#75676C]">
        <div className="max-w-7xl mx-auto px-4">
          Vichaara — Official College Faculty Appointment Platform. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
