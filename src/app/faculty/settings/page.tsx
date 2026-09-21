'use client'
export const dynamic = 'force-dynamic'

import { Card, CardContent } from '@/components/ui/card'

export default function FacultySettingsPage() {
  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <p>Faculty preferences (email notifications, default slot duration, etc.) go here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
