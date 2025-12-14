'use client'

interface FormActionsProps {
  onCancel: () => void
  onDelete?: () => void
  isEditing?: boolean
  submitLabel?: string
  cancelLabel?: string
  deleteLabel?: string
}

/**
 * Shared action buttons for activity forms.
 * Provides Save, Cancel, and optionally Delete buttons.
 * 
 * Note: This component should be used inside a <form> element.
 * The Save button is type="submit" to trigger form submission.
 */
export function FormActions({ 
  onCancel, 
  onDelete,
  isEditing = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete'
}: FormActionsProps) {
  return (
    <div className="flex gap-2 pt-3">
      <button
        type="submit"
        className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
      >
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs font-medium"
      >
        {cancelLabel}
      </button>
      {isEditing && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-xs font-medium"
        >
          {deleteLabel}
        </button>
      )}
    </div>
  )
}
