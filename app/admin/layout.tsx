'use client'

import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">System Management</p>
        </div>
        
        <nav className="space-y-6 px-3">
          {/* Main Navigation */}
          <div className="space-y-1">
            <Link
              href="/admin/dashboard"
              className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
            >
              Users
            </Link>
            <Link
              href="/admin/courses"
              className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
            >
              Courses
            </Link>
          </div>

          {/* Academic Management Section */}
          <div className="border-t border-border pt-4">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Academic Management
            </p>
            <div className="space-y-1">
              <Link
                href="/admin/academic/overview"
                className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/admin/academic/teacher-assignment"
                className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
              >
                Teacher Assignment
              </Link>
              <Link
                href="/admin/academic/enrollment"
                className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
              >
                Student Enrollment
              </Link>
            </div>
          </div>

          {/* System Management Section */}
          <div className="border-t border-border pt-4">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              System Management
            </p>
            <div className="space-y-1">
              <Link
                href="/admin/reports"
                className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
              >
                Reports
              </Link>
              <Link
                href="/admin/settings"
                className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
              >
                Settings
              </Link>
              <Link
                href="/admin/permissions"
                className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
              >
                Permissions
              </Link>
              <Link
                href="/admin/maintenance"
                className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
              >
                Maintenance
              </Link>
              <Link
                href="/admin/reviews"
                className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
              >
                Reviews
              </Link>
              <Link
                href="/admin/banned"
                className="block px-4 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
              >
                Banned Users
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
