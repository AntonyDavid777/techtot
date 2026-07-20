'use client'

export default function AdminPermissionsPage() {
  const roles = [
    {
      name: 'Student',
      description: 'Can access courses and take assessments',
      permissions: [
        { name: 'View Courses', checked: true },
        { name: 'Enroll in Courses', checked: true },
        { name: 'Take Assessments', checked: true },
        { name: 'View Results', checked: true },
        { name: 'Edit Profile', checked: true },
      ],
    },
    {
      name: 'Teacher',
      description: 'Can create and manage courses',
      permissions: [
        { name: 'Create Courses', checked: true },
        { name: 'Manage Courses', checked: true },
        { name: 'View Student Progress', checked: true },
        { name: 'Grade Assessments', checked: true },
        { name: 'Manage Content', checked: true },
      ],
    },
    {
      name: 'Admin',
      description: 'Full system access',
      permissions: [
        { name: 'Manage Users', checked: true },
        { name: 'Manage Courses', checked: true },
        { name: 'View Reports', checked: true },
        { name: 'Manage Settings', checked: true },
        { name: 'System Administration', checked: true },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Permissions</h1>
        <p className="text-muted-foreground">Configure permissions for each user role</p>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <div key={role.name} className="bg-card border border-border rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{role.name}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {role.permissions.map((permission) => (
                <label key={permission.name} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permission.checked}
                    readOnly
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">{permission.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm font-medium">
                Edit
              </button>
              <button className="px-4 py-2 border border-border rounded hover:bg-muted text-sm font-medium">
                Reset
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
