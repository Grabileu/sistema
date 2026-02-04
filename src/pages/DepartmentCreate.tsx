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
  const [unitOptions, setUnitOptions] = useState<{ label: string; value: string }[]>([])

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
    unidadeNegocio: editingDepartment?.unidadeNegocio || '',
    observacao: editingDepartment?.observacao || ''
  })

  useEffect(() => {
    const options: { label: string; value: string }[] = []
    
    // Adicionar dados da empresa como opção principal
    const companyDataStr = localStorage.getItem('companyData')
    if (companyDataStr) {
      try {
        const companyData = JSON.parse(companyDataStr)
        const companyName = companyData.nomeEmpresa || companyData.razaoSocial || 'Empresa Principal'
        options.push({ label: `${companyName} (Principal)`, value: 'company-main' })
      } catch {}
    }
    
    // Adicionar unidades de negócio cadastradas
    businessUnits.forEach(unit => {
      const label = unit.unidadePrincipal ? `${unit.nomeUnidade} (Principal)` : unit.nomeUnidade
      options.push({ label, value: unit.id })
    })
    
    setUnitOptions(options)
  }, [businessUnits])

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        codigo: editingDepartment.codigo,
        nome: editingDepartment.nome,
        unidadeNegocio: editingDepartment.unidadeNegocio,
        observacao: editingDepartment.observacao || ''
      })
    }
  }, [editingDepartment])

  const [errors, setErrors] = useState({
    codigo: false,
    nome: false,
    unidadeNegocio: false
  })

  const handleSave = () => {
    const newErrors = {
      codigo: !formData.codigo,
      nome: !formData.nome,
      unidadeNegocio: !formData.unidadeNegocio
    }
    
    setErrors(newErrors)
    
    if (Object.values(newErrors).some(error => error)) {
      return
    }
    
    const departmentData: Department = {
      id: editingDepartment?.id || `dept-${Date.now()}`,
      codigo: formData.codigo,
      nome: formData.nome,
      unidadeNegocio: formData.unidadeNegocio,
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Digite"
                value={formData.codigo}
                onChange={(e) => {
                  setFormData({ ...formData, codigo: e.target.value })
                  setErrors({ ...errors, codigo: false })
                }}
                disabled={!!editingDepartment}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Unidade de negócio <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.unidadeNegocio}
                onChange={(value) => {
                  setFormData({ ...formData, unidadeNegocio: String(value) })
                  setErrors({ ...errors, unidadeNegocio: false })
                }}
                options={unitOptions}
                placeholder="Selecione"
                buttonClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded text-left text-gray-900"
                menuClassName="w-full"
              />
              {errors.unidadeNegocio && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 text-sm mb-2">Observação</label>
            <textarea
              placeholder="Digite"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500 resize-none"
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
