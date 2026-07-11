import React, { useState } from 'react'
import { maskCelular, maskTelefone, maskWhatsapp } from '../utils/masks'
import GenericEditModal from './GenericEditModal'

interface EditarContatoModalProps {
  open: boolean
  values: {
    email: string
    emailAlternativo: string
    celular: string
    whatsapp: string
    telefone: string
    telefoneAlternativo: string
    linkedin: string
  }
  onChange: (field: string, value: string) => void
  onClose: () => void
  onSubmit: () => void
}

const EditarContatoModal: React.FC<EditarContatoModalProps> = ({ open, values, onChange, onClose, onSubmit }) => {
  const [touched, setTouched] = useState(false)

  const handleSubmit = () => {
    setTouched(true)
    if (!values.email) return
    onSubmit()
  }

  return (
    <GenericEditModal
      isOpen={open}
      title="Editar dados do funcionário"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitButtonText="Salvar alterações"
    >
      <div className="space-y-4">
        <div className="mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900">Contato</h3>
          <p className="mt-1 text-xs text-slate-500">Atualize os canais principais de comunicação.</p>
        </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1 font-medium">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              value={values.email}
              onChange={e => onChange('email', e.target.value)}
              placeholder="Digite"
            />
            {touched && !values.email && (
              <span className="text-xs text-red-500 mt-1 block">Campo obrigatório</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1 font-medium">E-mail alternativo</label>
            <input
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              value={values.emailAlternativo}
              onChange={e => onChange('emailAlternativo', e.target.value)}
              placeholder="Digite"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Celular</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={maskCelular(values.celular)}
                onChange={e => onChange('celular', maskCelular(e.target.value))}
                placeholder="(99) 99999-9999"
                maxLength={15}
                inputMode="tel"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">WhatsApp</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={maskWhatsapp(values.whatsapp)}
                onChange={e => onChange('whatsapp', maskWhatsapp(e.target.value))}
                placeholder="(99) 99999-9999"
                maxLength={15}
                inputMode="tel"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Telefone</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={maskTelefone(values.telefone)}
                onChange={e => onChange('telefone', maskTelefone(e.target.value))}
                placeholder="(99) 9999-9999"
                maxLength={14}
                inputMode="tel"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Telefone alternativo</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={maskTelefone(values.telefoneAlternativo)}
                onChange={e => onChange('telefoneAlternativo', maskTelefone(e.target.value))}
                placeholder="(99) 9999-9999"
                maxLength={14}
                inputMode="tel"
              />
            </div>
          </div>

        <div className="mt-4">
          <label className="block text-gray-700 text-sm mb-1 font-medium">LinkedIn</label>
          <input
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
            value={values.linkedin}
            onChange={e => onChange('linkedin', e.target.value)}
            placeholder="Digite"
          />
        </div>
      </div>
    </GenericEditModal>
  )
}

export default EditarContatoModal
