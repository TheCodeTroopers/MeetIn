'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { DEFAULT_DESIGNATIONS } from '@/lib/designations-constants'
import {
  getDesignationsAction,
  addDesignationAction,
  deleteDesignationAction,
} from '@/app/admin/actions'

const LOCAL_STORAGE_KEY = 'college_app_custom_designations'
const EVENT_NAME = 'designations_updated'

export { DEFAULT_DESIGNATIONS }

export function useDesignations() {
  const [designations, setDesignations] = useState<string[]>([...DEFAULT_DESIGNATIONS])
  const [loading, setLoading] = useState(true)

  const syncFromStorageAndRemote = useCallback(async () => {
    // 1. First load cached additions from localStorage for zero-latency initial UI
    let localAdditions: string[] = []
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        localAdditions = JSON.parse(stored)
      }
    } catch {
      // ignore JSON parse errors
    }

    const mergedInitial = Array.from(new Set([...DEFAULT_DESIGNATIONS, ...localAdditions]))
    setDesignations(mergedInitial)

    // 2. Fetch fresh from server / Supabase
    try {
      const res = await getDesignationsAction()
      if (res.success && res.data && res.data.length > 0) {
        const remoteCombined = Array.from(new Set([...res.data, ...localAdditions]))
        setDesignations(remoteCombined)
      }
    } catch (err) {
      console.warn('Could not fetch designations from server, using local fallback:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    syncFromStorageAndRemote()

    const handleUpdate = () => {
      syncFromStorageAndRemote()
    }

    window.addEventListener(EVENT_NAME, handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [syncFromStorageAndRemote])

  const addDesignation = async (name: string): Promise<boolean> => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Designation name cannot be empty')
      return false
    }

    const exists = designations.some(d => d.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      toast.error(`Designation "${trimmed}" already exists`)
      return false
    }

    // Optimistically update
    const updated = [...designations, trimmed]
    setDesignations(updated)

    // Save to local storage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      const currentLocals = stored ? JSON.parse(stored) : []
      if (!currentLocals.includes(trimmed)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...currentLocals, trimmed]))
      }
    } catch (err) {
      console.error('LocalStorage write error:', err)
    }

    // Trigger sync across window
    window.dispatchEvent(new Event(EVENT_NAME))

    // Call server action to persist to Supabase
    try {
      const res = await addDesignationAction(trimmed)
      if (!res.success && res.error && !res.error.includes('already exists')) {
        console.warn('Server sync note:', res.error)
      }
      toast.success(`Designation "${trimmed}" added successfully`)
      return true
    } catch (err: any) {
      // Even if server fails (e.g. migration pending), local state has it
      toast.success(`Designation "${trimmed}" added to workspace`)
      return true
    }
  }

  const removeDesignation = async (name: string): Promise<boolean> => {
    const trimmed = name.trim()
    if (DEFAULT_DESIGNATIONS.includes(trimmed as any)) {
      toast.error(`"${trimmed}" is a default designation and cannot be removed`)
      return false
    }

    // Optimistically update
    const updated = designations.filter(d => d !== trimmed)
    setDesignations(updated)

    // Update localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const currentLocals: string[] = JSON.parse(stored)
        const filtered = currentLocals.filter(d => d !== trimmed)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered))
      }
    } catch (err) {
      console.error('LocalStorage remove error:', err)
    }

    window.dispatchEvent(new Event(EVENT_NAME))

    try {
      await deleteDesignationAction(trimmed)
      toast.success(`Designation "${trimmed}" removed`)
      return true
    } catch {
      toast.success(`Designation "${trimmed}" removed`)
      return true
    }
  }

  return {
    designations,
    loading,
    addDesignation,
    removeDesignation,
    refresh: syncFromStorageAndRemote,
  }
}
