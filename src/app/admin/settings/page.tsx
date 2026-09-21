'use client'
export const dynamic = 'force-dynamic'

import { Card, CardContent } from '@/components/ui/card'

export default function AdminSettingsPage() {
  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <p>System settings configuration goes here. (Global booking limits, notification toggles, etc.)</p>
        </CardContent>
      </Card>
    </div>
  )
}
