import React, { useState } from 'react'
import { Employee } from '../App'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'

interface AdicionarFaltaProps {
  onNavigate?: (route: string) => void
  onAddFalta?: (falta: any) => void
  onUpdateFalta?: (falta: any) => void
  employees: Employee[]
  editingFalta?: any
}

const AdicionarFalta: React.FC<AdicionarFaltaProps> = ({ onNavigate, onAddFalta, onUpdateFalta, employees, editingFalta }) => {
  const [formData, setFormData] = useState({
    funcionarioId: editingFalta?.funcionarioId || '',
    data: editingFalta?.data || '',
    motivo: editingFalta?.motivo || ''
  })

  const [errors, setErrors] = useState({
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

  const employeeOptions = [
    { label: 'Selecione', value: '' },
    ...employees.map((emp) => ({
      label: emp.nomeCompleto,
      value: emp.id
    }))
  ]

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
        data: formData.data,
        motivo: formData.motivo
      }
      onUpdateFalta?.(updatedFalta)
    } else {
      // Criar nova falta
      const newFalta = {
        id: Date.now().toString(),
        funcionarioId: formData.funcionarioId,
        funcionarioNome: selectedEmployee?.nomeCompleto || '',
        data: formData.data,
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
                  setFormData({ ...formData, funcionarioId: String(value) })
                  setErrors({ ...errors, funcionarioId: false })
                }}
                options={employeeOptions}
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
                value={formData.data}
                onChange={(value) => {
                  setFormData({ ...formData, data: value })
                  setErrors({ ...errors, data: false })
                }}
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
