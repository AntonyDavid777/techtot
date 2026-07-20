'use client'

import { useState } from 'react'

export default function AdminMaintenancePage() {
  const [lastBackup, setLastBackup] = useState(new Date(Date.now() - 24 * 60 * 60 * 1000))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Maintenance</h1>
        <p className="text-muted-foreground">Manage system backups and maintenance tasks</p>
      </div>

      {/* Backup Management */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Database Backups</h2>
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Last Backup:</span> {lastBackup.toLocaleString()}</p>
          <p><span className="text-muted-foreground">Backup Size:</span> 2.3 GB</p>
          <p><span className="text-muted-foreground">Status:</span> <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Healthy</span></p>
        </div>
        <div className="flex gap-2 pt-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium">
            Create Backup Now
          </button>
          <button className="px-4 py-2 border border-border rounded hover:bg-muted font-medium">
            Restore Backup
          </button>
          <button className="px-4 py-2 border border-border rounded hover:bg-muted font-medium">
            View History
          </button>
        </div>
      </div>

      {/* Cache Management */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Cache Management</h2>
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Cache Size:</span> 542 MB</p>
          <p><span className="text-muted-foreground">Items Cached:</span> 12,450</p>
          <p><span className="text-muted-foreground">Hit Rate:</span> 94.2%</p>
        </div>
        <div className="flex gap-2 pt-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium">
            Clear Cache
          </button>
          <button className="px-4 py-2 border border-border rounded hover:bg-muted font-medium">
            View Cache Details
          </button>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">System Logs</h2>
        <div className="bg-muted p-4 rounded font-mono text-xs text-muted-foreground h-48 overflow-y-auto">
          <div>[2024-01-15 10:30:45] INFO - User login: admin@techtots.com</div>
          <div>[2024-01-15 10:31:12] INFO - Course published: React Basics</div>
          <div>[2024-01-15 10:32:01] INFO - Student enrolled in course</div>
          <div>[2024-01-15 10:33:45] WARNING - Database query slow: 2.3s</div>
          <div>[2024-01-15 10:34:00] INFO - Cache cleared</div>
        </div>
        <button className="px-4 py-2 border border-border rounded hover:bg-muted font-medium">
          Download Logs
        </button>
      </div>

      {/* Scheduled Tasks */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Scheduled Tasks</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-2 border border-border rounded">
            <span>Daily Backup</span>
            <span className="text-xs text-muted-foreground">Daily at 2:00 AM</span>
          </div>
          <div className="flex items-center justify-between p-2 border border-border rounded">
            <span>Cache Refresh</span>
            <span className="text-xs text-muted-foreground">Every 4 hours</span>
          </div>
          <div className="flex items-center justify-between p-2 border border-border rounded">
            <span>Log Cleanup</span>
            <span className="text-xs text-muted-foreground">Weekly on Sunday 3:00 AM</span>
          </div>
        </div>
      </div>
    </div>
  )
}
