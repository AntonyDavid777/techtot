'use client'

import { useState } from 'react'

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<'users' | 'courses' | 'enrollments' | 'analytics'>('users')

  const reports = {
    users: [
      { id: 1, name: 'User Registration Report', description: 'Track new user registrations over time', icon: '📊' },
      { id: 2, name: 'User Activity Report', description: 'Monitor user login and activity patterns', icon: '📈' },
      { id: 3, name: 'User Retention Report', description: 'Analyze user retention and churn rates', icon: '📉' },
    ],
    courses: [
      { id: 1, name: 'Course Performance Report', description: 'Track course enrollment and completion rates', icon: '📚' },
      { id: 2, name: 'Course Content Report', description: 'View course statistics and lesson data', icon: '📝' },
      { id: 3, name: 'Course Rating Report', description: 'Analyze student ratings and reviews', icon: '⭐' },
    ],
    enrollments: [
      { id: 1, name: 'Enrollment Statistics', description: 'Overall enrollment trends and patterns', icon: '📋' },
      { id: 2, name: 'Dropout Report', description: 'Track students who dropped courses', icon: '📊' },
      { id: 3, name: 'Completion Report', description: 'Monitor course completion rates', icon: '✅' },
    ],
    analytics: [
      { id: 1, name: 'Platform Analytics', description: 'Overall platform health and metrics', icon: '📊' },
      { id: 2, name: 'Revenue Report', description: 'Financial performance and revenue tracking', icon: '💰' },
      { id: 3, name: 'System Performance', description: 'API uptime and performance metrics', icon: '⚙️' },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and view system reports</p>
      </div>

      {/* Report Type Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-8">
          {(['users', 'courses', 'enrollments', 'analytics'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-3 border-b-2 font-medium transition-colors capitalize ${
                reportType === type
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports[reportType].map((report) => (
          <div key={report.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">{report.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{report.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm font-medium">
                Generate
              </button>
              <button className="flex-1 px-4 py-2 border border-border rounded hover:bg-muted text-sm font-medium">
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Reports Generated</p>
          <p className="text-3xl font-bold">248</p>
          <p className="text-xs text-muted-foreground mt-2">This month</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Scheduled Reports</p>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs text-muted-foreground mt-2">Active schedules</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Exported Reports</p>
          <p className="text-3xl font-bold">156</p>
          <p className="text-xs text-muted-foreground mt-2">All time</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Report Storage</p>
          <p className="text-3xl font-bold">2.3GB</p>
          <p className="text-xs text-muted-foreground mt-2">Used</p>
        </div>
      </div>
    </div>
  )
}
