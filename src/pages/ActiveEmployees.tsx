import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { Employee } from '../App'

interface ActiveEmployeesProps {
  onNavigate?: (route: string) => void
  employees: Employee[]
  onDeleteEmployee?: (id: string) => void
  onEditEmployee?: (id: string) => void
}

const ActiveEmployees: React.FC<ActiveEmployeesProps> = ({ 
  onNavigate, 
  employees,
  onDeleteEmployee,
  onEditEmployee
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Carregar equipes e departamentos do localStorage
    const [teams, setTeams] = useState(() => {
      const teamsStr = localStorage.getItem('teams');
      if (teamsStr) {
        try {
          return JSON.parse(teamsStr);
        } catch {}
      }
      return [];
    });
    const [departments, setDepartments] = useState(() => {
      const departmentsStr = localStorage.getItem('departments');
      if (departmentsStr) {
        try {
          return JSON.parse(departmentsStr);
        } catch {}
      }
      return [];
    });

    // Função para buscar o nome do departamento pela equipe
    const getDepartmentName = (teamName: string) => {
      const team = teams.find((t: any) => t.nome === teamName);
      if (team && team.departamentoId) {
        const dept = departments.find((d: any) => d.id === team.departamentoId);
        return dept ? dept.nome : '-';
      }
      return '-';
    };

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o funcionário "${nome}"?`)) {
      onDeleteEmployee?.(id)
      setOpenMenuId(null)
    }
  }

  const handleEdit = (id: string) => {
    onEditEmployee?.(id)
    setOpenMenuId(null)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Lista de funcionários ativos</h1>
          <button 
            onClick={() => onNavigate?.('cadastro-funcionario')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
          >
            Cadastrar novo funcionário
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Card filtros */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Search size={18} />
                <span>Buscar funcionários ativos</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Para uma busca mais específica, preencha os filtros que desejar ou selecione os filtros avançados para mais opções.
              </p>
            </div>
            <button
              className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-2"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Search size={14} />
              {showAdvanced ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500">Funcionário</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="Comece digitando o nome"
                  className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Cargo</label>
              <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                Todos
                <ChevronDown size={16} />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500">Equipe</label>
              <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                Todos
                <ChevronDown size={16} />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500">Departamento</label>
              <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                Todos
                <ChevronDown size={16} />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500">Turno</label>
              <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                Todos
                <ChevronDown size={16} />
              </button>
            </div>
            {!showAdvanced && (
              <div className="flex items-end">
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700">
                  Pesquisar
                </button>
              </div>
            )}
          </div>

          {/* Filtros avançados */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showAdvanced ? 'max-h-[520px] opacity-100 mt-6' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-4">Filtros avançados:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Unidade de negócio</label>
                  <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                    Todos
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-gray-500">E-mail</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">CPF</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Código da matrícula</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">RG</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Cidade</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Número do PIS/PASEP</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Número da carteira de trabalho</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">CNH</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700">
                    Pesquisar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-end text-sm text-gray-500 mb-3">
            Página 1/1 - Exibindo {employees.length} de {employees.length} registros.
          </div>
          <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3">Funcionário</th>
                  <th className="py-3">CPF</th>
                  <th className="py-3">E-mail</th>
                  <th className="py-3">Equipe</th>
                  <th className="py-3">Turno</th>
                  <th className="py-3">Departamento</th>
                  <th className="py-3">Último acesso</th>
                  <th className="py-3">Último registro</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      Nenhum funcionário cadastrado
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div className="font-medium text-gray-900">{employee.nomeCompleto}</div>
                        <div className="text-xs text-gray-500">Cargo: {employee.cargo || '-'}</div>
                      </td>
                      <td className="py-4">{employee.cpf}</td>
                      <td className="py-4">{employee.email}</td>
                      <td className="py-4">{employee.equipe || '-'}</td>
                      <td className="py-4">{employee.turno || '-'}</td>
                      <td className="py-4">{getDepartmentName(employee.equipe)}</td>
                      <td className="py-4">{employee.ultimoAcesso}</td>
                      <td className="py-4">{employee.ultimoRegistro}</td>
                      <td className="py-4 text-right">
                        <div className="relative inline-block" ref={openMenuId === employee.id ? menuRef : null}>
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === employee.id ? null : employee.id)}
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>
                          {openMenuId === employee.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-xl border border-gray-200 py-1" 
                                 style={{ zIndex: 9999 }}>
                              <button
                                onClick={() => handleEdit(employee.id)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit2 size={16} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(employee.id, employee.nomeCompleto)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
    </div>
  )
}

export default ActiveEmployees
