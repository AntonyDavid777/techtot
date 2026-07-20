'use client'

import { Course } from '@/types'
import Link from 'next/link'

interface CourseTableProps {
  courses: Course[]
  selectedCourses: Set<string>
  onSelectCourse: (courseId: string) => void
  onSelectAll: () => void
  onView?: (courseId: string) => void
  onEdit?: (courseId: string) => void
  onDelete?: (courseId: string) => void
  loading?: boolean
}

export default function CourseTable({
  courses,
  selectedCourses,
  onSelectCourse,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  loading = false,
}: CourseTableProps) {
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-50 text-blue-700'
      case 'intermediate':
        return 'bg-purple-50 text-purple-700'
      case 'advanced':
        return 'bg-red-50 text-red-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-border bg-muted">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium w-12">
              <input
                type="checkbox"
                checked={selectedCourses.size === courses.length && courses.length > 0}
                onChange={onSelectAll}
                className="w-4 h-4"
              />
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Category</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Level</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Lessons</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Created</th>
            <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {courses.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                No courses found
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr
                key={course._id}
                className={`hover:bg-muted/50 transition-colors ${selectedCourses.has(course._id) ? 'bg-blue-50' : ''}`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedCourses.has(course._id)}
                    onChange={() => onSelectCourse(course._id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium line-clamp-2">{course.title}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{course.category || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {course.lesson_ids?.length || 0}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(course.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex gap-2 justify-end">
                    {onView && (
                      <button
                        onClick={() => onView(course._id)}
                        disabled={loading}
                        className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                      >
                        View
                      </button>
                    )}
                    {onEdit && (
                      <Link
                        href={`/admin/courses/${course._id}/edit`}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(course._id)}
                        disabled={loading}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
