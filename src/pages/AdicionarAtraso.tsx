import React, { useRef, useState } from 'react'
import { Employee } from '../App'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'
import { buildEmployeeOptions } from '../utils/formatters'

interface AdicionarAtrasoProps {
  onNavigate?: (route: string) => void
  onAddAtraso?: (atraso: any) => void
  onUpdateAtraso?: (atraso: any) => void
  employees: Employee[]
  editingAtraso?: any
}

const AdicionarAtraso: React.FC<AdicionarAtrasoProps> = ({ onNavigate, onAddAtraso, onUpdateAtraso, employees, editingAtraso }) => {
  const standardFieldClass = 'rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'
  const funcionarioRef = useRef<HTMLButtonElement>(null)
  const dataRef = useRef<HTMLInputElement>(null)
  const motivoRef = useRef<HTMLButtonElement>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  const [formData, setFormData] = useState({
    funcionarioId: editingAtraso?.funcionarioId || '',
    data: editingAtraso?.data || '',
    motivo: editingAtraso?.motivo || ''
  })

  const [errors, setErrors] = useState({
    funcionarioId: false,
    data: false
  })

  const motivos = [
    { label: 'Selecione', value: '' },
    { label: 'Atraso leve', value: 'Atraso leve' },
    { label: 'Atraso grave', value: 'Atraso grave' },
    { label: 'Problema transporte', value: 'Problema transporte' },
    { label: 'Outro', value: 'Outro' }
  ]

  const employeeOptions = buildEmployeeOptions(employees)

  const handleSave = () => {
    const newErrors = {
      funcionarioId: !formData.funcionarioId,
      data: !formData.data
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((error) => error)) {
      return
    }

    const selectedEmployee = employees.find((e) => e.id === formData.funcionarioId)

    if (editingAtraso) {
      const updated = {
        ...editingAtraso,
        funcionarioId: formData.funcionarioId,
        funcionarioNome: selectedEmployee?.nomeCompleto || '',
        data: formData.data,
        motivo: formData.motivo
      }
      onUpdateAtraso?.(updated)
    } else {
      const newAtraso = {
        id: Date.now().toString(),
        funcionarioId: formData.funcionarioId,
        funcionarioNome: selectedEmployee?.nomeCompleto || '',
        data: formData.data,
        motivo: formData.motivo,
        criadoEm: new Date().toLocaleDateString('pt-BR')
      }
      onAddAtraso?.(newAtraso)
    }
    onNavigate?.('atrasos')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">{editingAtraso ? 'Editar atraso' : 'Adicionar atraso'}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-lg font-semibold mb-6">Registre o atraso do funcionário</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Funcionário <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.funcionarioId}
                onChange={(value) => {
                  setFormData({ ...formData, funcionarioId: String(value) })
                  setErrors({ ...errors, funcionarioId: false })
                }}
                options={employeeOptions}
                buttonClassName={standardFieldClass}
                buttonRef={funcionarioRef}
                nextRef={dataRef}
              />
              {errors.funcionarioId && (
                <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Data do atraso <span className="text-red-500">*</span>
              </label>
              <DatePicker
                ref={dataRef}
                value={formData.data}
                onChange={(value) => {
                  setFormData({ ...formData, data: value })
                  setErrors({ ...errors, data: false })
                }}
                className={standardFieldClass}
                nextRef={motivoRef}
              />
              {errors.data && (
                <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 text-sm mb-2">Motivo</label>
            <Select
              value={formData.motivo}
              onChange={(value) =>
                setFormData({ ...formData, motivo: String(value) })
              }
              options={motivos}
              buttonClassName={standardFieldClass}
              buttonRef={motivoRef}
              nextRef={saveButtonRef}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('atrasos')}
              className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded font-medium hover:bg-gray-300"
            >
              Voltar
            </button>
            <button
              onClick={handleSave}
              ref={saveButtonRef}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded font-medium hover:bg-indigo-700"
            >
              {editingAtraso ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdicionarAtraso
