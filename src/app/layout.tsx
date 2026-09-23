import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Vichaara — College Appointment System',
  description:
    'Book appointments with faculty members easily. Manage availability, slots, and appointments — all in one place.',
  keywords: ['college', 'appointment', 'faculty', 'schedule', 'booking'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: 'hsl(220, 18%, 11%)',
                border: '1px solid hsl(220, 15%, 18%)',
                color: 'hsl(220, 15%, 95%)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
