import React, { useRef, useState } from 'react'
import { Employee, Falta } from '../App'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'
import { buildEmployeeOptions } from '../utils/formatters'

type FaltaFormData = {
  funcionarioId: string
  data: string
  motivo: string
}

type FaltaFormErrors = {
  funcionarioId: boolean
  data: boolean
}

interface AdicionarFaltaProps {
  onNavigate?: (route: string) => void
  onAddFalta?: (falta: Falta) => void
  onUpdateFalta?: (falta: Falta) => void
  employees: Employee[]
  editingFalta?: Falta | null
}

const AdicionarFalta: React.FC<AdicionarFaltaProps> = ({ onNavigate, onAddFalta, onUpdateFalta, employees, editingFalta }) => {
  const standardFieldClass = 'rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'
  const funcionarioRef = useRef<HTMLButtonElement>(null)
  const dataRef = useRef<HTMLInputElement>(null)
  const motivoRef = useRef<HTMLButtonElement>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  const [formData, setFormData] = useState<FaltaFormData>({
    funcionarioId: editingFalta?.funcionarioId || '',
    data: editingFalta?.data || '',
    motivo: editingFalta?.motivo || ''
  })

  const [errors, setErrors] = useState<FaltaFormErrors>({
    funcionarioId: false,
    data: false
  })

  const motivos = [
    { label: 'Selecione', value: '' },
    { label: 'Falta injustificada', value: 'Falta injustificada' },
    { label: 'Doença', value: 'Doença' },
    { label: 'Problema pessoal', value: 'Problema pessoal' },
    { label: 'Compromisso urgente', value: 'Compromisso urgente' },
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

    if (editingFalta) {
      // Atualizar falta existente
      const updatedFalta = {
        ...editingFalta,
        funcionarioId: formData.funcionarioId,
        funcionarioNome: selectedEmployee?.nomeCompleto || '',
        data: formData.data, // já está DD/MM/AAAA
        motivo: formData.motivo
      }
      onUpdateFalta?.(updatedFalta)
    } else {
      // Criar nova falta
      // Sempre salvar como DD/MM/AAAA
      const dataFormatada = formData.data && /^\d{4}-\d{2}-\d{2}$/.test(formData.data)
        ? formData.data.split('-').reverse().join('/')
        : formData.data;
      const newFalta = {
        id: Date.now().toString(),
        funcionarioId: formData.funcionarioId,
        funcionarioNome: selectedEmployee?.nomeCompleto || '',
        data: dataFormatada,
        motivo: formData.motivo,
        criadoEm: new Date().toLocaleDateString('pt-BR')
      }
      onAddFalta?.(newFalta)
    }
    onNavigate?.('faltas')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">{editingFalta ? 'Editar falta' : 'Adicionar falta'}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-lg font-semibold mb-6">Registre a falta do funcionário</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Funcionário <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.funcionarioId}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, funcionarioId: String(value) }))
                  setErrors((prev) => ({ ...prev, funcionarioId: false }))
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
                Data da falta <span className="text-red-500">*</span>
              </label>
              <DatePicker
                ref={dataRef}
                value={formData.data}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, data: value }))
                  setErrors((prev) => ({ ...prev, data: false }))
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
                setFormData((prev) => ({ ...prev, motivo: String(value) }))
              }
              options={motivos}
              buttonClassName={standardFieldClass}
              buttonRef={motivoRef}
              nextRef={saveButtonRef}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('faltas')}
              className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded font-medium hover:bg-gray-300"
            >
              Voltar
            </button>
            <button
              onClick={handleSave}
              ref={saveButtonRef}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded font-medium hover:bg-indigo-700"
            >
              {editingFalta ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdicionarFalta
