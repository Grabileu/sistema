import React, { useEffect } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  title: string
  description: string
  itemName: string
  onConfirm: () => void
  onCancel: () => void
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  title,
  description,
  itemName,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">Esta ação não pode ser desfeita.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">{description}</p>
          <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-sm font-medium text-gray-900">{itemName}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Trash2 size={16} />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
