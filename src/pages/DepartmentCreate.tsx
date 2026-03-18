import React, { useState, useEffect } from 'react'
import Select from '../components/Select'
import { BusinessUnit, Department } from '../App'

interface DepartmentCreateProps {
  onNavigate?: (route: string) => void
  businessUnits?: BusinessUnit[]
  onAddDepartment?: (department: Department) => void
  onUpdateDepartment?: (department: Department) => void
  editingDepartment?: Department
}

const DepartmentCreate: React.FC<DepartmentCreateProps> = ({ 
  onNavigate, 
  businessUnits = [], 
  onAddDepartment, 
  onUpdateDepartment, 
  editingDepartment 
}) => {
  // Gerar próximo código automaticamente
  const getNextCode = () => {
    if (editingDepartment) return editingDepartment.codigo
    
    const storedDepartments = localStorage.getItem('departments')
    if (storedDepartments) {
      try {
        const departments = JSON.parse(storedDepartments)
        const codes = departments
          .map((d: Department) => parseInt(d.codigo))
          .filter((code: number) => !isNaN(code))
        
        if (codes.length > 0) {
          const nextCode = Math.max(...codes) + 1
          return String(nextCode).padStart(2, '0')
        }
      } catch {}
    }
    return '01'
  }

  const [formData, setFormData] = useState({
    codigo: getNextCode(),
    nome: editingDepartment?.nome || '',
    observacao: editingDepartment?.observacao || ''
  })

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        codigo: editingDepartment.codigo,
        nome: editingDepartment.nome,
        observacao: editingDepartment.observacao || ''
      })
    }
  }, [editingDepartment])

  const [errors, setErrors] = useState({
    codigo: false,
    nome: false
  })

  const standardFieldClass = 'w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500'

  const handleSave = () => {
    const newErrors = {
      codigo: !formData.codigo,
      nome: !formData.nome
    }
    
    setErrors(newErrors)
    
    if (Object.values(newErrors).some(error => error)) {
      return
    }
    
    const departmentData: Department = {
      id: editingDepartment?.id || `dept-${Date.now()}`,
      codigo: formData.codigo,
      nome: formData.nome,
      unidadeNegocio: editingDepartment?.unidadeNegocio || '',
      observacao: formData.observacao,
      criadoEm: editingDepartment?.criadoEm || new Date().toLocaleDateString('pt-BR')
    }

    if (editingDepartment) {
      onUpdateDepartment?.(departmentData)
    } else {
      onAddDepartment?.(departmentData)
    }
    
    onNavigate?.('departamentos')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {editingDepartment ? 'Editar departamento' : 'Cadastro de departamento'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Codigo gerado automaticamente"
                value={formData.codigo}
                readOnly
                disabled
                className={`${standardFieldClass} bg-gray-200 cursor-not-allowed disabled:cursor-not-allowed opacity-70`}
              />
              {errors.codigo && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Digite"
                value={formData.nome}
                onChange={(e) => {
                  setFormData({ ...formData, nome: e.target.value })
                  setErrors({ ...errors, nome: false })
                }}
                className={standardFieldClass}
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 text-sm mb-2">Observação</label>
            <textarea
              placeholder="Digite"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500 resize-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('Departamentos')}
              className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded font-medium hover:bg-gray-300"
            >
              Voltar
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded font-medium hover:bg-indigo-700"
            >
              Cadastrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepartmentCreate
