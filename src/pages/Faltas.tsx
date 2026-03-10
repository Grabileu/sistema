import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2, Plus, Search } from 'lucide-react'
import { Employee } from '../App'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'

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
}

const Faltas: React.FC<FaltasProps> = ({ employees, faltas, onNavigate, onDeleteFalta, positions = [], departments = [], teams = [] }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Refs para focar nos campos
  const dataFimRef = useRef<HTMLInputElement>(null)

  // Estado para controlar abertura automática do calendário da data fim
  const [autoOpenDataFim, setAutoOpenDataFim] = useState(false)

  // Estados para os filtros de entrada (não aplicados automaticamente)
  const [inputDataInicio, setInputDataInicio] = useState('')
  const [inputDataFim, setInputDataFim] = useState('')
  const [inputCargoFilter, setInputCargoFilter] = useState('')
  const [inputDepartamentoFilter, setInputDepartamentoFilter] = useState('')
  const [inputEquipeFilter, setInputEquipeFilter] = useState('')

  // Estados para os filtros aplicados (usados na filtragem)
  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    dataInicio: '',
    dataFim: '',
    cargoFilter: '',
    departamentoFilter: '',
    equipeFilter: ''
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    if (appliedFilters.cargoFilter || appliedFilters.departamentoFilter || appliedFilters.equipeFilter) {
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
      equipeFilter: inputEquipeFilter
    })
  }

  const handleDataInicioChange = (value: string) => {
    setInputDataInicio(value)
    // Pular para o campo de data fim após selecionar data início
    if (value && dataFimRef.current) {
      setTimeout(() => {
        dataFimRef.current?.focus()
        // Abrir o calendário automaticamente após focar
        setAutoOpenDataFim(true)
        // Resetar o estado após um curto período
        setTimeout(() => setAutoOpenDataFim(false), 100)
      }, 100)
    }
  }

  const handleDeleteFalta = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro de falta?')) {
      onDeleteFalta?.(id)
      setOpenMenuId(null)
    }
  }

  const handleAddFalta = () => {
    onNavigate?.('adicionar-falta')
  }

  const handleEditFalta = (id: string) => {
    onNavigate?.(`editar-falta?id=${id}`)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 relative">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Nome do funcionário
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200 rounded-md pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Data início
              </label>
              <DatePicker
                value={inputDataInicio}
                onChange={handleDataInicioChange}
                placeholder="Selecionar data"
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
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handlePesquisar}
              className="w-40 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
            >
              Pesquisar
            </button>
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
                        {falta.data}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {falta.motivo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {falta.criadoEm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === falta.id ? null : falta.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openMenuId === falta.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
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
                                handleDeleteFalta(falta.id)
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
