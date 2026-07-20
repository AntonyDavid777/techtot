'use client'

import { useState } from 'react'
import { User } from '@/types'

interface UserFormProps {
  user?: User
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
  isCreating?: boolean
}

export function UserForm({ user, onSubmit, loading = false, isCreating = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    role: user?.role || 'student',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (isCreating || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter'
      } else if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter'
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    const submitData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    }

    if (formData.password) {
      Object.assign(submitData, { password: formData.password })
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.name ? 'border-red-500' : 'border-border'
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            disabled={!isCreating}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted ${
              errors.email ? 'border-red-500' : 'border-border'
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-2">Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {isCreating ? 'Password *' : 'New Password (leave blank to keep current)'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isCreating ? 'At least 8 characters' : 'Leave blank to keep current'}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10 ${
                errors.password ? 'border-red-500' : 'border-border'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          {formData.password && (
            <p className="text-xs text-muted-foreground mt-1">
              Password strength: Must contain uppercase, lowercase, and numbers
            </p>
          )}
        </div>

        {/* Confirm Password */}
        {(isCreating || formData.password) && (
          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.confirmPassword ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Processing...' : isCreating ? 'Create User' : 'Update User'}
        </button>
      </div>
    </form>
  )
}
