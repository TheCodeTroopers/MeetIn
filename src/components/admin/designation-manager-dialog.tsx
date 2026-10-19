'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, ShieldCheck, Tag, Loader2 } from 'lucide-react'
import { useDesignations } from '@/hooks/use-designations'
import { DEFAULT_DESIGNATIONS } from '@/lib/designations-constants'

interface DesignationManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDesignationAdded?: (newDesignation: string) => void
}

export function DesignationManagerDialog({
  open,
  onOpenChange,
  onDesignationAdded,
}: DesignationManagerDialogProps) {
  const { designations, loading, addDesignation, removeDesignation } = useDesignations()
  const [newDesignationName, setNewDesignationName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newDesignationName.trim()
    if (!trimmed) return

    setSubmitting(true)
    const success = await addDesignation(trimmed)
    setSubmitting(false)

    if (success) {
      setNewDesignationName('')
      if (onDesignationAdded) {
        onDesignationAdded(trimmed)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-[#E9DED8] p-6 shadow-xl">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full bg-[#FFF1BF] text-[#7A1F57] text-[10px] font-bold border border-[#E8B52D]/40">
            <Tag className="w-3 h-3 text-[#7A1F57]" />
            <span>ROLE CONFIGURATION</span>
          </div>
          <DialogTitle className="text-xl font-bold text-[#34252D]">
            Manage Designations
          </DialogTitle>
          <DialogDescription className="text-xs text-[#75676C]">
            Configure and expand faculty designations available for assignment and filtering across the college portal.
          </DialogDescription>
        </DialogHeader>

        {/* Add New Designation Form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2 pt-2">
          <Input
            value={newDesignationName}
            onChange={e => setNewDesignationName(e.target.value)}
            placeholder="E.g. Vice Principal, Dean Student Affairs..."
            className="h-10 rounded-xl bg-[#FCF9F6] border-[#E9DED8] text-xs focus:border-[#7A1F57]"
            disabled={submitting}
          />
          <Button
            type="submit"
            disabled={submitting || !newDesignationName.trim()}
            className="h-10 px-4 rounded-xl bg-[#7A1F57] hover:bg-[#651744] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </Button>
        </form>

        {/* Designation List */}
        <div className="space-y-2 pt-2 max-h-64 overflow-y-auto pr-1">
          <div className="text-[11px] font-bold text-[#75676C] uppercase tracking-wider">
            Active Designations ({designations.length})
          </div>

          {loading ? (
            <div className="py-6 flex justify-center text-[#7A1F57]">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-[#F2ECE6] border border-[#E9DED8] rounded-2xl overflow-hidden bg-[#FAF7F4]/40">
              {designations.map(desig => {
                const isCore = DEFAULT_DESIGNATIONS.includes(desig as any)
                return (
                  <div
                    key={desig}
                    className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#34252D]">
                        {desig}
                      </span>
                      {isCore ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF1BF] text-[#7A1F57] text-[9px] font-bold border border-[#E8B52D]/30">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Default
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-[#EBF3FB] text-[#1E5D88] text-[9px] font-bold">
                          Custom
                        </span>
                      )}
                    </div>

                    {!isCore && (
                      <button
                        type="button"
                        onClick={() => removeDesignation(desig)}
                        className="p-1.5 rounded-lg text-[#9A8E91] hover:text-[#B64242] hover:bg-[#FBE8E8] transition-colors cursor-pointer"
                        title={`Remove "${desig}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full h-10 rounded-xl border-[#E9DED8] text-xs font-semibold text-[#75676C] hover:bg-[#F7EFE8]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
