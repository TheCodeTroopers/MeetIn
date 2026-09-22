'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Search, Calendar, Clock, MapPin, CheckCircle2, ArrowRight, Shield, User, Filter, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppointmentStatus } from '@/components/ui/appointment-status'

interface FacultyMember {
  id: string
  name: string
  title: string
  department: string
  office: string
  slots: string[]
  status: 'available' | 'booked' | 'away'
}

const mockFaculty: FacultyMember[] = [
  {
    id: '1',
    name: 'Dr. Ananya Rao',
    title: 'Professor & Head of Department',
    department: 'Computer Science & Engg.',
    office: 'Academic Block B, Room 204',
    slots: ['10:00 AM – 10:20 AM', '10:40 AM – 11:00 AM', '02:30 PM – 02:50 PM'],
    status: 'available'
  },
  {
    id: '2',
    name: 'Dr. Vasudeva Rao',
    title: 'Professor',
    department: 'Artificial Intelligence & DS',
    office: 'Tech Tower, Room 302',
    slots: ['11:30 AM – 11:50 AM', '03:15 PM – 03:35 PM'],
    status: 'available'
  },
  {
    id: '3',
    name: 'Prof. Sowmya Bhat',
    title: 'Associate Professor',
    department: 'Electronics & Comm. Engg.',
    office: 'VLSI Lab, Room C-108',
    slots: ['01:30 PM – 01:50 PM', '04:00 PM – 04:20 PM'],
    status: 'available'
  },
  {
    id: '4',
    name: 'Dr. Sachin Bhat',
    title: 'Professor & Research Head',
    department: 'Mechanical Engineering',
    office: 'Mechatronics Wing, Room M-104',
    slots: ['Tomorrow, 10:00 AM – 10:20 AM'],
    status: 'away'
  },
  {
    id: '5',
    name: 'Dr. Raviprabha K.',
    title: 'Associate Professor',
    department: 'Civil Engineering',
    office: 'Civil Block, Room C-201',
    slots: ['02:00 PM – 02:20 PM', '03:30 PM – 03:50 PM'],
    status: 'available'
  },
  {
    id: '6',
    name: 'Dr. Deepika Shetty',
    title: 'Assistant Professor',
    department: 'Mathematics / Basic Sciences',
    office: 'Science Block, Room S-102',
    slots: ['11:00 AM – 11:20 AM', '02:15 PM – 02:35 PM'],
    status: 'available'
  }
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedFacultyModal, setSelectedFacultyModal] = useState<FacultyMember | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [reason, setReason] = useState('')
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  const departments = [
    'All',
    'Computer Science & Engg.',
    'Electronics & Comm. Engg.',
    'Artificial Intelligence & DS',
    'Mechanical Engineering',
    'Civil Engineering'
  ]

  const filteredFaculty = mockFaculty.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = selectedDept === 'All' || m.department === selectedDept
    return matchesSearch && matchesDept
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F2] font-sans text-[#34252D] selection:bg-[#F1DCE8] selection:text-[#7A1F57]">
      
      {/* Global Header (Section 7) */}
      <header className="bg-white border-b border-[#E9DED8] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#7A1F57] text-[#E8B52D] flex items-center justify-center font-bold shadow-md shadow-[#7A1F57]/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#7A1F57] tracking-tight block leading-tight">
                Vichaara
              </span>
              <span className="text-[10px] font-bold text-[#75676C] uppercase tracking-wider block">
                College Faculty Appointment System
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#75676C]">
            <Link href="/" className="hover:text-[#7A1F57] transition-colors">Home</Link>
            <a href="#faculty" className="hover:text-[#7A1F57] transition-colors">Faculty Directory</a>
            <a href="#how-it-works" className="hover:text-[#7A1F57] transition-colors">How It Works</a>
            <Link href="/login">
              <button className="bg-[#7A1F57] hover:bg-[#651744] text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-xs cursor-pointer">
                Sign In
              </button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center w-full">
      {/* Hero Section (Section 10) */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1BF] border border-[#E8B52D]/40 text-[#B7791F] text-xs font-bold shadow-xs">
            <Shield className="w-3.5 h-3.5 text-[#B7791F]" />
            <span className="uppercase tracking-wider text-[10px]">College Faculty Appointments</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#34252D] leading-[1.1]">
            Connect with your <span className="text-[#7A1F57] italic">faculty</span>, when it works for you.
          </h1>

          <p className="text-base sm:text-lg text-[#75676C] leading-relaxed max-w-xl mx-auto font-normal">
            Discover faculty availability, choose a suitable time slot, and manage your appointments through one simple college platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a href="#faculty">
              <button className="bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs px-6 py-3.5 rounded-full shadow-md shadow-[#7A1F57]/15 transition-all flex items-center gap-2 cursor-pointer">
                <span>Find Faculty</span>
                <ArrowRight className="w-4 h-4 text-[#E8B52D]" />
              </button>
            </a>
            <Link href="/login">
              <button className="bg-white hover:bg-[#F7EFE8] text-[#7A1F57] border border-[#E9DED8] font-bold text-xs px-6 py-3.5 rounded-full shadow-xs transition-all cursor-pointer">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Faculty Directory Section (Section 11) */}
      <section id="faculty" className="py-16 bg-[#F7EFE8]/50 border-t border-b border-[#E9DED8] w-full">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#7A1F57] tracking-tight">
                Faculty Directory
              </h2>
              <p className="text-xs text-[#75676C] mt-1">
                Find the right person for your consultation or project guidance.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    selectedDept === dept
                      ? 'bg-[#7A1F57] text-white shadow-xs'
                      : 'bg-white border border-[#E9DED8] text-[#75676C] hover:bg-[#FCF9F6]'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#9A8E91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search faculty by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white border-[#E9DED8] rounded-2xl text-xs font-medium focus:border-[#7A1F57]"
            />
          </div>

          {/* Faculty Card Grid (Section 11) */}
          {filteredFaculty.length === 0 ? (
            <div className="spec-card p-12 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-[#9A8E91] mx-auto" />
              <h3 className="text-base font-bold text-[#34252D]">No faculty found</h3>
              <p className="text-xs text-[#75676C]">Try changing your search term or department filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFaculty.map((member) => (
                <div
                  key={member.id}
                  className="spec-card p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#F1DCE8] text-[#7A1F57] font-bold flex items-center justify-center text-sm flex-shrink-0">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#34252D] leading-tight">
                          {member.name}
                        </h3>
                        <p className="text-xs font-bold text-[#7A1F57] mt-0.5">
                          {member.department}
                        </p>
                        <p className="text-[11px] text-[#75676C] mt-0.5">
                          {member.title}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E9DED8] space-y-1.5 text-xs text-[#75676C]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#7A1F57]" />
                        <span>{member.office}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#7A1F57]" />
                        <span className="font-semibold text-[#34252D]">Next: {member.slots[0]}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedFacultyModal(member)
                      setSelectedSlot(member.slots[0] || '')
                      setBookingConfirmed(false)
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
      </main>

      {/* Booking Modal (Section 13) */}
      {selectedFacultyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E9DED8] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-fade-in">
            
            <div className="flex items-start justify-between border-b border-[#E9DED8] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#7A1F57]">Confirm Appointment</h3>
                <p className="text-xs text-[#75676C]">Please review the details below.</p>
              </div>
              <button
                onClick={() => setSelectedFacultyModal(null)}
                className="text-[#75676C] hover:text-[#34252D] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E5F4EC] text-[#2E7D5B] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#34252D]">Appointment Requested</h4>
                <p className="text-xs text-[#75676C] max-w-xs mx-auto">
                  Your appointment with {selectedFacultyModal.name} for {selectedSlot} has been submitted.
                </p>
                <div className="pt-3">
                  <Link href="/login">
                    <button className="w-full py-3 rounded-full bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs shadow-xs cursor-pointer">
                      Sign In to Track Status
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#FCF9F6] p-4 rounded-2xl border border-[#E9DED8] space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-[#34252D]">Faculty: </span>
                    <span className="text-[#75676C]">{selectedFacultyModal.name} ({selectedFacultyModal.department})</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#34252D]">Chamber: </span>
                    <span className="text-[#75676C]">{selectedFacultyModal.office}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#34252D]">Available Slot: </span>
                    <span className="text-[#7A1F57] font-semibold">{selectedSlot}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#75676C] block">
                    REASON FOR APPOINTMENT
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g. Project guidance, lab clarification, or academic advising..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#E9DED8] rounded-2xl text-xs text-[#34252D] focus:outline-none focus:border-[#7A1F57] focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setSelectedFacultyModal(null)}
                    className="flex-1 py-3 rounded-full bg-white border border-[#E9DED8] text-[#75676C] font-bold text-xs hover:bg-[#F7EFE8] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="flex-1 py-3 rounded-full bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs shadow-md shadow-[#7A1F57]/15 cursor-pointer"
                  >
                    Confirm Appointment
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className="border-t border-[#E9DED8] bg-white py-8 text-center text-xs text-[#75676C]">
        <div className="max-w-7xl mx-auto px-6">
          © {new Date().getFullYear()} Vichaara • College Faculty Appointment System.
        </div>
      </footer>

    </div>
  )
}
