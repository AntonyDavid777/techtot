'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Course } from '@/types'
import Link from 'next/link'

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadCourse()
  }, [params.id])

  const loadCourse = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getCourse(params.id) as any
      setCourse(response.data || response)
    } catch (err: any) {
      setError(err.message || 'Failed to load course')
      console.error('[v0] Error loading course:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    try {
      setActionLoading(true)
      await apiClient.publishCourse(params.id)
      loadCourse()
    } catch (err: any) {
      setError('Failed to publish course: ' + err.message)
      console.error('[v0] Error publishing course:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleArchive = async () => {
    try {
      setActionLoading(true)
      await apiClient.archiveCourse(params.id)
      loadCourse()
    } catch (err: any) {
      setError('Failed to archive course: ' + err.message)
      console.error('[v0] Error archiving course:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course?')) return
    
    try {
      setActionLoading(true)
      await apiClient.deleteCourse(params.id)
      router.push('/admin/courses')
    } catch (err: any) {
      setError('Failed to delete course: ' + err.message)
      console.error('[v0] Error deleting course:', err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading course details...</div>
  }

  if (!course) {
    return <div className="text-center py-8 text-red-500">Course not found</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/admin/courses" className="text-primary hover:text-primary/80 text-sm mb-2 inline-block">
            ← Back to Courses
          </Link>
          <h1 className="text-3xl font-bold">{course.title}</h1>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(course.status)}`}>
          {course.status}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="col-span-2 space-y-6">
          {/* Thumbnail */}
          {course.thumbnail_url && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-48 object-cover" />
            </div>
          )}

          {/* Description */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
          </div>

          {/* Lessons */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">Lessons ({course.lesson_ids?.length || 0})</h2>
            {course.lesson_ids && course.lesson_ids.length > 0 ? (
              <div className="space-y-2">
                {course.lesson_ids.map((lesson, index) => (
                  <div key={lesson} className="flex items-center justify-between p-3 bg-muted rounded">
                    <span className="font-medium">Lesson {index + 1}: {lesson}</span>
                    <Link
                      href={`/admin/courses/${params.id}/lessons/${lesson}`}
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No lessons added yet</p>
            )}
          </div>
        </div>

        {/* Right Column - Info & Actions */}
        <div className="space-y-6">
          {/* Course Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Course Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{course.category || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-medium capitalize">{course.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instructor ID</p>
                <p className="font-medium text-xs break-all">{course.instructor_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(course.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Updated</p>
                <p className="font-medium">{new Date(course.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/admin/courses/${params.id}/edit`}
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center font-medium text-sm"
              >
                Edit Course
              </Link>
              
              {course.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium text-sm"
                >
                  {actionLoading ? 'Publishing...' : 'Publish'}
                </button>
              )}
              
              {course.status === 'published' && (
                <button
                  onClick={handleArchive}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 font-medium text-sm"
                >
                  {actionLoading ? 'Archiving...' : 'Archive'}
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium text-sm"
              >
                {actionLoading ? 'Deleting...' : 'Delete Course'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
