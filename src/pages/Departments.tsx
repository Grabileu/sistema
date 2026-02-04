import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { Department } from '../App'

interface DepartmentsProps {
  onNavigate?: (route: string) => void
  departments?: Department[]
  onDeleteDepartment?: (id: string) => void
  onEditDepartment?: (id: string) => void
}

const Departments: React.FC<DepartmentsProps> = ({ 
  onNavigate, 
  departments = [], 
  onDeleteDepartment, 
  onEditDepartment 
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este departamento?')) {
      onDeleteDepartment?.(id)
      setOpenMenuId(null)
    }
  }

  // Buscar nome da unidade de negócio
  const getUnitName = (unitId: string) => {
    if (unitId === 'company-main') {
      const companyDataStr = localStorage.getItem('companyData')
      if (companyDataStr) {
        try {
          const companyData = JSON.parse(companyDataStr)
          return companyData.nomeEmpresa || companyData.razaoSocial || 'Empresa Principal'
        } catch {}
      }
      return 'Empresa Principal'
    }
    
    const businessUnitsStr = localStorage.getItem('businessUnits')
    if (businessUnitsStr) {
      try {
        const businessUnits = JSON.parse(businessUnitsStr)
        const unit = businessUnits.find((u: any) => u.id === unitId)
        return unit?.nomeUnidade || '-'
      } catch {}
    }
    return '-'
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Lista de departamentos</h1>
          <button
            onClick={() => onNavigate?.('cadastro-departamento')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
          >
            Cadastrar departamento
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg overflow-visible">
          <div className="p-4 bg-gray-50 border-b text-right text-sm text-gray-600">
            Página 1/1 - Exibindo {departments.length} de {departments.length} registros
          </div>
          
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Unidade de negócio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Nenhum departamento cadastrado
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-800">
                        {dept.nome}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getUnitName(dept.unidadeNegocio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.criadoEm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="relative" ref={openMenuId === dept.id ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === dept.id ? null : dept.id)}
                          className="hover:bg-gray-100 p-1 rounded"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {openMenuId === dept.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <button
                              onClick={() => {
                                onEditDepartment?.(dept.id)
                                setOpenMenuId(null)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                            >
                              <Edit2 size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(dept.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                            >
                              <Trash2 size={16} />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Departments
