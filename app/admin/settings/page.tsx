'use client'

import { useState } from 'react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platform_name: 'TechTots LMS',
    maintenance_mode: false,
    max_upload_size: 100,
    max_users: 10000,
    allow_registrations: true,
    require_email_verification: false,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">General</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Platform Name</label>
            <input
              type="text"
              value={settings.platform_name}
              onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Upload Size (MB)</label>
            <input
              type="number"
              value={settings.max_upload_size}
              onChange={(e) => setSettings({ ...settings, max_upload_size: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Active Users</label>
            <input
              type="number"
              value={settings.max_users}
              onChange={(e) => setSettings({ ...settings, max_users: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Features</h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="font-medium">Maintenance Mode</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.allow_registrations}
              onChange={(e) => setSettings({ ...settings, allow_registrations: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="font-medium">Allow New Registrations</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.require_email_verification}
              onChange={(e) => setSettings({ ...settings, require_email_verification: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="font-medium">Require Email Verification</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
            Save Settings
          </button>
          <button className="px-6 py-2 border border-border rounded-lg hover:bg-muted font-medium">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}
