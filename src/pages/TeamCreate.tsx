import React, { useRef, useState } from 'react'
import { Search, ChevronRight, ChevronLeft, Eye } from 'lucide-react'
import Select from '../components/Select'
import { Department, Team, Employee, BusinessUnit } from '../App'
import { focusNext, handleKeyDown } from '../utils/formatters'

interface TeamCreateProps {
  onNavigate?: (route: string) => void
  departments: Department[]
  businessUnits?: BusinessUnit[]
  employees: Employee[]
  onAddTeam?: (team: Team) => void
  onUpdateTeam?: (team: Team) => void
  editingTeam?: Team | null
}

const TeamCreate: React.FC<TeamCreateProps> = ({ onNavigate, departments, businessUnits = [], employees, onAddTeam, onUpdateTeam, editingTeam }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const nomeRef = useRef<HTMLInputElement>(null)
  const lojaRef = useRef<HTMLButtonElement>(null)
  const departamentoRef = useRef<HTMLButtonElement>(null)
  const observacaoRef = useRef<HTMLTextAreaElement>(null)
  const continueButtonRef = useRef<HTMLButtonElement>(null)
  const [filterLeft, setFilterLeft] = useState('funcionario')
  const [filterRight, setFilterRight] = useState('funcionario')
  const [searchLeft, setSearchLeft] = useState('')
  const [searchRight, setSearchRight] = useState('')
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<string[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [teamEmployeeIds, setTeamEmployeeIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    lojaId: '',
    departamentoId: '',
    observacao: ''
  })
  const [errors, setErrors] = useState({
    nome: false,
    codigo: false,
    lojaId: false,
    departamentoId: false
  })

  // Estados e funções auxiliares para busca e seleção de gestores
  const [gestorSearch, setGestorSearch] = useState('');
  const [gestoresSelecionados, setGestoresSelecionados] = useState<Employee[]>([]);
  const filteredGestores = employees.filter(e =>
    !gestoresSelecionados.some(g => g.id === e.id) &&
    e.nomeCompleto.toLowerCase().includes(gestorSearch.toLowerCase())
  );
  function handleAddGestor(emp: Employee) {
    setGestoresSelecionados(prev => [...prev, emp]);
    setGestorSearch('');
  }
  function handleRemoveGestor(id: string) {
    setGestoresSelecionados(prev => prev.filter(e => e.id !== id));
  }
  function handleRemoveTodosGestores() {
    setGestoresSelecionados([]);
  }

  const filterOptions = [
    { label: 'Funcionário', value: 'funcionario' },
    { label: 'Departamento', value: 'departamento' },
    { label: 'Cargo', value: 'cargo' }
  ]

  const filterLabel = (filter: string) => {
    if (filter === 'departamento') return 'Pesquisar por departamento'
    if (filter === 'cargo') return 'Pesquisar por cargo'
    return 'Pesquisar por funcionário'
  }
  // Impede adicionar funcionário que já tem equipe
  const availableEmployeesBase = employees.filter((employee) => {
    if (teamEmployeeIds.includes(employee.id)) return false
    return !employee.equipe || employee.equipe.trim() === ''
  })
  const teamEmployeesBase = employees.filter((e) => teamEmployeeIds.includes(e.id))

  const toggleAvailable = (id: string) => {
    setSelectedAvailableIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleTeam = (id: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const moveToTeam = () => {
    if (selectedAvailableIds.length === 0) return
    setTeamEmployeeIds((prev) => [...prev, ...selectedAvailableIds])
    setSelectedAvailableIds([])
  }

  const moveToAvailable = () => {
    if (selectedTeamIds.length === 0) return
    // Limpa o campo equipe dos funcionários removidos
    selectedTeamIds.forEach(id => {
      const idx = employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        employees[idx] = { ...employees[idx], equipe: '' };
      }
    });
    setTeamEmployeeIds((prev) => prev.filter((id) => !selectedTeamIds.includes(id)))
    setSelectedTeamIds([])
  }

  const departmentOptions = [
    { label: 'Selecione', value: '' },
    ...departments.map((d) => ({ label: d.nome, value: d.id }))
  ]

  const storeOptions = React.useMemo(() => {
    const options: Array<{ label: string; value: string }> = [{ label: 'Selecione', value: '' }]
    const companyDataStr = localStorage.getItem('companyData')

    if (companyDataStr) {
      try {
        const companyData = JSON.parse(companyDataStr)
        const companyName = companyData.nomeEmpresa || companyData.razaoSocial || 'Empresa Principal'
        options.push({ label: `${companyName} (Principal)`, value: 'company-main' })
      } catch {}
    }

    businessUnits.forEach((unit) => {
      const label = unit.unidadePrincipal ? `${unit.nomeUnidade} (Principal)` : unit.nomeUnidade
      options.push({ label, value: unit.id })
    })

    return options
  }, [businessUnits])

  const standardFieldClass = 'w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500'

  const selectedDepartmentName = departments.find((department) => department.id === formData.departamentoId)?.nome || ''
  const selectedStoreName = storeOptions.find((store) => store.value === formData.lojaId)?.label?.replace(' (Principal)', '') || ''

  const getEmployeeDepartmentName = (employee: Employee) => {
    if (selectedDepartmentName) {
      return selectedDepartmentName
    }

    if (!employee.equipe) {
      return '-'
    }

    try {
      const storedTeams = localStorage.getItem('teams')
      if (!storedTeams) {
        return '-'
      }

      const teams = JSON.parse(storedTeams) as Team[]
      const employeeTeam = teams.find((team) => team.nome === employee.equipe)
      if (!employeeTeam) {
        return '-'
      }

      return employeeTeam.departamentoNome || departments.find((department) => department.id === employeeTeam.departamentoId)?.nome || '-'
    } catch {
      return '-'
    }
  }

  const matchesSearch = (employee: any, filter: string, query: string) => {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    if (filter === 'departamento') return (getEmployeeDepartmentName(employee) || '').toLowerCase().includes(q)
    if (filter === 'cargo') return (employee.cargo || '').toLowerCase().includes(q)
    return (employee.nomeCompleto || '').toLowerCase().includes(q)
  }

  const availableEmployees = availableEmployeesBase.filter(e => matchesSearch(e, filterLeft, searchLeft))
  const teamEmployees = teamEmployeesBase.filter(e => matchesSearch(e, filterRight, searchRight))

  const getNextCode = () => {
    const storedTeams = localStorage.getItem('teams')
    if (!storedTeams) {
      return '01'
    }
    try {
      const teams = JSON.parse(storedTeams) as Team[]
      const maxCode = teams.reduce((max, team) => {
        const num = parseInt(team.codigo, 10)
        return isNaN(num) ? max : Math.max(max, num)
      }, 0)
      return String(maxCode + 1).padStart(2, '0')
    } catch {
      return '01'
    }
  }

  React.useEffect(() => {
    if (editingTeam) {
      setFormData({
        nome: editingTeam.nome,
        codigo: editingTeam.codigo,
        lojaId: editingTeam.lojaId || '',
        departamentoId: editingTeam.departamentoId,
        observacao: editingTeam.observacao || ''
      })
      setTeamEmployeeIds(editingTeam.employeeIds || [])
      // Restaurar gestores selecionados ao editar usando gestorIds
      if (editingTeam.gestorIds && Array.isArray(editingTeam.gestorIds)) {
        const gestores = employees.filter(e => editingTeam.gestorIds.includes(e.id));
        setGestoresSelecionados(gestores);
      } else {
        setGestoresSelecionados([]);
      }
      return;
    }
    setFormData((prev) => ({ ...prev, codigo: getNextCode() }));
    setGestoresSelecionados([]);
  }, [editingTeam, employees]);

  const buildTeam = (): Team => {
    const department = departments.find((d) => d.id === formData.departamentoId)
    const now = new Date().toISOString()

    return {
      id: editingTeam?.id || Date.now().toString(),
      codigo: formData.codigo,
      nome: formData.nome,
      lojaId: formData.lojaId,
      lojaNome: selectedStoreName,
      departamentoId: formData.departamentoId,
      departamentoNome: department?.nome || '',
      observacao: formData.observacao,
      employeeIds: teamEmployeeIds,
      gestorIds: gestoresSelecionados.map(g => g.id),
      totalFuncionarios: teamEmployeeIds.length,
      totalGestores: gestoresSelecionados.length,
      criadoEm: editingTeam?.criadoEm || now
    }
  }

  const handleContinue = () => {
    if (currentStep === 1) {
      const newErrors = {
        nome: !formData.nome.trim(),
        codigo: !formData.codigo.trim(),
        lojaId: !formData.lojaId,
        departamentoId: !formData.departamentoId
      }
      setErrors(newErrors)

      if (newErrors.nome || newErrors.codigo || newErrors.lojaId || newErrors.departamentoId) {
        return
      }

      setCurrentStep(2)
      return
    }

    if (currentStep === 2) {
      setCurrentStep(3)
      return
    }

    if (currentStep === 3) {
      const teamObj = buildTeam();
      if (editingTeam) {
        onUpdateTeam?.(teamObj)
      } else {
        onAddTeam?.(teamObj)
      }
      onNavigate?.('equipes')
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Cadastro de equipe</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b px-6">
            <div className="flex items-center gap-3 py-4">
              {[
                { step: 1, label: 'Equipe' },
                { step: 2, label: 'Gestores' },
                { step: 3, label: 'Funcionários' }
              ].map((item) => {
                const isCurrent = currentStep === item.step;
                let isVisited = editingTeam || item.step <= currentStep;
                // Libera o clique em Gestores assim que todos os campos obrigatórios da etapa 1 estiverem preenchidos
                if (!editingTeam && item.step === 2) {
                  isVisited = Boolean(formData.nome.trim()) && Boolean(formData.codigo.trim()) && Boolean(formData.lojaId) && Boolean(formData.departamentoId);
                }
                // Para Funcionários, libera se todos os campos obrigatórios da etapa 1 estiverem preenchidos
                if (!editingTeam && item.step === 3) {
                  isVisited = Boolean(formData.nome.trim()) && Boolean(formData.codigo.trim()) && Boolean(formData.lojaId) && Boolean(formData.departamentoId);
                }
                return (
                  <button
                    key={item.step}
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg focus:outline-none transition ${
                      isCurrent
                        ? 'bg-white border border-gray-200 cursor-default'
                        : isVisited
                          ? 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
                          : 'bg-gray-100 cursor-not-allowed opacity-60'
                    }`}
                    onClick={() => {
                      if (isVisited && !isCurrent) setCurrentStep(item.step)
                    }}
                    disabled={isCurrent || !isVisited}
                    style={!isVisited && !isCurrent ? { pointerEvents: 'auto' } : {}}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isCurrent ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {item.step}
                    </div>
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {currentStep === 1 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900">1. Equipe</h2>
                <p className="text-sm text-gray-500 mt-1">Configure as informações da equipe</p>

                <div className="border-t mt-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Código <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.codigo}
                        disabled
                        placeholder="01"
                        className={`${standardFieldClass} bg-gray-200 cursor-not-allowed disabled:cursor-not-allowed opacity-70 ${errors.codigo ? 'ring-1 ring-red-500' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Nome <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={nomeRef}
                        type="text"
                        value={formData.nome}
                        onChange={(e) => {
                          setFormData({ ...formData, nome: e.target.value })
                          if (errors.nome) setErrors({ ...errors, nome: false })
                        }}
                        onKeyDown={(event) => handleKeyDown(event, lojaRef)}
                        placeholder="Digite"
                        className={`${standardFieldClass} ${errors.nome ? 'ring-1 ring-red-500' : ''}`}
                      />
                      {errors.nome && (
                        <p className="text-xs text-red-500 mt-1">Preencha o nome da equipe</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Loja <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.lojaId}
                        onChange={(value) => {
                          setFormData({ ...formData, lojaId: String(value) })
                          if (errors.lojaId) setErrors({ ...errors, lojaId: false })
                        }}
                        buttonRef={lojaRef}
                        nextRef={departamentoRef}
                        options={storeOptions}
                        buttonClassName={`${standardFieldClass} text-left`}
                      />
                      {errors.lojaId && (
                        <p className="text-xs text-red-500 mt-1">Selecione uma loja</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Departamento <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.departamentoId}
                        onChange={(value) => {
                          setFormData({ ...formData, departamentoId: String(value) })
                          if (errors.departamentoId) setErrors({ ...errors, departamentoId: false })
                        }}
                        buttonRef={departamentoRef}
                        nextRef={observacaoRef}
                        options={departmentOptions}
                        buttonClassName={`${standardFieldClass} text-left`}
                      />
                      {errors.departamentoId && (
                        <p className="text-xs text-red-500 mt-1">Selecione um departamento</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-gray-700 text-sm mb-2">Observação</label>
                    <textarea
                      ref={observacaoRef}
                      value={formData.observacao}
                      onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                      onKeyDown={(event) => handleKeyDown(event, continueButtonRef)}
                      placeholder="Digite"
                      rows={4}
                      className={`${standardFieldClass} resize-none`}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('equipes')}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-300"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    ref={continueButtonRef}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium"
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900">2. Gestores</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Escolha um ou mais gestores para a sua equipe.
                </p>

                <div className="border-t mt-4 pt-6">
                  <div className="max-w-sm">
                    <label className="text-xs text-gray-500">Funcionário</label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        placeholder="Comece digitando o nome"
                        value={gestorSearch}
                        onChange={e => setGestorSearch(e.target.value)}
                        className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                      />
                      <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      {gestorSearch && filteredGestores.length > 0 && (
                        <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10 max-h-48 overflow-y-auto">
                          {filteredGestores.map(emp => (
                            <li
                              key={emp.id}
                              className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm"
                              onClick={() => handleAddGestor(emp)}
                            >
                              {emp.nomeCompleto} <span className="text-xs text-gray-400">({emp.cargo})</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {gestorSearch && filteredGestores.length === 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-10 px-4 py-2 text-sm text-gray-500">
                          Nenhum funcionário encontrado
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs text-gray-500 mb-1">Funcionários selecionados</label>
                  <div className="flex flex-wrap gap-2">
                    {gestoresSelecionados.map(emp => (
                      <span key={emp.id} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                        {emp.nomeCompleto}
                        <button type="button" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveGestor(emp.id)}>
                          ×
                        </button>
                      </span>
                    ))}
                    {gestoresSelecionados.length > 0 && (
                      <button type="button" className="ml-2 text-xs text-red-500 hover:underline" onClick={handleRemoveTodosGestores}>
                        Remover todos
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-300"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium"
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}


            {currentStep === 3 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900">3. Funcionários</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Selecione os funcionários que deseja adicionar à equipe e depois clique na seta para a direita.
                  Você pode também mover o funcionário de volta clicando na seta para a esquerda.
                </p>

                <div className="border-t mt-4 pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
                    {/* Coluna Esquerda */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">Funcionários</h3>
                        <label className="flex items-center gap-2 text-xs text-gray-500">
                          <input type="checkbox" className="rounded border-gray-300" />
                          Selecione todos {selectedAvailableIds.length}/{availableEmployees.length}
                        </label>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="p-4 border-b">
                          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3">
                            <div>
                              <label className="text-xs text-gray-500">Filtra por</label>
                              <div className="mt-1">
                                <Select
                                  value={filterLeft}
                                  onChange={(value) => { setFilterLeft(String(value)); setSearchLeft('') }}
                                  options={filterOptions}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">{filterLabel(filterLeft)}</label>
                              <div className="relative mt-1">
                                <input
                                  type="text"
                                  placeholder="Digite..."
                                  value={searchLeft}
                                  onChange={(e) => setSearchLeft(e.target.value)}
                                  className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                                />
                                <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-3 text-right">
                            Exibindo {availableEmployees.length} de {availableEmployeesBase.length} funcionários
                          </div>
                        </div>

                        <div className="p-4 space-y-3 bg-gray-100">
                          {availableEmployees.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center py-6">
                              Nenhum funcionário cadastrado.
                            </div>
                          ) : (
                            availableEmployees.map((employee) => (
                              <button
                                key={employee.id}
                                type="button"
                                onClick={() => toggleAvailable(employee.id)}
                                className={`w-full text-left bg-gray-200 rounded-lg p-4 border ${
                                  selectedAvailableIds.includes(employee.id)
                                    ? 'border-indigo-600 ring-2 ring-indigo-200'
                                    : 'border-transparent'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-semibold text-sm text-gray-900">{employee.nomeCompleto}</div>
                                  <Eye size={16} className="text-gray-500" />
                                </div>
                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                  <div>Departamento: {getEmployeeDepartmentName(employee)}</div>
                                  <div>Cargo: {employee.cargo || '-'}</div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col items-center gap-3 pt-24">
                      <button
                        type="button"
                        onClick={moveToTeam}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={moveToAvailable}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    </div>

                    {/* Coluna Direita */}
                    <div>
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">Funcionários da equipe</h3>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="p-4 border-b">
                          <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3">
                            <div>
                              <label className="text-xs text-gray-500">Filtra por</label>
                              <div className="mt-1">
                                <Select
                                  value={filterRight}
                                  onChange={(value) => { setFilterRight(String(value)); setSearchRight('') }}
                                  options={filterOptions}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">{filterLabel(filterRight)}</label>
                              <div className="relative mt-1">
                                <input
                                  type="text"
                                  placeholder="Digite..."
                                  value={searchRight}
                                  onChange={(e) => setSearchRight(e.target.value)}
                                  className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                                />
                                <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-3 bg-gray-100">
                          {teamEmployees.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center py-6">
                              Nenhum funcionário selecionado.
                            </div>
                          ) : (
                            teamEmployees.map((employee) => (
                              <button
                                key={employee.id}
                                type="button"
                                onClick={() => toggleTeam(employee.id)}
                                className={`w-full text-left bg-gray-200 rounded-lg p-4 border ${
                                  selectedTeamIds.includes(employee.id)
                                    ? 'border-indigo-600 ring-2 ring-indigo-200'
                                    : 'border-transparent'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-semibold text-sm text-gray-900">{employee.nomeCompleto}</div>
                                  <Eye size={16} className="text-gray-500" />
                                </div>
                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                  <div>Departamento: {getEmployeeDepartmentName(employee)}</div>
                                  <div>Cargo: {employee.cargo || '-'}</div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-300"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium"
                  >
                    Finalizar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamCreate
