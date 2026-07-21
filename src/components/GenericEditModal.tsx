import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface GenericEditModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onSubmit: () => void
  children: React.ReactNode
  submitButtonText?: string
  cancelButtonText?: string
  isLoading?: boolean
  closeOnOverlayClick?: boolean
}

/**
 * Componente genérico para modais de edição/criação
 * Encapsula toda lógica comum (overflow handling, estrutura, botões)
 * Reduz ~50+ linhas por modal específico
 */
const GenericEditModal: React.FC<GenericEditModalProps> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  children,
  submitButtonText = 'Salvar',
  cancelButtonText = 'Cancelar',
  isLoading = false,
  closeOnOverlayClick = false,
}) => {
  // Bloquear scroll quando modal está aberto
  useEffect(() => {
    if (!isOpen) return

    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    // Fechar ao pressionar ESC
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="presentation"
    >
      <div 
        className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-4 md:p-8 relative max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {children}
        </div>

        {/* Footer - Botões */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <span className="animate-spin">⌛</span>}
            {submitButtonText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GenericEditModal
