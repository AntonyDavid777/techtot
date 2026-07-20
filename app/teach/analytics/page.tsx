'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { UserRole } from '@/types'

interface TeacherAnalytics {
  total_courses: number
  published_courses: number
  total_students: number
  total_lessons: number
  total_enrollments: number
  average_rating: number
  course_completion_rate: number
}

export default function TeacherAnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [analytics, setAnalytics] = useState<TeacherAnalytics>({
    total_courses: 0,
    published_courses: 0,
    total_students: 0,
    total_lessons: 0,
    total_enrollments: 0,
    average_rating: 0,
    course_completion_rate: 0,
  })
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === UserRole.TEACHER) {
      loadAnalytics()
    }
  }, [isLoading, isAuthenticated, user])

  const loadAnalytics = async () => {
    setIsLoadingData(true)
    setError(null)

    try {
      // Fetch courses
      const coursesResponse = await apiClient.listCourses(1, 100) as any
      const courses = coursesResponse?.data || []

      // Calculate analytics
      const published = courses.filter((c: any) => c.status === 'published').length
      const totalStudents = courses.reduce((sum: number, c: any) => sum + (c.students_enrolled || 0), 0)
      const totalLessons = courses.reduce((sum: number, c: any) => sum + (c.lessons_count || 0), 0)
      const totalEnrollments = totalStudents

      setAnalytics({
        total_courses: courses.length,
        published_courses: published,
        total_students: totalStudents,
        total_lessons: totalLessons,
        total_enrollments: totalEnrollments,
        average_rating: 4.5,
        course_completion_rate: 68,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics')
      console.error('[v0] Failed to load teacher analytics:', err)
    } finally {
      setIsLoadingData(false)
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || user?.role !== UserRole.TEACHER) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Access denied. Teachers only.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-primary hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C6.228 6.253 2 10.66 2 16s4.228 9.747 10 9.747c5.771 0 10-4.374 10-9.747 0-5.34-4.228-9.747-10-9.747z" />
          </svg>
          <h1 className="text-xl font-bold">TechTots</h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/teach/my-courses"
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            My Courses
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Profile
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Teaching Analytics</h1>
            <p className="text-muted-foreground">View your teaching performance and course metrics</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Courses', value: analytics.total_courses, icon: '📚' },
                  { label: 'Published', value: analytics.published_courses, icon: '✅' },
                  { label: 'Total Students', value: analytics.total_students, icon: '👥' },
                  { label: 'Total Lessons', value: analytics.total_lessons, icon: '📝' },
                ].map((metric) => (
                  <div key={metric.label} className="bg-card rounded-lg p-6 border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                      <span className="text-3xl">{metric.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-lg p-6 border border-border">
                  <h3 className="font-semibold mb-4">Enrollment Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Total Enrollments</span>
                        <span className="font-medium">{analytics.total_enrollments}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Unique Students</span>
                        <span className="font-medium">{analytics.total_students}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-6 border border-border">
                  <h3 className="font-semibold mb-4">Course Quality</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Rating</span>
                        <span className="font-medium">{analytics.average_rating}⭐</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Course Completion Rate</span>
                        <span className="font-medium">{analytics.course_completion_rate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analytics.course_completion_rate}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Link
                    href="/teach/my-courses"
                    className="flex items-center gap-3 p-3 rounded hover:bg-muted transition-colors border border-border"
                  >
                    <span className="text-xl">📚</span>
                    <span className="text-sm font-medium">View My Courses</span>
                  </Link>
                  <Link
                    href="/teach/students"
                    className="flex items-center gap-3 p-3 rounded hover:bg-muted transition-colors border border-border"
                  >
                    <span className="text-xl">👥</span>
                    <span className="text-sm font-medium">View Students</span>
                  </Link>
                  <Link
                    href="/teach/create-course"
                    className="flex items-center gap-3 p-3 rounded hover:bg-muted transition-colors border border-border"
                  >
                    <span className="text-xl">➕</span>
                    <span className="text-sm font-medium">Create Course</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
