import React, { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ArrowLeft, ArrowRight, Filter, Search, User } from 'lucide-react'
import { parseDateString } from '../utils/formatters'

interface EmployeeResumo {
  id: string
  nomeCompleto: string
  cargo?: string
}

interface LancamentoLicencaResumo {
  id?: string
  tipoLicenca?: string
  colaboradorId?: string | null
  colaboradorNome?: string
  funcionarioId?: string | null
  funcionarioNome?: string
  nomeColaborador?: string
  nomeFuncionario?: string
  nome?: string
  dataInicio?: string
  dataTermino?: string
}

type EventoColaborador =
  | { id: string; tipo: 'falta'; motivo: string; data: Date }
  | { id: string; tipo: 'atraso'; motivo: string; data: Date }
  | { id: string; tipo: 'licenca'; subtipo: string; dataInicio: Date; dataTermino: Date }
  | { id: string; tipo: 'admissao'; data: Date }
  | { id: string; tipo: 'demissao'; data: Date }

interface ColaboradorCalendario {
  key: string
  nome: string
  cargo: string
  color: string
  eventos: EventoColaborador[]
}

interface FeriadoResumo {
  nome?: string
  data?: string
  recorrente?: boolean
  ativo?: boolean
}

const weekDays = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SAB.']
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]



const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .toLowerCase()
    .trim()

const parseFeriadoDateParts = (value: string): { day: number; month: number; year?: number } | null => {
  const raw = String(value || '').trim()
  if (!raw) return null

  if (/^\d{2}\/\d{2}$/.test(raw)) {
    const [day, month] = raw.split('/').map(Number)
    if (!day || !month) return null
    const date = new Date(2000, month - 1, day)
    if (Number.isNaN(date.getTime()) || date.getDate() !== day || date.getMonth() !== month - 1) {
      return null
    }
    return { day, month }
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split('/').map(Number)
    if (!day || !month || !year) return null
    const date = new Date(year, month - 1, day)
    if (
      Number.isNaN(date.getTime()) ||
      date.getDate() !== day ||
      date.getMonth() !== month - 1 ||
      date.getFullYear() !== year
    ) {
      return null
    }
    return { day, month, year }
  }

  return null
}

const buildAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E0E7EF&color=2563EB`

const hashString = (value: string) =>
  value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

const resolveLancamentoNome = (item: LancamentoLicencaResumo, employeeNameById: Map<string, string>) => {
  const id = String(item.colaboradorId || item.funcionarioId || '').trim()
  if (id && employeeNameById.has(id)) {
    return String(employeeNameById.get(id) || '').trim()
  }

  const nomeCandidatos = [
    item.colaboradorNome,
    item.funcionarioNome,
    item.nomeColaborador,
    item.nomeFuncionario,
    item.nome,
  ]

  for (const nome of nomeCandidatos) {
    const valor = String(nome || '').trim()
    if (valor) return valor
  }

  return 'Colaborador sem nome'
}

const isInRange = (date: Date, start: Date, end: Date) => date >= start && date <= end

const Calendar: React.FC = () => {
  const today = new Date()
  const [monthIdx, setMonthIdx] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const handleStorage = () => setRefreshKey((prev) => prev + 1)
    const handleFocus = () => setRefreshKey((prev) => prev + 1)

    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const month = months[monthIdx]
  const startOfCurrentMonth = new Date(year, monthIdx, 1)
  const endOfCurrentMonth = new Date(year, monthIdx, daysInMonth)

  const feriadosByDay = useMemo(() => {
    let feriados: FeriadoResumo[] = []
    const feriadosRaw = localStorage.getItem('feriados')

    if (feriadosRaw) {
      try {
        const parsed = JSON.parse(feriadosRaw)
        if (Array.isArray(parsed)) {
          feriados = parsed
        }
      } catch {
        feriados = []
      }
    }

    const feriadosMap = new Map<number, string[]>()

    feriados.forEach((feriado, index) => {
      if (feriado.ativo === false) return

      const parsedDate = parseFeriadoDateParts(String(feriado.data || ''))
      if (!parsedDate) return
      if (parsedDate.month !== monthIdx + 1) return

      const recorrente = feriado.recorrente !== false
      if (!recorrente && parsedDate.year && parsedDate.year !== year) return

      const nome = String(feriado.nome || `Feriado ${index + 1}`).trim() || `Feriado ${index + 1}`
      const dayList = feriadosMap.get(parsedDate.day) || []
      dayList.push(nome)
      feriadosMap.set(parsedDate.day, dayList)
    })

    feriadosMap.forEach((list, day) => {
      feriadosMap.set(day, [...list].sort((a, b) => a.localeCompare(b, 'pt-BR')))
    })

    return feriadosMap
  }, [monthIdx, refreshKey, year])

  const feriadosDoMes = useMemo(
    () => Array.from(feriadosByDay.entries()).sort((a, b) => a[0] - b[0]),
    [feriadosByDay]
  )

  const colaboradores = useMemo<ColaboradorCalendario[]>(() => {
    let employees: any[] = []
    const employeesRaw = localStorage.getItem('employees')
    if (employeesRaw) {
      try {
        const parsed = JSON.parse(employeesRaw)
        if (Array.isArray(parsed)) {
          employees = parsed
            .filter((emp) => emp && typeof emp === 'object')
            .map((emp) => ({
              ...emp,
              id: String(emp.id || ''),
              nomeCompleto: String(emp.nomeCompleto || ''),
              cargo: String(emp.cargo || emp.funcao || 'Sem cargo definido'),
            }))
            .filter((emp) => emp.id && emp.nomeCompleto)
        }
      } catch {
        employees = []
      }
    }

    // Faltas
    let faltas: any[] = []
    const faltasRaw = localStorage.getItem('faltas')
    if (faltasRaw) {
      try {
        const parsed = JSON.parse(faltasRaw)
        if (Array.isArray(parsed)) faltas = parsed
      } catch { faltas = [] }
    }

    // Atrasos
    let atrasos: any[] = []
    const atrasosRaw = localStorage.getItem('atrasos')
    if (atrasosRaw) {
      try {
        const parsed = JSON.parse(atrasosRaw)
        if (Array.isArray(parsed)) atrasos = parsed
      } catch { atrasos = [] }
    }

    // Licenças/afastamentos/atestados/férias
    let licencas: LancamentoLicencaResumo[] = []
    const licencasRaw = localStorage.getItem('lancamentosLicenca')
    if (licencasRaw) {
      try {
        const parsed = JSON.parse(licencasRaw)
        if (Array.isArray(parsed)) licencas = parsed
      } catch { licencas = [] }
    }

    // Demitidos
    let demitidos: any[] = []
    const demitidosRaw = localStorage.getItem('demitidos')
    if (demitidosRaw) {
      try {
        const parsed = JSON.parse(demitidosRaw)
        if (Array.isArray(parsed)) demitidos = parsed
      } catch { demitidos = [] }
    }

    const colaboradoresMap = new Map<string, ColaboradorCalendario>()
    employees.forEach((employee) => {
      colaboradoresMap.set(employee.id, {
        key: employee.id,
        nome: employee.nomeCompleto,
        cargo: employee.cargo || 'Sem cargo definido',
        color: '', // cor removida
        eventos: [],
      })
    })

    // Admissão
    employees.forEach((emp) => {
      if (emp.dataAdmissao) {
        const data = parseDateString(emp.dataAdmissao)
        if (data) {
          const colab = colaboradoresMap.get(emp.id)
          if (colab) colab.eventos.push({ id: `admissao-${emp.id}`, tipo: 'admissao', data })
        }
      }
    })

    // Demissão
    demitidos.forEach((dem) => {
      if (dem.id && dem.dataDemissao) {
        const data = parseDateString(dem.dataDemissao)
        if (data) {
          const colab = colaboradoresMap.get(dem.id)
          if (colab) colab.eventos.push({ id: `demissao-${dem.id}`, tipo: 'demissao', data })
        }
      }
    })

    // Faltas (impede duplicidade no mesmo dia)
    faltas.forEach((falta) => {
      if (falta.funcionarioId && falta.data) {
        const data = parseDateString(falta.data)
        if (data) {
          const colab = colaboradoresMap.get(falta.funcionarioId)
          if (colab && !colab.eventos.some(ev => ev.tipo === 'falta' && ev.data && ev.data.getTime() === data.getTime())) {
            colab.eventos.push({ id: falta.id, tipo: 'falta', motivo: falta.motivo, data })
          }
        }
      }
    })

    // Atrasos (impede duplicidade no mesmo dia)
    atrasos.forEach((atraso) => {
      if (atraso.funcionarioId && atraso.data) {
        const data = parseDateString(atraso.data)
        if (data) {
          const colab = colaboradoresMap.get(atraso.funcionarioId)
          if (colab && !colab.eventos.some(ev => ev.tipo === 'atraso' && ev.data && ev.data.getTime() === data.getTime())) {
            colab.eventos.push({ id: atraso.id, tipo: 'atraso', motivo: atraso.motivo, data })
          }
        }
      }
    })

    // Licenças/afastamentos/atestados/férias (impede duplicidade de qualquer licença no mesmo dia)
    licencas.forEach((item, index) => {
      const dataInicio = parseDateString(String(item.dataInicio || ''))
      if (!dataInicio) return
      const dataTerminoInformada = parseDateString(String(item.dataTermino || ''))
      const dataTermino = dataTerminoInformada && dataTerminoInformada >= dataInicio ? dataTerminoInformada : dataInicio
      const id = String(item.colaboradorId || item.funcionarioId || '').trim()
      if (!id) return
      const colab = colaboradoresMap.get(id)
      if (colab) {
        // Não permitir duas licenças de qualquer subtipo no mesmo dia de início
        const jaExiste = colab.eventos.some(ev => ev.tipo === 'licenca' && ev.dataInicio && ev.dataInicio.getTime() === dataInicio.getTime())
        if (!jaExiste) {
          colab.eventos.push({
            id: String(item.id || `licenca-${index}`),
            tipo: 'licenca',
            subtipo: String(item.tipoLicenca || 'Afastamento'),
            dataInicio,
            dataTermino,
          })
        }
      }
    })

    // Filtro de busca
    const termo = normalizeText(search)
    return Array.from(colaboradoresMap.values())
      .filter((colaborador) => colaborador.eventos.length > 0)
      .filter((colaborador) => !termo || normalizeText(colaborador.nome).includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [endOfCurrentMonth, refreshKey, search, startOfCurrentMonth])

  const goToPreviousMonth = () => {
    if (monthIdx === 0) {
      setMonthIdx(11)
      setYear((prev) => prev - 1)
      return
    }
    setMonthIdx((prev) => prev - 1)
  }

  const goToNextMonth = () => {
    if (monthIdx === 11) {
      setMonthIdx(0)
      setYear((prev) => prev + 1)
      return
    }
    setMonthIdx((prev) => prev + 1)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cabeçalho branco igual aos outros */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <CalendarDays size={28} className="text-blue-700 mr-2" />
          <h1 className="text-xl font-semibold text-gray-900">Calendário</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} className="text-blue-700" />
            <span className="font-semibold text-lg">{month} {year}</span>
            <button className="ml-2 p-1 rounded hover:bg-gray-100" onClick={goToPreviousMonth}>
              <ArrowLeft size={18} />
            </button>
            <button className="p-1 rounded hover:bg-gray-100" onClick={goToNextMonth}>
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar colaborador"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 rounded border border-gray-200 text-sm bg-white"
              />
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50">
              <Filter size={16} />
              Filtrar
            </button>
          </div>
        </div>

        <div className="rounded-2xl shadow-lg bg-[#f5f6f8] overflow-x-auto border border-gray-300 relative w-full">
          <table className="min-w-full border-separate border-spacing-0 w-full">
            <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-[240px] min-w-[240px] max-w-[240px] py-1 px-1 text-left text-gray-700 font-bold border-r border-b border-gray-300 bg-[#e4e7ec] align-middle">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-gray-500" />
                  <span className="text-gray-600 font-semibold text-base">Colaboradores</span>
                </div>
              </th>
              {days.map((day) => {
                const feriadosNoDia = feriadosByDay.get(day) || [];
                const hasFeriado = feriadosNoDia.length > 0;
                const isToday = day === today.getDate() && monthIdx === today.getMonth() && year === today.getFullYear();

                return (
                  <th
                    key={day}
                    title={hasFeriado ? `Feriado: ${feriadosNoDia.join(', ')}` : undefined}
                    className={`w-[80px] min-w-[80px] max-w-[80px] py-1 px-1 text-center text-gray-700 font-bold border-r border-b border-gray-300 align-middle ${day === 1 ? 'border-l border-gray-300' : ''} ${isToday ? 'bg-blue-100' : hasFeriado ? 'bg-yellow-100' : 'bg-[#e4e7ec]'}`}
                  >
                    <div className="flex flex-col justify-center h-full items-center">
                      <span className="text-base font-bold relative flex items-center justify-center" style={{height: '28px'}}>
                        {isToday && (
                          <span className="absolute w-7 h-7 rounded-full bg-blue-600 opacity-80" style={{zIndex:0}}></span>
                        )}
                        <span className={isToday ? 'relative z-10 text-white font-bold' : ''}>{day}</span>
                      </span>
                      <span className="text-[10px] text-gray-400">{weekDays[new Date(year, monthIdx, day).getDay()]}</span>
                      {hasFeriado && (
                        <span className="text-[10px] text-yellow-700 font-semibold mt-0.5" style={{lineHeight:'1'}}>
                          {feriadosNoDia.join(', ')}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {colaboradores.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="px-4 py-6 text-sm text-gray-500 bg-white border-r border-b border-gray-300 text-center">Nenhum lancamento encontrado para este filtro.</td>
              </tr>
            )}
            {colaboradores.map((colab) => (
              <tr key={colab.key}>
                <th scope="row" className="w-[240px] min-w-[240px] max-w-[240px] h-16 border-r border-b border-gray-300 bg-white align-middle font-normal">
                  <div className="flex items-center gap-2">
                    <img src={buildAvatarUrl(colab.nome)} alt={colab.nome} className="w-9 h-9 rounded-full border border-blue-100" />
                    <div className="min-w-0 flex-1 flex flex-col justify-center text-left">
                      <span className="text-blue-700 font-semibold text-sm leading-tight truncate">{colab.nome}</span>
                      <span className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">{colab.cargo}</span>
                    </div>
                  </div>
                </th>
                {days.map((day) => {
                  const date = new Date(year, monthIdx, day)
                  date.setHours(0, 0, 0, 0)
                  const feriadosNoDia = feriadosByDay.get(day) || []
                  const hasFeriado = feriadosNoDia.length > 0

                  // Encontrar eventos do dia (para cada tipo)
                  const eventosNoDia = colab.eventos.filter((evento) => {
                    if (evento.tipo === 'licenca') {
                      return isInRange(date, evento.dataInicio, evento.dataTermino)
                    } else if (evento.tipo === 'falta' || evento.tipo === 'atraso' || evento.tipo === 'admissao' || evento.tipo === 'demissao') {
                      return (
                        evento.data.getFullYear() === date.getFullYear() &&
                        evento.data.getMonth() === date.getMonth() &&
                        evento.data.getDate() === date.getDate()
                      )
                    }
                    return false
                  })

                  const ativo = eventosNoDia.length > 0
                  // Tooltip detalhado para todos os tipos
                  const lancamentosTooltip = eventosNoDia.map((evento) => {
                    if (evento.tipo === 'licenca') {
                      return `${evento.subtipo}: ${evento.dataInicio.toLocaleDateString('pt-BR')} a ${evento.dataTermino.toLocaleDateString('pt-BR')}`
                    } else if (evento.tipo === 'falta') {
                      return `Falta: ${evento.motivo}`
                    } else if (evento.tipo === 'atraso') {
                      return `Atraso: ${evento.motivo}`
                    } else if (evento.tipo === 'admissao') {
                      return `Admissão`
                    } else if (evento.tipo === 'demissao') {
                      return `Demissão`
                    }
                    return ''
                  }).join('\n')
                  const tooltip = lancamentosTooltip

                  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
                  return (
                    <td
                      key={`${colab.key}-${day}`}
                      title={tooltip || undefined}
                      className={`w-[80px] min-w-[80px] max-w-[80px] h-16 border-r border-b border-gray-300 transition align-middle ${day === 1 ? 'border-l border-gray-300' : ''} ${isToday ? 'bg-blue-100' : 'bg-[#f5f6f8]'}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full w-full gap-0.5">
                        {eventosNoDia.map((evento, idx) => {
                          let label = ''
                          let cor = ''
                          if (evento.tipo === 'falta') {
                            label = 'Falta'
                            cor = 'bg-red-100 text-red-800 border-red-300'
                          } else if (evento.tipo === 'atraso') {
                            label = 'Atrasado'
                            cor = 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          } else if (evento.tipo === 'licenca') {
                            if (evento.subtipo && evento.subtipo.trim().length > 0) {
                              label = evento.subtipo.trim()
                            } else {
                              label = 'Licença'
                            }
                            // Atestado azul, Férias verde, outros licenças verde
                            if (label.toLowerCase().includes('atestado')) {
                              cor = 'bg-blue-100 text-blue-800 border-blue-300'
                            } else if (label.toLowerCase().includes('férias')) {
                              cor = 'bg-green-100 text-green-800 border-green-300'
                            } else {
                              cor = 'bg-green-100 text-green-800 border-green-300'
                            }
                          } else if (evento.tipo === 'admissao') {
                            label = 'Admissão'
                            cor = 'bg-purple-100 text-purple-800 border-purple-300'
                          } else if (evento.tipo === 'demissao') {
                            label = 'Demissão'
                            cor = 'bg-gray-300 text-gray-700 border-gray-400'
                          }
                          return (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded-full border text-[11px] font-semibold shadow-sm ${cor} mb-0.5`}
                              style={{minWidth: '40px', maxWidth: '90px', textAlign: 'center', whiteSpace: 'normal', overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: '1.1'}}
                            >
                              {label}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Calendar
