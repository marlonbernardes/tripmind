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
 * 
 * The component is designed to be sticky at the bottom of the form
 * container to always remain visible regardless of scroll position.
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
    <div className="sticky bottom-0 left-0 right-0 pt-3 pb-1 mt-4 -mx-4 px-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-medium shadow-sm"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          {cancelLabel}
        </button>
        {isEditing && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          >
            {deleteLabel}
          </button>
        )}
      </div>
    </div>
  )
}
