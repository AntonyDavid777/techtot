'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { apiClient } from '@/lib/api-client'
import { UserRole } from '@/types'

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.courseId as string
  const { user, isAuthenticated, isLoading } = useAuth()
  
  const [course, setCourse] = useState<any>(null)
  const [isLoadingCourse, setIsLoadingCourse] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== UserRole.TEACHER) {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return
      
      try {
        const response = await apiClient.getCourse(courseId) as any
        const courseData = response?.data?.course || response?.data
        setCourse(courseData)
        setFormData({
          title: courseData.title || '',
          description: courseData.description || '',
          category: courseData.category || '',
          level: courseData.level || '',
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load course')
        console.error('[v0] Failed to load course:', err)
      } finally {
        setIsLoadingCourse(false)
      }
    }

    loadCourse()
  }, [courseId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      await apiClient.updateCourse(courseId, formData)
      setIsEditing(false)
      // Refresh course data
      const response = await apiClient.getCourse(courseId) as any
      const courseData = response?.data?.course || response?.data
      setCourse(courseData)
    } catch (err: any) {
      setError(err.message || 'Failed to save course')
    }
  }

  if (isLoading || isLoadingCourse) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated || user?.role !== UserRole.TEACHER || !course) {
    return null
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

        <Link
          href="/teach/my-courses"
          className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          My Courses
        </Link>
      </nav>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <Link
              href="/teach/my-courses"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to My Courses
            </Link>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-border bg-background p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{course.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.category} • {course.level}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Edit Course
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Course Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    >
                      <option value="web-development">Web Development</option>
                      <option value="mobile-development">Mobile Development</option>
                      <option value="data-science">Data Science</option>
                      <option value="machine-learning">Machine Learning</option>
                      <option value="cloud-computing">Cloud Computing</option>
                      <option value="devops">DevOps</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="level" className="block text-sm font-medium mb-2">
                      Level
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        title: course.title || '',
                        description: course.description || '',
                        category: course.category || '',
                        level: course.level || '',
                      })
                    }}
                    className="rounded-lg border border-border px-6 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-foreground">{course.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
