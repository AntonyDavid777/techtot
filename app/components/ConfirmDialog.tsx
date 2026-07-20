'use client'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium disabled:opacity-50 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
