'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChangePasswordForm } from '@/components/ui/change-password-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, Plus, Trash2, ShieldCheck, Database, Copy, Check, Sparkles, Loader2 } from 'lucide-react'
import { useDesignations } from '@/hooks/use-designations'
import { DEFAULT_DESIGNATIONS } from '@/lib/designations-constants'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const { designations, loading, addDesignation, removeDesignation } = useDesignations()
  const [newDesignation, setNewDesignation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newDesignation.trim()
    if (!trimmed) return

    setSubmitting(true)
    const success = await addDesignation(trimmed)
    setSubmitting(false)

    if (success) {
      setNewDesignation('')
    }
  }

  const sqlMigrationCode = `-- Run this in your Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS designations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO designations (name) VALUES 
  ('Principal'),
  ('Dean R&D'),
  ('Dean Academics')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE designations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read designations" ON designations FOR SELECT USING (true);

CREATE POLICY "Allow admin manage designations" ON designations FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));`

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigrationCode)
    setCopiedSql(true)
    toast.success('SQL migration copied to clipboard!')
    setTimeout(() => setCopiedSql(false), 2000)
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[11px] font-bold border border-[#E8B52D]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#7A1F57]" />
            <span>SYSTEM CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#34252D] tracking-tight">
            Portal Settings & Designations
          </h1>
          <p className="text-xs sm:text-sm text-[#75676C]">
            Configure designations, administrator access, and appointment scheduling parameters.
          </p>
        </div>
      </div>

      {/* Designation Management Card */}
      <Card className="rounded-3xl border-[#E9DED8] shadow-xs overflow-hidden bg-white">
        <CardHeader className="p-6 sm:p-8 border-b border-[#F2ECE6]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1BF] flex items-center justify-center text-[#7A1F57] shadow-xs">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[#34252D]">
                  Faculty Designations
                </CardTitle>
                <CardDescription className="text-xs text-[#75676C] mt-0.5">
                  Designations available for selection when registering faculty members.
                </CardDescription>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#F7EFE8] text-[#7A1F57] text-xs font-bold">
              {designations.length} Active {designations.length === 1 ? 'Designation' : 'Designations'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Add Designation Form */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="text-xs font-bold text-[#34252D]">Add New Designation</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Input
                value={newDesignation}
                onChange={e => setNewDesignation(e.target.value)}
                placeholder="e.g. Vice Principal, Dean Student Affairs, Registrar..."
                className="h-11 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs focus:border-[#7A1F57] flex-1"
                disabled={submitting}
              />
              <Button
                type="submit"
                disabled={submitting || !newDesignation.trim()}
                className="h-11 px-6 rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Designation</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Current Designations List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#75676C] uppercase tracking-wider">
              Currently Available Designations
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-[#7A1F57]">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {designations.map(desig => {
                  const isCore = DEFAULT_DESIGNATIONS.includes(desig as any)
                  return (
                    <div
                      key={desig}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E9DED8] bg-[#FCF9F6] hover:bg-white hover:border-[#7A1F57]/40 transition-all shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#34252D]">
                          {desig}
                        </div>
                        {isCore ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF1BF] text-[#7A1F57] text-[10px] font-bold border border-[#E8B52D]/30">
                            <ShieldCheck className="w-3 h-3" />
                            Default
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-[#EBF3FB] text-[#1E5D88] text-[10px] font-bold">
                            Custom Added
                          </span>
                        )}
                      </div>

                      {!isCore && (
                        <button
                          type="button"
                          onClick={() => removeDesignation(desig)}
                          className="p-2 rounded-xl text-[#9A8E91] hover:text-[#B64242] hover:bg-[#FBE8E8] transition-colors cursor-pointer"
                          title={`Remove "${desig}"`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Supabase Migration Helper Callout */}
          <div className="p-5 rounded-2xl bg-[#F7EFE8]/70 border border-[#E9DED8] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#7A1F57]" />
                <span className="text-xs font-bold text-[#34252D]">
                  Database Synchronization (Supabase)
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopySql}
                className="h-8 px-3 rounded-xl border-[#E9DED8] text-[11px] font-bold text-[#7A1F57] bg-white hover:bg-[#F2ECE6] flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2E7D5B]" />
                    <span className="text-[#2E7D5B]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL Migration</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-[11px] text-[#75676C] leading-relaxed">
              Designations function seamlessly right now in the app. To also persist them in your PostgreSQL database tables, run the migration in <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[10px] text-[#7A1F57]">supabase/migrations/002_create_designations.sql</code> or copy the SQL above into your Supabase Dashboard SQL editor.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <ChangePasswordForm />
    </div>
  )
}
