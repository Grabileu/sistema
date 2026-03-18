import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { Employee } from '../App'
import Select from '../components/Select'
import { formatCPF, formatPIS, formatRG, buildStoreOptions } from '../utils/formatters'
import { useClickOutside } from '../hooks/useClickOutside'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

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
    const employeesPerPage = 25
    const [currentPage, setCurrentPage] = useState(1)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nome: string } | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    // Filter state (inputs)
    const [inputFilters, setInputFilters] = useState({
      nome: '',
      cargo: '',
      equipe: '',
      departamento: '',
      turno: '',
      loja: '',
      email: '',
      cpf: '',
      matricula: '',
      rg: '',
      cidade: '',
      pis: '',
      carteira: '',
      cnh: ''
    })

    // Filter state (applied on Pesquisar)
    const [appliedFilters, setAppliedFilters] = useState({
      nome: '',
      cargo: '',
      equipe: '',
      departamento: '',
      turno: '',
      loja: '',
      email: '',
      cpf: '',
      matricula: '',
      rg: '',
      cidade: '',
      pis: '',
      carteira: '',
      cnh: ''
    })

    const handleApplyFilters = () => {
      setAppliedFilters({ ...inputFilters })
      setCurrentPage(1)
    }

    const onlyNumbers = (value: string) => value.replace(/\D/g, '')
    const numericWithMaxLength = (value: string, maxLength: number) =>
      onlyNumbers(value).slice(0, maxLength)

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

    const [positions, setPositions] = useState(() => {
      const positionsStr = localStorage.getItem('positions');
      if (positionsStr) {
        try {
          return JSON.parse(positionsStr);
        } catch {}
      }
      return [];
    });

    const [turnos, setTurnos] = useState(() => {
      const turnosStr = localStorage.getItem('turnos');
      if (turnosStr) {
        try {
          return JSON.parse(turnosStr);
        } catch {}
      }
      return [];
    });

    const [businessUnits, setBusinessUnits] = useState(() => {
      const buStr = localStorage.getItem('businessUnits');
      if (buStr) {
        try {
          return JSON.parse(buStr);
        } catch {}
      }
      return [];
    });

    const [companyData, setCompanyData] = useState<any>(() => {
      const companyDataStr = localStorage.getItem('companyData')
      if (companyDataStr) {
        try {
          return JSON.parse(companyDataStr)
        } catch {}
      }
      return null
    })

    useEffect(() => {
      const handleStorageChange = () => {
        const companyDataStr = localStorage.getItem('companyData')
        if (companyDataStr) {
          try {
            setCompanyData(JSON.parse(companyDataStr))
          } catch {
            setCompanyData(null)
          }
        } else {
          setCompanyData(null)
        }
      }

      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const storeOptions = buildStoreOptions(businessUnits, companyData, 'Todos')

    // Função para buscar o nome do departamento pela equipe
    const getDepartmentName = (teamName: string) => {
      const team = teams.find((t: any) => t.nome === teamName);
      if (team && team.departamentoId) {
        const dept = departments.find((d: any) => d.id === team.departamentoId);
        return dept ? dept.nome : '-';
      }
      return '-';
    };

    // Filter employees based on filters applied by Pesquisar
    const filteredEmployees = employees.filter((emp) => {
      if (appliedFilters.nome && !emp.nomeCompleto.toLowerCase().includes(appliedFilters.nome.toLowerCase())) return false;
      if (appliedFilters.cargo && emp.cargo !== appliedFilters.cargo) return false;
      if (appliedFilters.equipe && emp.equipe !== appliedFilters.equipe) return false;
      if (appliedFilters.departamento && getDepartmentName(emp.equipe) !== appliedFilters.departamento) return false;
      if (appliedFilters.turno && emp.turno !== appliedFilters.turno) return false;
      if (appliedFilters.loja && emp.loja !== appliedFilters.loja) return false;
      if (appliedFilters.email && !emp.email.toLowerCase().includes(appliedFilters.email.toLowerCase())) return false;
      if (appliedFilters.cpf) {
        const filterCpf = onlyNumbers(appliedFilters.cpf)
        const employeeCpf = onlyNumbers(emp.cpf || '')
        if (!employeeCpf.includes(filterCpf)) return false
      }

      if (appliedFilters.pis) {
        const filterPis = onlyNumbers(appliedFilters.pis)
        const employeePis = onlyNumbers(emp.pis || '')
        if (!employeePis.includes(filterPis)) return false
      }

      if (appliedFilters.matricula && !emp.matricula.includes(appliedFilters.matricula)) return false;
      return true;
    });

    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / employeesPerPage))
    const startIndex = (currentPage - 1) * employeesPerPage
    const endIndex = Math.min(startIndex + employeesPerPage, filteredEmployees.length)
    const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage)

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, totalPages))
  }, [totalPages])

  useClickOutside(menuRef, () => setOpenMenuId(null))

  const handleDelete = (id: string, nome: string) => {
    setPendingDelete({ id, nome })
    setOpenMenuId(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    onDeleteEmployee?.(pendingDelete.id)
    setPendingDelete(null)
  }

  const cancelDelete = () => {
    setPendingDelete(null)
  }

  const handleEdit = (id: string) => {
    onEditEmployee?.(id)
    setOpenMenuId(null)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {pendingDelete && (
        <DeleteConfirmModal
          title="Excluir funcionário"
          description="Tem certeza que deseja excluir o funcionário abaixo?"
          itemName={pendingDelete.nome}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

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
                  value={inputFilters.nome}
                  onChange={(e) => setInputFilters({...inputFilters, nome: e.target.value})}
                  className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100 pr-9"
                />
                <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Cargo</label>
              <div className="mt-1">
                <Select
                  value={inputFilters.cargo}
                  onChange={(value) => setInputFilters({...inputFilters, cargo: String(value)})}
                  options={[
                    { label: 'Todos', value: '' },
                    ...positions.map((p: any) => ({
                      label: p.nome,
                      value: p.nome
                    }))
                  ]}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Equipe</label>
              <div className="mt-1">
                <Select
                  value={inputFilters.equipe}
                  onChange={(value) => setInputFilters({...inputFilters, equipe: String(value)})}
                  options={[
                    { label: 'Todos', value: '' },
                    ...teams.map((t: any) => ({
                      label: t.nome,
                      value: t.nome
                    }))
                  ]}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Departamento</label>
              <div className="mt-1">
                <Select
                  value={inputFilters.departamento}
                  onChange={(value) => setInputFilters({...inputFilters, departamento: String(value)})}
                  options={[
                    { label: 'Todos', value: '' },
                    ...departments.map((d: any) => ({
                      label: d.nome,
                      value: d.nome
                    }))
                  ]}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Turno</label>
              <div className="mt-1">
                <Select
                  value={inputFilters.turno}
                  onChange={(value) => setInputFilters({...inputFilters, turno: String(value)})}
                  options={[
                    { label: 'Todos', value: '' },
                    ...turnos.map((t: any) => ({
                      label: t.nome,
                      value: t.nome
                    }))
                  ]}
                />
              </div>
            </div>
            {!showAdvanced && (
              <div className="flex items-end">
                <button
                  onClick={handleApplyFilters}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
                >
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
                  <label className="text-xs text-gray-500">Loja</label>
                  <div className="mt-1">
                    <Select
                      value={inputFilters.loja}
                      onChange={(value) => setInputFilters({...inputFilters, loja: String(value)})}
                      options={storeOptions}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500">E-mail</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={inputFilters.email}
                    onChange={(e) => setInputFilters({...inputFilters, email: e.target.value})}
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={inputFilters.cpf}
                    onChange={(e) => setInputFilters({...inputFilters, cpf: formatCPF(e.target.value)})}
                    maxLength={14}
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Código da matrícula</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={inputFilters.matricula}
                    onChange={(e) => setInputFilters({...inputFilters, matricula: numericWithMaxLength(e.target.value, 20)})}
                    maxLength={20}
                    inputMode="numeric"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">RG</label>
                  <input
                    type="text"
                    placeholder="00.000.000-0"
                    value={inputFilters.rg}
                    onChange={(e) => setInputFilters({...inputFilters, rg: formatRG(e.target.value)})}
                    maxLength={12}
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Cidade</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Número do PIS/PASEP</label>
                  <input
                    type="text"
                    placeholder="000.00000.00-0"
                    value={inputFilters.pis}
                    onChange={(e) => setInputFilters({...inputFilters, pis: formatPIS(e.target.value)})}
                    maxLength={14}
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Número da carteira de trabalho</label>
                  <input
                    type="text"
                    placeholder="Somente números"
                    value={inputFilters.carteira}
                    onChange={(e) => setInputFilters({...inputFilters, carteira: numericWithMaxLength(e.target.value, 11)})}
                    maxLength={11}
                    inputMode="numeric"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">CNH</label>
                  <input
                    type="text"
                    placeholder="Somente números"
                    value={inputFilters.cnh}
                    onChange={(e) => setInputFilters({...inputFilters, cnh: numericWithMaxLength(e.target.value, 11)})}
                    maxLength={11}
                    inputMode="numeric"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleApplyFilters}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
                  >
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
            Página {currentPage}/{totalPages} - Exibindo {filteredEmployees.length === 0 ? 0 : startIndex + 1} a {endIndex} de {filteredEmployees.length} registros.
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
                  <th className="py-3">Cargo</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      Nenhum funcionário encontrado
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <button
                          className="font-medium text-indigo-700 hover:underline focus:underline focus:outline-none bg-transparent p-0 m-0 cursor-pointer"
                          onClick={() => onNavigate && onNavigate(`perfil-funcionario-${employee.id}`)}
                          type="button"
                        >
                          {employee.nomeCompleto}
                        </button>
                        <div className="text-xs text-gray-500">Cargo: {employee.cargo || '-'}</div>
                      </td>
                      <td className="py-4">{employee.cpf}</td>
                      <td className="py-4">{employee.email}</td>
                      <td className="py-4">{employee.equipe || '-'}</td>
                      <td className="py-4">{employee.turno || '-'}</td>
                      <td className="py-4">{getDepartmentName(employee.equipe)}</td>
                      <td className="py-4">{employee.cargo || '-'}</td>
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prevPage) => Math.max(1, prevPage - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>

              <span className="px-2 text-sm text-gray-600">Página {currentPage} de {totalPages}</span>

              <button
                type="button"
                onClick={() => setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActiveEmployees
