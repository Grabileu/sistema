import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2, Plus, Search } from 'lucide-react'
import { Employee } from '../App'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'
import { buildStoreOptions, focusNext, handleKeyDown, formatDate } from '../utils/formatters'
import { useClickOutside } from '../hooks/useClickOutside'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

interface Falta {
  id: string
  funcionarioId: string
  funcionarioNome: string
  data: string
  motivo: string
  criadoEm: string
}

interface FaltasProps {
  employees: Employee[]
  faltas: Falta[]
  onNavigate?: (route: string) => void
  onDeleteFalta?: (id: string) => void
  positions?: any[]
  departments?: any[]
  teams?: any[]
  businessUnits?: any[]
}

const Faltas: React.FC<FaltasProps> = ({ employees, faltas, onNavigate, onDeleteFalta, positions = [], departments = [], teams = [], businessUnits = [] }) => {
  const standardFieldClass = 'rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'

  const [searchQuery, setSearchQuery] = useState('')
  const [companyData, setCompanyData] = useState<any>(() => {
    const companyDataStr = localStorage.getItem('companyData')
    if (companyDataStr) {
      try {
        return JSON.parse(companyDataStr)
      } catch {}
    }
    return null
  })
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isActionMenuUpward, setIsActionMenuUpward] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; funcionarioNome: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Refs para focar nos campos
  const nomeFilterRef = useRef<HTMLInputElement>(null)
  const dataInicioRef = useRef<HTMLInputElement>(null)
  const dataFimRef = useRef<HTMLInputElement>(null)
  const cargoRef = useRef<HTMLButtonElement>(null)
  const departamentoRef = useRef<HTMLButtonElement>(null)
  const equipeRef = useRef<HTMLButtonElement>(null)
  const lojaRef = useRef<HTMLButtonElement>(null)
  const pesquisarRef = useRef<HTMLButtonElement>(null)

  // Estado para controlar abertura automática do calendário da data fim
  const [autoOpenDataFim, setAutoOpenDataFim] = useState(false)

  // Estados para os filtros de entrada (não aplicados automaticamente)
  const [inputDataInicio, setInputDataInicio] = useState('')
  const [inputDataFim, setInputDataFim] = useState('')
  const [inputCargoFilter, setInputCargoFilter] = useState('')
  const [inputDepartamentoFilter, setInputDepartamentoFilter] = useState('')
  const [inputEquipeFilter, setInputEquipeFilter] = useState('')
  const [inputLojaFilter, setInputLojaFilter] = useState('')

  // Estados para os filtros aplicados (usados na filtragem)
  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    dataInicio: '',
    dataFim: '',
    cargoFilter: '',
    departamentoFilter: '',
    equipeFilter: '',
    lojaFilter: ''
  })

  useClickOutside(menuRef, () => setOpenMenuId(null))

  const resolveActionMenuDirection = (button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect()
    const estimatedMenuHeight = 120
    const margin = 12
    const spaceBelow = window.innerHeight - rect.bottom - margin
    const spaceAbove = rect.top - margin
    const wouldOverflowBottom = rect.bottom + estimatedMenuHeight + margin > window.innerHeight

    setIsActionMenuUpward(wouldOverflowBottom && spaceAbove > spaceBelow)
  }

  const toggleActionMenu = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenuId === id) {
      setOpenMenuId(null)
      return
    }

    resolveActionMenuDirection(event.currentTarget)
    setOpenMenuId(id)
  }

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

  const storeOptions = buildStoreOptions(businessUnits, companyData)

  const filteredFaltas = faltas.filter((falta) => {
    // Filtro por nome do funcionário
    if (appliedFilters.searchQuery.trim() && !falta.funcionarioNome.toLowerCase().includes(appliedFilters.searchQuery.trim().toLowerCase())) {
      return false
    }

    // Filtro por data início
    if (appliedFilters.dataInicio) {
      const faltaDate = new Date(falta.data.split('/').reverse().join('-'))
      const inicioDate = new Date(appliedFilters.dataInicio.split('/').reverse().join('-'))
      if (faltaDate < inicioDate) {
        return false
      }
    }

    // Filtro por data fim
    if (appliedFilters.dataFim) {
      const faltaDate = new Date(falta.data.split('/').reverse().join('-'))
      const fimDate = new Date(appliedFilters.dataFim.split('/').reverse().join('-'))
      if (faltaDate > fimDate) {
        return false
      }
    }

    // Filtros por cargo, departamento e equipe
    if (
      appliedFilters.cargoFilter ||
      appliedFilters.departamentoFilter ||
      appliedFilters.equipeFilter ||
      appliedFilters.lojaFilter
    ) {
      const employee = employees.find(e => e.id === falta.funcionarioId)
      if (!employee) return false

      if (appliedFilters.cargoFilter && employee.cargo !== appliedFilters.cargoFilter) {
        return false
      }

      if (appliedFilters.departamentoFilter) {
        // Para departamento, precisamos verificar se a equipe do funcionário pertence ao departamento
        const team = teams.find(t => t.nome === employee.equipe)
        if (!team || team.departamentoNome !== appliedFilters.departamentoFilter) {
          return false
        }
      }

      if (appliedFilters.equipeFilter && employee.equipe !== appliedFilters.equipeFilter) {
        return false
      }

      if (appliedFilters.lojaFilter && employee.loja !== appliedFilters.lojaFilter) {
        return false
      }
    }

    return true
  })

  const handlePesquisar = () => {
    setAppliedFilters({
      searchQuery: searchQuery,
      dataInicio: inputDataInicio,
      dataFim: inputDataFim,
      cargoFilter: inputCargoFilter,
      departamentoFilter: inputDepartamentoFilter,
      equipeFilter: inputEquipeFilter,
      lojaFilter: inputLojaFilter
    })
  }

  const handleDataInicioChange = (value: string) => {
    setInputDataInicio(value)
    // Pular para o campo de data fim após selecionar data início
    const isCompleteDate = /^\d{2}\/\d{2}\/\d{4}$/.test(value)
    if (isCompleteDate && dataFimRef.current) {
      setTimeout(() => {
        dataFimRef.current?.focus()
        // Abrir o calendário automaticamente após focar
        setAutoOpenDataFim(true)
        // Resetar o estado após um curto período
        setTimeout(() => setAutoOpenDataFim(false), 100)
      }, 100)
    }
  }

  const handleDeleteFalta = (id: string, funcionarioNome: string) => {
    setPendingDelete({ id, funcionarioNome })
    setOpenMenuId(null)
  }

  const confirmDeleteFalta = () => {
    if (!pendingDelete) return
    onDeleteFalta?.(pendingDelete.id)
    setPendingDelete(null)
  }

  const cancelDeleteFalta = () => {
    setPendingDelete(null)
  }

  const handleAddFalta = () => {
    onNavigate?.('adicionar-falta')
  }

  const handleEditFalta = (id: string) => {
    onNavigate?.(`editar-falta?id=${id}`)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {pendingDelete && (
        <DeleteConfirmModal
          title="Excluir falta"
          description="Tem certeza que deseja excluir o registro abaixo?"
          itemName={pendingDelete.funcionarioNome}
          onConfirm={confirmDeleteFalta}
          onCancel={cancelDeleteFalta}
        />
      )}

      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Faltas</h1>
          <button
            onClick={handleAddFalta}
            className="w-fit bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 justify-center"
          >
            <Plus size={18} />
            Adicionar falta
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 relative">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Nome do funcionário
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={nomeFilterRef}
                  type="text"
                  placeholder="Pesquisar por nome"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, dataInicioRef)}
                  className="w-full bg-gray-100 border border-gray-200 rounded-md pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Data início
              </label>
              <DatePicker
                ref={dataInicioRef}
                value={inputDataInicio}
                onChange={handleDataInicioChange}
                placeholder="Selecionar data"
                className={standardFieldClass}
                nextRef={dataFimRef}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Data fim
              </label>
              <DatePicker
                ref={dataFimRef}
                value={inputDataFim}
                onChange={setInputDataFim}
                placeholder="Selecionar data"
                autoOpen={autoOpenDataFim}
                className={standardFieldClass}
                nextRef={cargoRef}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Cargo
              </label>
              <Select
                value={inputCargoFilter}
                onChange={(value) => setInputCargoFilter(String(value))}
                options={[
                  { label: 'Todos', value: '' },
                  ...positions.map((p) => ({
                    label: p.nome,
                    value: p.nome
                  }))
                ]}
                buttonClassName={standardFieldClass}
                buttonRef={cargoRef}
                nextRef={departamentoRef}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Departamento
              </label>
              <Select
                value={inputDepartamentoFilter}
                onChange={(value) => setInputDepartamentoFilter(String(value))}
                options={[
                  { label: 'Todos', value: '' },
                  ...departments.map((d) => ({
                    label: d.nome,
                    value: d.nome
                  }))
                ]}
                buttonClassName={standardFieldClass}
                buttonRef={departamentoRef}
                nextRef={equipeRef}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Equipe
              </label>
              <Select
                value={inputEquipeFilter}
                onChange={(value) => setInputEquipeFilter(String(value))}
                options={[
                  { label: 'Todos', value: '' },
                  ...teams.map((t) => ({
                    label: t.nome,
                    value: t.nome
                  }))
                ]}
                buttonClassName={standardFieldClass}
                buttonRef={equipeRef}
                nextRef={lojaRef}
              />
            </div>

            {/* unidade filter moved next to button */}
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Loja
              </label>
              <Select
                value={inputLojaFilter}
                onChange={(value) => setInputLojaFilter(String(value))}
                options={storeOptions}
                buttonClassName={standardFieldClass}
                buttonRef={lojaRef}
                nextRef={pesquisarRef}
              />
            </div>
            <div className="flex items-end">
              <button 
                ref={pesquisarRef}
                onClick={handlePesquisar}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
              >
                Pesquisar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-visible">
          {filteredFaltas.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">Nenhuma falta registrada</p>
              <button
                onClick={handleAddFalta}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded font-medium hover:bg-indigo-700"
              >
                Adicionar primeira falta
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border-b text-right text-sm text-gray-600">
                Página 1/1 - Exibindo {filteredFaltas.length} de {filteredFaltas.length} registros
              </div>

              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Funcionário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Motivo
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
                  {filteredFaltas.map((falta) => (
                    <tr key={falta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {falta.funcionarioNome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(falta.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {falta.motivo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {falta.criadoEm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                        <button
                          onClick={(event) => toggleActionMenu(falta.id, event)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openMenuId === falta.id && (
                          <div
                            ref={menuRef}
                            className={`absolute right-0 w-40 max-h-[min(16rem,calc(100vh-2rem))] overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white shadow-lg z-10 ${isActionMenuUpward ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                          >
                            <button
                              onClick={() => {
                                handleEditFalta(falta.id)
                                setOpenMenuId(null)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                            >
                              <Edit2 size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteFalta(falta.id, falta.funcionarioNome)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                            >
                              <Trash2 size={16} />
                              Excluir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Faltas
