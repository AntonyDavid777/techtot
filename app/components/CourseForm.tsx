'use client'

import { useState } from 'react'
import { Course } from '@/types'

interface CourseFormProps {
  course?: Course
  onSubmit: (data: Partial<Course>) => Promise<void>
  loading?: boolean
  errors?: Record<string, string>
}

export default function CourseForm({ course, onSubmit, loading = false, errors = {} }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    category: course?.category || '',
    level: course?.level || 'beginner',
    thumbnail_url: course?.thumbnail_url || '',
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters'
    }

    if (formData.category && formData.category.length > 50) {
      newErrors.category = 'Category must be less than 50 characters'
    }

    if (formData.level && !['beginner', 'intermediate', 'advanced'].includes(formData.level)) {
      newErrors.level = 'Invalid level selected'
    }

    if (formData.thumbnail_url && !isValidUrl(formData.thumbnail_url)) {
      newErrors.thumbnail_url = 'Invalid URL format'
    }

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear validation error when user starts editing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      console.error('[v0] Form submission error:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Course Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Introduction to Web Development"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            validationErrors.title || errors.title ? 'border-red-500' : 'border-border'
          }`}
        />
        {(validationErrors.title || errors.title) && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.title || errors.title}</p>
        )}
        <p className="text-muted-foreground text-xs mt-1">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Provide a detailed description of your course..."
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
            validationErrors.description || errors.description ? 'border-red-500' : 'border-border'
          }`}
        />
        {(validationErrors.description || errors.description) && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.description || errors.description}</p>
        )}
        <p className="text-muted-foreground text-xs mt-1">
          {formData.description.length}/1000 characters
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Web Development, Design"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            validationErrors.category || errors.category ? 'border-red-500' : 'border-border'
          }`}
        />
        {(validationErrors.category || errors.category) && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.category || errors.category}</p>
        )}
      </div>

      {/* Level */}
      <div>
        <label className="block text-sm font-medium mb-2">Level</label>
        <select
          name="level"
          value={formData.level}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            validationErrors.level || errors.level ? 'border-red-500' : 'border-border'
          }`}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        {(validationErrors.level || errors.level) && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.level || errors.level}</p>
        )}
      </div>

      {/* Thumbnail URL */}
      <div>
        <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
        <input
          type="text"
          name="thumbnail_url"
          value={formData.thumbnail_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            validationErrors.thumbnail_url || errors.thumbnail_url ? 'border-red-500' : 'border-border'
          }`}
        />
        {(validationErrors.thumbnail_url || errors.thumbnail_url) && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.thumbnail_url || errors.thumbnail_url}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving...' : 'Save Course'}
        </button>
      </div>
    </form>
  )
}
