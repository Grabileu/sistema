import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  MoreHorizontal,
  Pencil,
  Filter,
  ListFilter,
  PlusCircle,
  Trash2,
  X,
  Users
} from 'lucide-react'
import Select from '../components/Select'
import DatePicker from '../components/DatePicker'
import { parseDateString } from '../utils/formatters'

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]

const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

const licencaCatalogoBase = [
  'Férias',
  'Afastamento',
  'Atestado médico',
  'Licença Remunerada',
  'Licença',
  'Licença Maternidade',
  'Licença Paternidade',
  'Férias Coletiva',
  'Folga',
  'INSS',
  'Treinamento',
  'Justiça',
  'Happy Day',
  'Esqueci de Registrar',
  'Sem internet no momento de registrar',
  'Folga abonada',
  'Admissão',
  'Atestado médico - Invalidado',
  'Teletrabalho',
  'Acidente de Trabalho',
  'Outros',
  'Serviço Externo',
  'Quarentena',
  'Suspensão Contrato de Trabalho',
  'Serviço Obrigatório',
  'Licença Nojo',
  'Licença Gala',
  'Pleito Eleitoral',
  'Recesso Escolar',
  'Declaração de Comparecimento',
  'Recesso',
  'Rescisão',
  'Folga coletiva',
  'Exame de retorno ao trabalho',
  'Atestado de Amamentação',
  'Banco de horas',
  'Falecimento unilateral',
  'Falecimento colateral',
  'Liberados',
  'Obra Paralisada',
  'Licença não Remunerada',
  'Licença Gestante',
  'Suspensão Disciplinar',
  'Acompanhamento',
  'Folga de Campo',
  'SAT - Seguro Acidente de Trabalho',
  'Aposentadoria por invalidez',
  'Redução de jornada',
  'Atestado médico assid',
  'DP - FÉRIAS COLETIVAS',
]

const distinctEmployeeColors = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
  '#bcbd22', '#17becf', '#393b79', '#637939', '#8c6d31', '#843c39', '#7b4173', '#3182bd',
  '#31a354', '#756bb1', '#636363', '#e6550d', '#969696', '#dd1c77', '#6baed6', '#74c476',
]

const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

const buildEmployeeColorMap = (employeeKeys: string[]) => {
  const uniqueKeys = Array.from(new Set(employeeKeys)).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const colorMap = new Map<string, string>()
  const usedPaletteIndexes = new Set<number>()

  uniqueKeys.forEach((key, index) => {
    const paletteLength = distinctEmployeeColors.length
    let paletteIndex = hashString(key) % paletteLength
    let attempts = 0

    while (usedPaletteIndexes.has(paletteIndex) && attempts < paletteLength) {
      paletteIndex = (paletteIndex + 7) % paletteLength
      attempts += 1
    }

    if (attempts < paletteLength) {
      usedPaletteIndexes.add(paletteIndex)
      colorMap.set(key, distinctEmployeeColors[paletteIndex])
      return
    }

    // Fallback para muitos colaboradores: gera nova cor sem repetir exatamente as anteriores.
    const hue = Math.floor((index * 137.508) % 360)
    colorMap.set(key, `hsl(${hue} 85% 42%)`)
  })

  return colorMap
}

interface CalendarDayEvent {
  lancamentoId: string
  employeeKey: string
  employeeName: string
  tipoLicenca: string
  dataInicio: string
  dataTermino: string
  status: 'Agendado' | 'Em andamento' | 'Encerrado'
  cid?: string
  observacao?: string
  color: string
}

interface CalendarFeriado {
  id: string
  nome: string
  tipo: string
}

interface SelectedCalendarDay {
  month: number
  day: number
  events: CalendarDayEvent[]
  feriados: CalendarFeriado[]
}

interface HoverCalendarDay {
  month: number
  day: number
  events: CalendarDayEvent[]
  feriados: CalendarFeriado[]
  totalEvents: number
  hiddenEventsCount: number
  left: number
  top: number
}

interface CalendarMonthProps {
  month: number
  year: number
  isCurrentMonth: boolean
  currentDay: number
  isLarge?: boolean
  dayEventsByDay: Map<number, CalendarDayEvent[]>
  feriadosByDay?: Map<number, CalendarFeriado[]>
  selectedDay?: number | null
  onDayClick?: (month: number, day: number, events: CalendarDayEvent[], feriados: CalendarFeriado[]) => void
  onDayHover?: (month: number, day: number, events: CalendarDayEvent[], feriados: CalendarFeriado[], targetRect: DOMRect) => void
  onDayLeave?: () => void
  onMonthSummaryClick?: (month: number) => void
}

function CalendarMonth({
  month,
  year,
  isCurrentMonth,
  currentDay,
  isLarge = false,
  dayEventsByDay,
  feriadosByDay,
  selectedDay,
  onDayClick,
  onDayHover,
  onDayLeave,
  onMonthSummaryClick,
}: CalendarMonthProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const blanks = Array(firstDay).fill(null)
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const cells = [...blanks, ...monthDays]

  return (
    <article className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${isLarge ? 'rounded-3xl' : ''}`}>
      <header className={`flex items-center justify-between border-b border-slate-100 bg-slate-50/80 ${isLarge ? 'px-6 py-5' : 'px-4 py-3'}`}>
        <div>
          <p className={`${isLarge ? 'text-lg' : 'text-sm'} font-semibold text-slate-800`}>{months[month]}</p>
          <p className={`${isLarge ? 'text-xs' : 'text-[11px]'} text-slate-500`}>{year}</p>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentMonth && (
            <span className={`rounded-full bg-blue-100 font-semibold text-blue-700 ${isLarge ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]'}`}>
              Mês atual
            </span>
          )}
          {onMonthSummaryClick && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onMonthSummaryClick(month)
              }}
              className={`inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 ${isLarge ? 'h-8 w-8' : 'h-6 w-6'}`}
              aria-label={`Ver resumo de ${months[month]}`}
            >
              <Eye size={isLarge ? 15 : 13} />
            </button>
          )}
        </div>
      </header>

      <div className={isLarge ? 'p-5' : 'p-3'}>
        <div className={`grid grid-cols-7 font-semibold uppercase tracking-wide text-slate-400 ${isLarge ? 'mb-4 gap-2 text-xs' : 'mb-2 gap-1 text-[11px]'}`}>
          {days.map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>

        <div className={`grid grid-cols-7 ${isLarge ? 'gap-2 text-base' : 'gap-1 text-sm'}`}>
          {cells.map((day, index) => {
            const isEmpty = !day
            const weekday = index % 7
            const isWeekend = weekday === 0 || weekday === 6
            const isToday = isCurrentMonth && day === currentDay
            const dayEvents = !isEmpty && day ? dayEventsByDay.get(day) || [] : []
            const dayFeriados = !isEmpty && day ? feriadosByDay?.get(day) || [] : []
            const hasEvents = dayEvents.length > 0
            const hasFeriados = dayFeriados.length > 0
            const isSelectedDay = Boolean(day && selectedDay === day)
            const uniqueEvents = Array.from(
              new Map(dayEvents.map((event) => [`${event.employeeKey}-${event.tipoLicenca}`, event])).values()
            )
            const uniqueColors = Array.from(new Set(uniqueEvents.map((event) => event.color))).slice(0, 3)
            const overflowEventsCount = uniqueEvents.length - uniqueColors.length

            return (
              <div
                key={`${month}-${index}`}
                onMouseEnter={(event) => {
                  if (!day || !onDayHover || (dayEvents.length === 0 && dayFeriados.length === 0)) return
                  onDayHover(month, day, dayEvents, dayFeriados, event.currentTarget.getBoundingClientRect())
                }}
                onMouseLeave={() => {
                  if (!onDayLeave) return
                  onDayLeave()
                }}
                onClick={() => {
                  if (!day || !onDayClick) return
                  onDayClick(month, day, dayEvents, dayFeriados)
                }}
                style={
                  !isToday
                    ? hasEvents
                      ? {
                          backgroundColor: `${uniqueColors[0]}22`,
                          boxShadow: hasFeriados
                            ? `inset 0 0 0 1px ${uniqueColors[0]}66, inset 0 0 0 2px #fda4af`
                            : `inset 0 0 0 1px ${uniqueColors[0]}66`,
                        }
                      : hasFeriados
                        ? {
                            backgroundColor: '#fff1f2',
                            boxShadow: 'inset 0 0 0 1px #fda4af',
                          }
                        : undefined
                    : undefined
                }
                className={[
                  `relative flex items-center justify-center font-medium transition-colors ${isLarge ? 'h-20 rounded-lg' : 'h-8 rounded-md'}`,
                  !isEmpty ? 'cursor-pointer' : '',
                  isEmpty ? 'pointer-events-none text-transparent' : 'text-slate-700 hover:bg-slate-100',
                  !hasEvents && hasFeriados && !isToday ? 'text-rose-700 hover:bg-rose-100' : '',
                  isWeekend && !isEmpty ? 'text-slate-500' : '',
                  isSelectedDay && !isToday ? 'ring-2 ring-blue-400 ring-offset-1' : '',
                  isToday ? 'bg-blue-600 text-white hover:bg-blue-600' : ''
                ].join(' ')}
              >
                {day || ''}
                {!isToday && hasFeriados && (
                  <span className={`pointer-events-none absolute rounded-full bg-rose-500 ${isLarge ? 'left-1.5 top-1.5 h-2 w-2' : 'left-1 top-1 h-1.5 w-1.5'}`} />
                )}
                {!isToday && hasEvents && (
                  <>
                    <span className={`pointer-events-none absolute rounded bg-white/85 px-1 font-semibold leading-none text-slate-600 ${isLarge ? 'right-1 top-1 text-[10px]' : 'right-0.5 top-0.5 text-[8px]'}`}>
                      {uniqueEvents.length}
                    </span>
                    <div className={`pointer-events-none absolute inset-x-0 bottom-0 flex overflow-hidden ${isLarge ? 'h-1.5 rounded-b-lg' : 'h-1 rounded-b-md'}`}>
                      {uniqueColors.map((color) => (
                        <span
                          key={`${month}-${index}-${color}`}
                          className="h-full flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      {overflowEventsCount > 0 && (
                        <span className="h-full w-2 bg-slate-400" />
                      )}
                    </div>
                  </>
                )}
                {!isToday && !hasEvents && !hasFeriados && !isEmpty && (
                  <span className={`pointer-events-none absolute rounded-full bg-slate-200 ${isLarge ? 'bottom-1 h-0.5 w-4' : 'bottom-0.5 h-0.5 w-3'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}

interface FeriasEAfastamentosProps {
  onNovoLancamento?: () => void
}

interface EmployeeResumo {
  id: string
  nomeCompleto: string
  dataAdmissao?: string
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
  cid?: string
  observacao?: string
}

interface FeriadoResumo {
  id?: string
  nome?: string
  data?: string
  tipo?: string
  recorrente?: boolean
  ativo?: boolean
}

interface AusenciaDetalhe {
  nome: string
  dias: number
  afastamentos: Array<{
    lancamentoId: string
    tipoLicenca: string
    dataInicio: string
    dataTermino: string
    dias: number
    cid?: string
    observacao?: string
  }>
}

interface PendenciaDetalhe {
  nome: string
  diasPendencia: number
}

interface FeriasIniciandoDetalhe {
  lancamentoId: string
  tipoLicenca: string
  nome: string
  diasParaInicio: number
}

interface FeriasEmAndamentoDetalhe {
  lancamentoId: string
  tipoLicenca: string
  nome: string
  diasParaTermino: number
}

interface PendingDeleteFerias {
  lancamentoId: string
  nome: string
}

interface AusenciaDetalhesModal {
  nome: string
  afastamentos: Array<{
    lancamentoId: string
    tipoLicenca: string
    dataInicio: string
    dataTermino: string
    dias: number
    cid?: string
    observacao?: string
  }>
}

interface ResumoAnualLancamentoDetalhe {
  lancamentoId: string
  nome: string
  tipoLicenca: string
  dataInicio: string
  dataTermino: string
  cid?: string
  observacao?: string
  sortTimestamp: number
}

interface ResumoAnualMes {
  monthIndex: number
  afastamentos: ResumoAnualLancamentoDetalhe[]
  atestados: ResumoAnualLancamentoDetalhe[]
  ferias: ResumoAnualLancamentoDetalhe[]
}

interface ResumoAnualPorFuncionario {
  nome: string
  quantidade: number
  itens: ResumoAnualLancamentoDetalhe[]
}

type FiltroStatus = 'agendado' | 'em_andamento' | 'encerrado'

const parseFeriadoDateParts = (value: string): { day: number; month: number; year?: number } | null => {
  const raw = String(value || '').trim()
  if (!raw) return null

  if (/^\d{2}\/\d{2}$/.test(raw)) {
    const [day, month] = raw.split('/').map(Number)
    if (!day || !month) return null

    const date = new Date(2000, month - 1, day)
    if (isNaN(date.getTime()) || date.getDate() !== day || date.getMonth() !== month - 1) {
      return null
    }

    return { day, month }
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split('/').map(Number)
    if (!day || !month || !year) return null

    const date = new Date(year, month - 1, day)
    if (
      isNaN(date.getTime()) ||
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

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const formatPendenciaTempo = (diasPendencia: number) => {
  const dias = Math.max(0, diasPendencia)

  if (dias <= 30) {
    return dias === 1 ? '1 dia' : `${dias} dias`
  }

  const meses = Math.floor(dias / 30)
  const diasRestantes = dias % 30
  const mesesTexto = meses === 1 ? '1 mês' : `${meses} meses`

  if (diasRestantes === 0) {
    return mesesTexto
  }

  const diasTexto = diasRestantes === 1 ? '1 dia' : `${diasRestantes} dias`
  return `${mesesTexto} e ${diasTexto}`
}

const formatDiasTexto = (dias: number) => (dias === 1 ? '1 dia' : `${dias} dias`)

const formatDateLabel = (date: Date | null) => {
  if (!date) return '--/--/----'
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const getLancamentoNome = (item: LancamentoLicencaResumo, employeeNameById: Map<string, string>) => {
  const idCandidates = [item.colaboradorId, item.funcionarioId]
    .map((value) => String(value || '').trim())
    .filter((value) => value.length > 0)

  for (const id of idCandidates) {
    const nomeById = employeeNameById.get(id)
    if (nomeById && nomeById.trim()) {
      return nomeById.trim()
    }
  }

  const nameCandidates = [
    item.colaboradorNome,
    item.funcionarioNome,
    item.nomeColaborador,
    item.nomeFuncionario,
    item.nome,
  ]
    .map((value) => String(value || '').trim())
    .filter((value) => value.length > 0)

  if (nameCandidates.length > 0) {
    return nameCandidates[0]
  }

  return 'Colaborador não informado'
}

const agruparResumoPorFuncionario = (itens: ResumoAnualLancamentoDetalhe[]): ResumoAnualPorFuncionario[] => {
  const map = new Map<string, ResumoAnualPorFuncionario>()

  itens.forEach((item) => {
    const key = normalizeText(item.nome) || item.nome
    const existente = map.get(key)

    if (existente) {
      existente.quantidade += 1
      existente.itens.push(item)
      return
    }

    map.set(key, {
      nome: item.nome,
      quantidade: 1,
      itens: [item],
    })
  })

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      itens: [...group.itens].sort((a, b) => b.sortTimestamp - a.sortTimestamp),
    }))
    .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR'))
}

const FeriasEAfastamentos: React.FC<FeriasEAfastamentosProps> = ({ onNovoLancamento }) => {
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(today.getFullYear())
  const [viewMode, setViewMode] = useState<'anual' | 'mensal'>('mensal')
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [refreshKey, setRefreshKey] = useState(0)
  const [menuFeriasAbertoId, setMenuFeriasAbertoId] = useState<string | null>(null)
  const [pendingDeleteFerias, setPendingDeleteFerias] = useState<PendingDeleteFerias | null>(null)
  const [ausenciaDetalhesModal, setAusenciaDetalhesModal] = useState<AusenciaDetalhesModal | null>(null)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<SelectedCalendarDay | null>(null)
  const [hoverCalendarDay, setHoverCalendarDay] = useState<HoverCalendarDay | null>(null)
  const [showFeriasInfoModal, setShowFeriasInfoModal] = useState(false)
  const [selectedResumoAnualMes, setSelectedResumoAnualMes] = useState<number | null>(null)
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false)
  const [nomeBuscaFuncionario, setNomeBuscaFuncionario] = useState('')
  const [nomeBuscaFuncionarioAplicado, setNomeBuscaFuncionarioAplicado] = useState('')
  const [showNomeBuscaSugestoes, setShowNomeBuscaSugestoes] = useState(false)
  const [employeeFilterSearch, setEmployeeFilterSearch] = useState('')
  const [tipoFilterSearch, setTipoFilterSearch] = useState('')
  const [selectedEmployeeFilters, setSelectedEmployeeFilters] = useState<string[]>([])
  const [selectedTipoFilters, setSelectedTipoFilters] = useState<string[]>([])
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<FiltroStatus[]>([])
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataTermino, setFiltroDataTermino] = useState('')
  const [filtroSomenteComCid, setFiltroSomenteComCid] = useState(false)
  const [filtroSomenteComObservacao, setFiltroSomenteComObservacao] = useState(false)
  const [draftSelectedEmployeeFilters, setDraftSelectedEmployeeFilters] = useState<string[]>([])
  const [draftSelectedTipoFilters, setDraftSelectedTipoFilters] = useState<string[]>([])
  const [draftSelectedStatusFilters, setDraftSelectedStatusFilters] = useState<FiltroStatus[]>([])
  const [draftFiltroDataInicio, setDraftFiltroDataInicio] = useState('')
  const [draftFiltroDataTermino, setDraftFiltroDataTermino] = useState('')
  const [draftFiltroSomenteComCid, setDraftFiltroSomenteComCid] = useState(false)
  const [draftFiltroSomenteComObservacao, setDraftFiltroSomenteComObservacao] = useState(false)
  const filtroDataInicioRef = useRef<HTMLInputElement | null>(null)
  const filtroDataTerminoRef = useRef<HTMLInputElement | null>(null)
  const nomeBuscaContainerRef = useRef<HTMLDivElement | null>(null)
  const monthlyCalendarWrapperRef = useRef<HTMLDivElement | null>(null)
  const monthlyTimelineRef = useRef<HTMLDivElement | null>(null)
  const [monthlyCalendarHeight, setMonthlyCalendarHeight] = useState<number | null>(null)

  const isCurrentYear = year === today.getFullYear()
  const isMonthlyView = viewMode === 'mensal'

  const getLancamentoStatus = (dataInicio: Date, dataTermino: Date): 'Agendado' | 'Em andamento' | 'Encerrado' => {
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    if (dataInicio > startOfToday) {
      return 'Agendado'
    }

    if (dataTermino < startOfToday) {
      return 'Encerrado'
    }

    return 'Em andamento'
  }

  const getStatusStyles = (status: CalendarDayEvent['status']) => {
    if (status === 'Agendado') return 'bg-amber-100 text-amber-700'
    if (status === 'Encerrado') return 'bg-slate-100 text-slate-600'
    return 'bg-emerald-100 text-emerald-700'
  }

  const {
    employeesFromStorage,
    lancamentosFromStorage,
    employeeNameByIdFromStorage,
  } = useMemo(() => {
    let employees: EmployeeResumo[] = []
    const employeesRaw = localStorage.getItem('employees')
    if (employeesRaw) {
      try {
        const parsed = JSON.parse(employeesRaw)
        if (Array.isArray(parsed)) {
          employees = parsed
            .filter((emp) => emp && typeof emp === 'object')
            .map((emp) => ({
              id: String(emp.id || ''),
              nomeCompleto: String(emp.nomeCompleto || ''),
              dataAdmissao: String(emp.dataAdmissao || ''),
            }))
            .filter((emp) => emp.id && emp.nomeCompleto)
        }
      } catch {
        employees = []
      }
    }

    let lancamentos: LancamentoLicencaResumo[] = []
    const lancamentosRaw = localStorage.getItem('lancamentosLicenca')
    if (lancamentosRaw) {
      try {
        const parsed = JSON.parse(lancamentosRaw)
        if (Array.isArray(parsed)) {
          lancamentos = parsed
        }
      } catch {
        lancamentos = []
      }
    }

    const employeeNameById = new Map<string, string>()
    employees.forEach((employee) => {
      employeeNameById.set(employee.id, employee.nomeCompleto)
    })

    return {
      employeesFromStorage: employees,
      lancamentosFromStorage: lancamentos,
      employeeNameByIdFromStorage: employeeNameById,
    }
  }, [refreshKey])

  const getStatusByPeriodo = (dataInicio: Date, dataTermino: Date): FiltroStatus => {
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (dataInicio > startOfToday) return 'agendado'
    if (dataTermino < startOfToday) return 'encerrado'
    return 'em_andamento'
  }

  const filtroPeriodoInicioDate = useMemo(() => {
    if (!filtroDataInicio) return null
    return parseDateString(filtroDataInicio)
  }, [filtroDataInicio])

  const filtroPeriodoTerminoDate = useMemo(() => {
    if (!filtroDataTermino) return null
    return parseDateString(filtroDataTermino)
  }, [filtroDataTermino])

  const employeeFilterOptions = useMemo(() => {
    const map = new Map<string, string>()
    const usageCountMap = new Map<string, number>()

    employeesFromStorage.forEach((employee) => {
      const label = employee.nomeCompleto.trim()
      if (!label) return
      map.set(normalizeText(label), label)
    })

    lancamentosFromStorage.forEach((item) => {
      const nome = getLancamentoNome(item, employeeNameByIdFromStorage).trim()
      if (!nome) return
      const key = normalizeText(nome)

      usageCountMap.set(key, (usageCountMap.get(key) || 0) + 1)

      if (!map.has(key)) {
        map.set(key, nome)
      }
    })

    return Array.from(map.entries())
      .map(([value, label]) => ({
        value,
        label,
        usageCount: usageCountMap.get(value) || 0,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  }, [employeeNameByIdFromStorage, employeesFromStorage, lancamentosFromStorage])

  const tipoFilterOptions = useMemo(() => {
    const map = new Map<string, { label: string; order: number }>()
    const usageCountMap = new Map<string, number>()

    licencaCatalogoBase.forEach((label, index) => {
      const key = normalizeText(label)
      if (!map.has(key)) {
        map.set(key, { label, order: index })
      }
    })

    lancamentosFromStorage.forEach((item) => {
      const label = String(item.tipoLicenca || 'Afastamento').trim() || 'Afastamento'
      const key = normalizeText(label)

      usageCountMap.set(key, (usageCountMap.get(key) || 0) + 1)

      if (!map.has(key)) {
        map.set(key, { label, order: 1000 + map.size })
      }
    })

    return Array.from(map.entries())
      .map(([value, meta]) => ({
        value,
        label: meta.label,
        order: meta.order,
        usageCount: usageCountMap.get(value) || 0,
      }))
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order
        return a.label.localeCompare(b.label, 'pt-BR')
      })
  }, [lancamentosFromStorage])

  const filteredEmployeeFilterOptions = useMemo(() => {
    const query = normalizeText(employeeFilterSearch)
    if (!query) return employeeFilterOptions
    return employeeFilterOptions.filter((option) => normalizeText(option.label).includes(query))
  }, [employeeFilterOptions, employeeFilterSearch])

  const filteredTipoFilterOptions = useMemo(() => {
    const query = normalizeText(tipoFilterSearch)
    if (!query) return tipoFilterOptions
    return tipoFilterOptions.filter((option) => normalizeText(option.label).includes(query))
  }, [tipoFilterOptions, tipoFilterSearch])

  const nomeBuscaFuncionarioNormalizado = useMemo(
    () => normalizeText(nomeBuscaFuncionario),
    [nomeBuscaFuncionario]
  )

  const nomeBuscaFuncionarioAplicadoNormalizado = useMemo(
    () => normalizeText(nomeBuscaFuncionarioAplicado),
    [nomeBuscaFuncionarioAplicado]
  )

  const nomeBuscaSugestoes = useMemo(() => {
    if (!nomeBuscaFuncionarioNormalizado) return []

    return employeeFilterOptions
      .filter((option) => normalizeText(option.label).includes(nomeBuscaFuncionarioNormalizado))
      .slice(0, 8)
  }, [employeeFilterOptions, nomeBuscaFuncionarioNormalizado])

  const statusFilterOptions: Array<{ value: FiltroStatus; label: string }> = [
    { value: 'agendado', label: 'Agendado' },
    { value: 'em_andamento', label: 'Em andamento' },
    { value: 'encerrado', label: 'Encerrado' },
  ]

  const employeeFilterLabelByValue = useMemo(
    () => new Map(employeeFilterOptions.map((option) => [option.value, option.label])),
    [employeeFilterOptions]
  )

  const tipoFilterLabelByValue = useMemo(
    () => new Map(tipoFilterOptions.map((option) => [option.value, option.label])),
    [tipoFilterOptions]
  )

  const filtrosAtivosCount = useMemo(() => {
    let count = 0
    if (selectedEmployeeFilters.length > 0) count += 1
    if (selectedTipoFilters.length > 0) count += 1
    if (selectedStatusFilters.length > 0) count += 1
    if (filtroDataInicio || filtroDataTermino) count += 1
    if (filtroSomenteComCid) count += 1
    if (filtroSomenteComObservacao) count += 1
    return count
  }, [
    filtroDataInicio,
    filtroDataTermino,
    filtroSomenteComCid,
    filtroSomenteComObservacao,
    selectedEmployeeFilters.length,
    selectedStatusFilters.length,
    selectedTipoFilters.length,
  ])

  const draftFiltrosSelecionadosCount = useMemo(() => {
    let count = 0
    if (draftSelectedEmployeeFilters.length > 0) count += 1
    if (draftSelectedTipoFilters.length > 0) count += 1
    if (draftSelectedStatusFilters.length > 0) count += 1
    if (draftFiltroDataInicio || draftFiltroDataTermino) count += 1
    if (draftFiltroSomenteComCid) count += 1
    if (draftFiltroSomenteComObservacao) count += 1
    return count
  }, [
    draftFiltroDataInicio,
    draftFiltroDataTermino,
    draftFiltroSomenteComCid,
    draftFiltroSomenteComObservacao,
    draftSelectedEmployeeFilters.length,
    draftSelectedStatusFilters.length,
    draftSelectedTipoFilters.length,
  ])

  const toggleInArray = <T extends string>(
    value: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const limparFiltros = () => {
    setEmployeeFilterSearch('')
    setTipoFilterSearch('')
    setDraftSelectedEmployeeFilters([])
    setDraftSelectedTipoFilters([])
    setDraftSelectedStatusFilters([])
    setDraftFiltroDataInicio('')
    setDraftFiltroDataTermino('')
    setDraftFiltroSomenteComCid(false)
    setDraftFiltroSomenteComObservacao(false)
  }

  const abrirFiltros = () => {
    setEmployeeFilterSearch('')
    setTipoFilterSearch('')
    setDraftSelectedEmployeeFilters([...selectedEmployeeFilters])
    setDraftSelectedTipoFilters([...selectedTipoFilters])
    setDraftSelectedStatusFilters([...selectedStatusFilters])
    setDraftFiltroDataInicio(filtroDataInicio)
    setDraftFiltroDataTermino(filtroDataTermino)
    setDraftFiltroSomenteComCid(filtroSomenteComCid)
    setDraftFiltroSomenteComObservacao(filtroSomenteComObservacao)
    setShowFiltersDrawer(true)
  }

  const aplicarFiltros = () => {
    setSelectedEmployeeFilters([...draftSelectedEmployeeFilters])
    setSelectedTipoFilters([...draftSelectedTipoFilters])
    setSelectedStatusFilters([...draftSelectedStatusFilters])
    setFiltroDataInicio(draftFiltroDataInicio)
    setFiltroDataTermino(draftFiltroDataTermino)
    setFiltroSomenteComCid(draftFiltroSomenteComCid)
    setFiltroSomenteComObservacao(draftFiltroSomenteComObservacao)
    setShowFiltersDrawer(false)
  }

  const matchesLancamentoFilters = (
    item: LancamentoLicencaResumo,
    employeeNameById: Map<string, string>
  ) => {
    const tipoLicenca = String(item.tipoLicenca || 'Afastamento').trim() || 'Afastamento'
    const tipoNormalizado = normalizeText(tipoLicenca)

    const nome = getLancamentoNome(item, employeeNameById)
    const nomeNormalizado = normalizeText(nome)

    if (nomeBuscaFuncionarioAplicadoNormalizado && !nomeNormalizado.includes(nomeBuscaFuncionarioAplicadoNormalizado)) {
      return false
    }

    const dataInicio = item.dataInicio ? parseDateString(String(item.dataInicio)) : null
    const dataTerminoInformada = item.dataTermino ? parseDateString(String(item.dataTermino)) : null
    const dataTermino = dataInicio && dataTerminoInformada && dataTerminoInformada >= dataInicio
      ? dataTerminoInformada
      : dataInicio

    if (selectedEmployeeFilters.length > 0 && !selectedEmployeeFilters.includes(nomeNormalizado)) {
      return false
    }

    if (selectedTipoFilters.length > 0 && !selectedTipoFilters.includes(tipoNormalizado)) {
      return false
    }

    if (selectedStatusFilters.length > 0) {
      if (!dataInicio || !dataTermino) return false
      const status = getStatusByPeriodo(dataInicio, dataTermino)
      if (!selectedStatusFilters.includes(status)) {
        return false
      }
    }

    if (filtroPeriodoInicioDate || filtroPeriodoTerminoDate) {
      if (!dataInicio || !dataTermino) return false
      if (filtroPeriodoInicioDate && dataTermino < filtroPeriodoInicioDate) return false
      if (filtroPeriodoTerminoDate && dataInicio > filtroPeriodoTerminoDate) return false
    }

    if (filtroSomenteComCid && !String(item.cid || '').trim()) {
      return false
    }

    if (filtroSomenteComObservacao && !String(item.observacao || '').trim()) {
      return false
    }

    return true
  }

  useEffect(() => {
    const handleStorageRefresh = () => setRefreshKey((prev) => prev + 1)
    window.addEventListener('storage', handleStorageRefresh)
    return () => window.removeEventListener('storage', handleStorageRefresh)
  }, [])

  useEffect(() => {
    if (!showNomeBuscaSugestoes) return

    const handleClickOutsideNomeBusca = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (nomeBuscaContainerRef.current?.contains(target)) return
      setShowNomeBuscaSugestoes(false)
    }

    document.addEventListener('mousedown', handleClickOutsideNomeBusca)
    return () => document.removeEventListener('mousedown', handleClickOutsideNomeBusca)
  }, [showNomeBuscaSugestoes])

  const handleNomeBuscaChange = (value: string) => {
    setNomeBuscaFuncionario(value)
    setShowNomeBuscaSugestoes(Boolean(value.trim()))

    if (!value.trim()) {
      setNomeBuscaFuncionarioAplicado('')
    }
  }

  const selecionarNomeBusca = (label: string) => {
    setNomeBuscaFuncionario(label)
    setNomeBuscaFuncionarioAplicado(label)
    setShowNomeBuscaSugestoes(false)
  }

  useEffect(() => {
    if (!menuFeriasAbertoId) return

    const handleClickOutsideMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      if (target.closest('[data-ferias-menu]') || target.closest('[data-ferias-menu-trigger]')) {
        return
      }

      setMenuFeriasAbertoId(null)
    }

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuFeriasAbertoId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutsideMenu)
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMenu)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [menuFeriasAbertoId])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPendingDeleteFerias(null)
        setAusenciaDetalhesModal(null)
        setSelectedCalendarDay(null)
        setShowFeriasInfoModal(false)
        setSelectedResumoAnualMes(null)
        setShowFiltersDrawer(false)
      }
    }

    if (pendingDeleteFerias || ausenciaDetalhesModal || selectedCalendarDay || showFeriasInfoModal || selectedResumoAnualMes !== null || showFiltersDrawer) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'auto'
    }
  }, [pendingDeleteFerias, ausenciaDetalhesModal, selectedCalendarDay, showFeriasInfoModal, selectedResumoAnualMes, showFiltersDrawer])

  const {
    pendenciasFerias,
    feriasAgendadas,
    feriasEmAndamento,
    ausenciasMes,
    ausenciasDetalhesMes,
    pendenciasDetalhes,
    feriasAgendadasDetalhes,
    feriasEmAndamentoDetalhes,
  } = useMemo(() => {
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const referenceMonth = selectedMonth
    const referenceDay = Math.min(today.getDate(), new Date(year, referenceMonth + 1, 0).getDate())
    const startOfReferenceDate = new Date(year, referenceMonth, referenceDay)
    const startOfReferenceMonth = new Date(year, referenceMonth, 1)
    const endOfReferenceMonth = new Date(year, referenceMonth + 1, 0)

    const employees = employeesFromStorage
    const lancamentos = lancamentosFromStorage.filter((item) =>
      matchesLancamentoFilters(item, employeeNameByIdFromStorage)
    )

    const lancamentosFerias = lancamentos.filter((item) =>
      normalizeText(String(item.tipoLicenca || '')).includes('ferias')
    )

    // Pendencias de ferias nao devem depender dos filtros ativos (tipo/categoria/status etc.).
    const lancamentosFeriasSemFiltro = lancamentosFromStorage.filter((item) =>
      normalizeText(String(item.tipoLicenca || '')).includes('ferias')
    )

    const employeeNameById = new Map<string, string>()
    employees.forEach((employee) => {
      employeeNameById.set(employee.id, employee.nomeCompleto)
    })

    const feriasAgendadasMap = new Map<string, { lancamentoId: string; tipoLicenca: string; nome: string; diasParaInicio: number }>()
    const feriasEmAndamentoMap = new Map<string, { lancamentoId: string; tipoLicenca: string; nome: string; diasParaTermino: number }>()

    lancamentosFerias.forEach((item, index) => {
      if (!item.dataInicio) return

      const inicio = parseDateString(String(item.dataInicio))
      if (!inicio) return

      const dataTerminoInformada = item.dataTermino ? parseDateString(String(item.dataTermino)) : null
      const termino = dataTerminoInformada && dataTerminoInformada >= inicio ? dataTerminoInformada : inicio

      const nome = getLancamentoNome(item, employeeNameById)
      const lancamentoId = String(item.id || `agendado-${index}`)
      const tipoLicenca = String(item.tipoLicenca || 'Férias')

      const keyBase = String(item.colaboradorId || item.funcionarioId || '').trim() || normalizeText(nome)
      const key = keyBase || `agendado-${index}`

      const intersectsReferenceMonth = inicio <= endOfReferenceMonth && termino >= startOfReferenceMonth
      if (!intersectsReferenceMonth) {
        return
      }

      const startsInReferenceMonth = inicio >= startOfReferenceMonth && inicio <= endOfReferenceMonth

      if (inicio > startOfReferenceDate && startsInReferenceMonth) {
        const diasParaInicio = Math.max(0, Math.floor((inicio.getTime() - startOfReferenceDate.getTime()) / (1000 * 60 * 60 * 24)))
        const existenteAgendado = feriasAgendadasMap.get(key)

        if (!existenteAgendado || diasParaInicio < existenteAgendado.diasParaInicio) {
          feriasAgendadasMap.set(key, { lancamentoId, tipoLicenca, nome, diasParaInicio })
        }
        return
      }

      const isInProgressAtReferenceDate = inicio <= startOfReferenceDate && termino >= startOfReferenceDate
      if (isInProgressAtReferenceDate) {
        const diasParaTermino = Math.max(0, Math.floor((termino.getTime() - startOfReferenceDate.getTime()) / (1000 * 60 * 60 * 24)))
        const existenteEmAndamento = feriasEmAndamentoMap.get(key)

        if (!existenteEmAndamento || diasParaTermino < existenteEmAndamento.diasParaTermino) {
          feriasEmAndamentoMap.set(key, { lancamentoId, tipoLicenca, nome, diasParaTermino })
        }
      }
    })

    const ausenciasPorColaborador = new Map<string, number>()
    const ausenciasPorColaboradorDetalhes = new Map<string, Array<{ lancamentoId: string; tipoLicenca: string; dataInicio: string; dataTermino: string; dias: number; cid?: string; observacao?: string }>>()

    lancamentos.forEach((item, index) => {
      const tipoLicenca = normalizeText(String(item.tipoLicenca || ''))
      if (tipoLicenca.includes('ferias')) return

      if (!item.dataInicio) return
      const dataInicio = parseDateString(String(item.dataInicio))
      if (!dataInicio) return

      const dataTerminoInformada = item.dataTermino ? parseDateString(String(item.dataTermino)) : null
      const dataTermino = dataTerminoInformada && dataTerminoInformada >= dataInicio ? dataTerminoInformada : dataInicio

      const inicioNoMes = dataInicio > startOfReferenceMonth ? dataInicio : startOfReferenceMonth
      const terminoNoMes = dataTermino < endOfReferenceMonth ? dataTermino : endOfReferenceMonth

      if (inicioNoMes > terminoNoMes) return

      const diasNoMes = Math.floor((terminoNoMes.getTime() - inicioNoMes.getTime()) / (1000 * 60 * 60 * 24)) + 1

      const nomeColaborador = getLancamentoNome(item, employeeNameById)
      const tipoLicencaLabel = String(item.tipoLicenca || 'Afastamento').trim() || 'Afastamento'
      const lancamentoId = String(item.id || `ausencia-${index}`)

      const acumuladoAtual = ausenciasPorColaborador.get(nomeColaborador) || 0
      ausenciasPorColaborador.set(nomeColaborador, acumuladoAtual + diasNoMes)

      const detalhesAtuais = ausenciasPorColaboradorDetalhes.get(nomeColaborador) || []
      detalhesAtuais.push({
        lancamentoId,
        tipoLicenca: tipoLicencaLabel,
        dataInicio: formatDateLabel(dataInicio),
        dataTermino: formatDateLabel(dataTermino),
        dias: diasNoMes,
        cid: item.cid ? String(item.cid) : undefined,
        observacao: item.observacao ? String(item.observacao) : undefined,
      })
      ausenciasPorColaboradorDetalhes.set(nomeColaborador, detalhesAtuais)
    })

    const detalhesAusencias: AusenciaDetalhe[] = Array.from(ausenciasPorColaborador.entries())
      .map(([nome, dias]) => {
        const afastamentos = (ausenciasPorColaboradorDetalhes.get(nome) || [])
          .sort((a, b) => {
            if (b.dias !== a.dias) {
              return b.dias - a.dias
            }
            return a.tipoLicenca.localeCompare(b.tipoLicenca, 'pt-BR')
          })

        return { nome, dias, afastamentos }
      })
      .sort((a, b) => b.dias - a.dias)

    const ausenciasNoMes = detalhesAusencias.length

  let pendencias = 0
    const pendenciasInfos: PendenciaDetalhe[] = []

    for (const employee of employees) {
      if (!employee.dataAdmissao || !employee.dataAdmissao.trim()) {
        continue
      }

      const admissao = parseDateString(employee.dataAdmissao)
      if (!admissao) continue

      const dataElegivel = new Date(admissao.getFullYear() + 1, admissao.getMonth(), admissao.getDate())
      // Pendencia deve seguir a data real (hoje), sem projetar para o ano selecionado no filtro.
      if (dataElegivel > startOfToday) continue

      const employeeNormName = normalizeText(employee.nomeCompleto)

      const lancamentosDoColaborador = lancamentosFeriasSemFiltro.filter((item) => {
        const idMatch = item.colaboradorId && String(item.colaboradorId) === employee.id
        const nameMatch = !idMatch && item.colaboradorNome && normalizeText(String(item.colaboradorNome)) === employeeNormName
        return Boolean(idMatch || nameMatch)
      })

      let hasFeriasIniciadas = false
      let hasFeriasAgendadas = false

      for (const lancamento of lancamentosDoColaborador) {
        if (!lancamento.dataInicio) continue
        const inicio = parseDateString(String(lancamento.dataInicio))
        if (!inicio) continue

        if (inicio <= startOfToday) {
          hasFeriasIniciadas = true
        } else {
          hasFeriasAgendadas = true
        }
      }

      if (hasFeriasAgendadas) {
      } else if (!hasFeriasIniciadas) {
        pendencias += 1
        const diasPendencia = Math.max(0, Math.floor((startOfToday.getTime() - dataElegivel.getTime()) / (1000 * 60 * 60 * 24)) + 1)

        pendenciasInfos.push({
          nome: employee.nomeCompleto,
          diasPendencia,
        })
      }
    }

    const detalhesPendencias: PendenciaDetalhe[] = pendenciasInfos.sort((a, b) => {
      if (b.diasPendencia !== a.diasPendencia) {
        return b.diasPendencia - a.diasPendencia
      }
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })

    const detalhesFeriasAgendadas: FeriasIniciandoDetalhe[] = Array.from(feriasAgendadasMap.values()).sort((a, b) => {
      if (a.diasParaInicio !== b.diasParaInicio) {
        return a.diasParaInicio - b.diasParaInicio
      }
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })

    const detalhesFeriasEmAndamento: FeriasEmAndamentoDetalhe[] = Array.from(feriasEmAndamentoMap.values()).sort((a, b) => {
      if (a.diasParaTermino !== b.diasParaTermino) {
        return a.diasParaTermino - b.diasParaTermino
      }
      return a.nome.localeCompare(b.nome, 'pt-BR')
    })

    const totalFeriasAgendadas = detalhesFeriasAgendadas.length
    const totalFeriasEmAndamento = detalhesFeriasEmAndamento.length

    return {
      pendenciasFerias: pendencias,
      feriasAgendadas: totalFeriasAgendadas,
      feriasEmAndamento: totalFeriasEmAndamento,
      ausenciasMes: ausenciasNoMes,
      ausenciasDetalhesMes: detalhesAusencias,
      pendenciasDetalhes: detalhesPendencias,
      feriasAgendadasDetalhes: detalhesFeriasAgendadas,
      feriasEmAndamentoDetalhes: detalhesFeriasEmAndamento,
    }
  }, [
    employeeNameByIdFromStorage,
    employeesFromStorage,
    lancamentosFromStorage,
    matchesLancamentoFilters,
    selectedMonth,
    today,
    year,
  ])

  const calendarDayEventsByMonth = useMemo(() => {
    const startOfSelectedYear = new Date(year, 0, 1)
    const endOfSelectedYear = new Date(year, 11, 31)

    const employees = employeesFromStorage
    const lancamentos = lancamentosFromStorage.filter((item) =>
      matchesLancamentoFilters(item, employeeNameByIdFromStorage)
    )

    const employeeNameById = new Map<string, string>()
    employees.forEach((employee) => {
      employeeNameById.set(employee.id, employee.nomeCompleto)
    })

    const eventsByMonth = new Map<number, Map<number, CalendarDayEvent[]>>()

    const normalizedLancamentos = lancamentos
      .map((item, index) => {
        const dataInicio = parseDateString(String(item.dataInicio || ''))
        if (!dataInicio) return null

        const dataTerminoInformada = parseDateString(String(item.dataTermino || ''))
        const dataTermino = dataTerminoInformada && dataTerminoInformada >= dataInicio ? dataTerminoInformada : dataInicio

        if (dataTermino < startOfSelectedYear || dataInicio > endOfSelectedYear) {
          return null
        }

        const nome = getLancamentoNome(item, employeeNameById)
        const employeeKey =
          String(item.colaboradorId || item.funcionarioId || '').trim() ||
          normalizeText(nome) ||
          `colaborador-${index}`

        return {
          item,
          index,
          nome,
          employeeKey,
          dataInicio,
          dataTermino,
        }
      })
      .filter((value): value is {
        item: LancamentoLicencaResumo
        index: number
        nome: string
        employeeKey: string
        dataInicio: Date
        dataTermino: Date
      } => Boolean(value))

    const employeeColorMap = buildEmployeeColorMap(normalizedLancamentos.map((entry) => entry.employeeKey))

    normalizedLancamentos.forEach(({ item, index, nome, employeeKey, dataInicio, dataTermino }) => {
      const color = employeeColorMap.get(employeeKey) || '#1f77b4'
      const tipoLicenca = String(item.tipoLicenca || 'Afastamento').trim() || 'Afastamento'
      const status = getLancamentoStatus(dataInicio, dataTermino)
      const dataInicioLabel = formatDateLabel(dataInicio)
      const dataTerminoLabel = formatDateLabel(dataTermino)
      const lancamentoId = String(item.id || `lancamento-${index}`)

      const inicioIntervalo = dataInicio > startOfSelectedYear ? dataInicio : startOfSelectedYear
      const fimIntervalo = dataTermino < endOfSelectedYear ? dataTermino : endOfSelectedYear
      const cursor = new Date(inicioIntervalo.getFullYear(), inicioIntervalo.getMonth(), inicioIntervalo.getDate())

      while (cursor <= fimIntervalo) {
        const monthKey = cursor.getMonth()
        const dayKey = cursor.getDate()

        if (!eventsByMonth.has(monthKey)) {
          eventsByMonth.set(monthKey, new Map<number, CalendarDayEvent[]>())
        }

        const monthMap = eventsByMonth.get(monthKey)
        if (!monthMap) break

        const dayEvents = monthMap.get(dayKey) || []
        dayEvents.push({
          lancamentoId,
          employeeKey,
          employeeName: nome,
          tipoLicenca,
          dataInicio: dataInicioLabel,
          dataTermino: dataTerminoLabel,
          status,
          cid: item.cid ? String(item.cid) : undefined,
          observacao: item.observacao ? String(item.observacao) : undefined,
          color,
        })

        monthMap.set(dayKey, dayEvents)
        cursor.setDate(cursor.getDate() + 1)
      }
    })

    return eventsByMonth
  }, [
    employeeNameByIdFromStorage,
    employeesFromStorage,
    getLancamentoStatus,
    lancamentosFromStorage,
    matchesLancamentoFilters,
    year,
  ])

  const feriadosByMonthDay = useMemo(() => {
    const feriadosMap = new Map<number, Map<number, CalendarFeriado[]>>()

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

    feriados.forEach((feriado, index) => {
      if (feriado.ativo === false) return

      const parsedDate = parseFeriadoDateParts(String(feriado.data || ''))
      if (!parsedDate) return

      const recorrente = feriado.recorrente !== false
      if (!recorrente && parsedDate.year && parsedDate.year !== year) return

      const monthKey = parsedDate.month - 1
      const dayKey = parsedDate.day

      if (!feriadosMap.has(monthKey)) {
        feriadosMap.set(monthKey, new Map<number, CalendarFeriado[]>())
      }

      const monthMap = feriadosMap.get(monthKey)
      if (!monthMap) return

      const dayFeriados = monthMap.get(dayKey) || []
      dayFeriados.push({
        id: String(feriado.id || `feriado-${index}`),
        nome: String(feriado.nome || `Feriado ${index + 1}`).trim() || `Feriado ${index + 1}`,
        tipo: String(feriado.tipo || 'nacional'),
      })

      monthMap.set(
        dayKey,
        [...dayFeriados].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      )
    })

    return feriadosMap
  }, [refreshKey, year])

  useEffect(() => {
    setSelectedCalendarDay(null)
    setHoverCalendarDay(null)
  }, [refreshKey, year, selectedMonth, viewMode])

  const calendarLegendEmployees = useMemo(() => {
    const legendMap = new Map<string, { name: string; color: string }>()

    const monthsToInspect = isMonthlyView ? [selectedMonth] : Array.from(calendarDayEventsByMonth.keys())

    monthsToInspect.forEach((monthIndex) => {
      const daysMap = calendarDayEventsByMonth.get(monthIndex)
      if (!daysMap) return

      daysMap.forEach((events) => {
        events.forEach((event) => {
          if (!legendMap.has(event.employeeKey)) {
            legendMap.set(event.employeeKey, { name: event.employeeName, color: event.color })
          }
        })
      })
    })

    return Array.from(legendMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [calendarDayEventsByMonth, isMonthlyView, selectedMonth])

  const monthlyDayTimeline = useMemo(() => {
    const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate()
    const selectedMonthEvents = calendarDayEventsByMonth.get(selectedMonth) || new Map<number, CalendarDayEvent[]>()
    const selectedMonthFeriados = feriadosByMonthDay.get(selectedMonth) || new Map<number, CalendarFeriado[]>()

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1
      const dateRef = new Date(year, selectedMonth, day)
      const events = selectedMonthEvents.get(day) || []
      const feriados = selectedMonthFeriados.get(day) || []
      const uniqueEvents = Array.from(
        new Map(events.map((event) => [`${event.lancamentoId}-${event.employeeKey}-${event.tipoLicenca}`, event])).values()
      ).sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'pt-BR'))

      return {
        day,
        weekDay: days[dateRef.getDay()],
        isWeekend: dateRef.getDay() === 0 || dateRef.getDay() === 6,
        isToday:
          year === today.getFullYear() &&
          selectedMonth === today.getMonth() &&
          day === today.getDate(),
        feriados,
        events: uniqueEvents,
      }
    })
  }, [calendarDayEventsByMonth, feriadosByMonthDay, selectedMonth, today, year])

  const monthlyTimelineTotalEvents = useMemo(
    () => monthlyDayTimeline.reduce((total, item) => total + item.events.length, 0),
    [monthlyDayTimeline]
  )

  const monthlyTimelineTotalFeriados = useMemo(
    () => monthlyDayTimeline.reduce((total, item) => total + item.feriados.length, 0),
    [monthlyDayTimeline]
  )

  const resumoAnualPorMes = useMemo(() => {
    const startOfSelectedYear = new Date(year, 0, 1)
    const endOfSelectedYear = new Date(year, 11, 31)

    const employees = employeesFromStorage
    const lancamentos = lancamentosFromStorage.filter((item) =>
      matchesLancamentoFilters(item, employeeNameByIdFromStorage)
    )

    const employeeNameById = new Map<string, string>()
    employees.forEach((employee) => {
      employeeNameById.set(employee.id, employee.nomeCompleto)
    })

    const resumoPorMes: ResumoAnualMes[] = Array.from({ length: 12 }, (_, monthIndex) => ({
      monthIndex,
      afastamentos: [],
      atestados: [],
      ferias: [],
    }))

    lancamentos.forEach((item, index) => {
      if (!item.dataInicio) return

      const dataInicio = parseDateString(String(item.dataInicio))
      if (!dataInicio) return

      const dataTerminoInformada = item.dataTermino ? parseDateString(String(item.dataTermino)) : null
      const dataTermino = dataTerminoInformada && dataTerminoInformada >= dataInicio ? dataTerminoInformada : dataInicio

      if (dataInicio > endOfSelectedYear || dataTermino < startOfSelectedYear) return

      const inicioNoAno = dataInicio > startOfSelectedYear ? dataInicio : startOfSelectedYear
      const terminoNoAno = dataTermino < endOfSelectedYear ? dataTermino : endOfSelectedYear
      if (inicioNoAno > terminoNoAno) return

      const nome = getLancamentoNome(item, employeeNameById)
      const tipoLicenca = String(item.tipoLicenca || 'Afastamento').trim() || 'Afastamento'
      const tipoNormalizado = normalizeText(tipoLicenca)

      let categoria: 'afastamentos' | 'atestados' | 'ferias' | null = null
      if (tipoNormalizado.includes('ferias')) {
        categoria = 'ferias'
      } else if (tipoNormalizado.includes('atestado')) {
        categoria = 'atestados'
      } else {
        categoria = 'afastamentos'
      }

      if (!categoria) return

      const detalhe: ResumoAnualLancamentoDetalhe = {
        lancamentoId: String(item.id || `resumo-${index}`),
        nome,
        tipoLicenca,
        dataInicio: formatDateLabel(dataInicio),
        dataTermino: formatDateLabel(dataTermino),
        cid: item.cid ? String(item.cid) : undefined,
        observacao: item.observacao ? String(item.observacao) : undefined,
        sortTimestamp: dataInicio.getTime(),
      }

      for (let monthIndex = inicioNoAno.getMonth(); monthIndex <= terminoNoAno.getMonth(); monthIndex += 1) {
        resumoPorMes[monthIndex][categoria].push(detalhe)
      }
    })

    return resumoPorMes.map((mes) => ({
      ...mes,
      afastamentos: [...mes.afastamentos].sort((a, b) => b.sortTimestamp - a.sortTimestamp || a.nome.localeCompare(b.nome, 'pt-BR')),
      atestados: [...mes.atestados].sort((a, b) => b.sortTimestamp - a.sortTimestamp || a.nome.localeCompare(b.nome, 'pt-BR')),
      ferias: [...mes.ferias].sort((a, b) => b.sortTimestamp - a.sortTimestamp || a.nome.localeCompare(b.nome, 'pt-BR')),
    }))
  }, [
    employeeNameByIdFromStorage,
    employeesFromStorage,
    lancamentosFromStorage,
    matchesLancamentoFilters,
    year,
  ])

  useEffect(() => {
    if (!isMonthlyView) {
      setMonthlyCalendarHeight(null)
      return
    }

    const calendarNode = monthlyCalendarWrapperRef.current
    if (!calendarNode) return

    const updateHeight = () => {
      setMonthlyCalendarHeight(Math.ceil(calendarNode.getBoundingClientRect().height))
    }

    updateHeight()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => {
      updateHeight()
    })

    observer.observe(calendarNode)

    return () => observer.disconnect()
  }, [isMonthlyView, selectedMonth, year, refreshKey])

  const handleCalendarDayClick = (month: number, day: number, events: CalendarDayEvent[], feriados: CalendarFeriado[]) => {
    setHoverCalendarDay(null)

    const uniqueEvents = Array.from(new Map(events.map((event) => [event.lancamentoId, event])).values())
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'pt-BR'))
    const uniqueFeriados = Array.from(new Map(feriados.map((feriado) => [feriado.id, feriado])).values())
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

    if (uniqueEvents.length === 0 && uniqueFeriados.length === 0) {
      setSelectedCalendarDay(null)
      return
    }

    setSelectedCalendarDay({
      month,
      day,
      events: uniqueEvents,
      feriados: uniqueFeriados,
    })
  }

  const handleCalendarDayHover = (month: number, day: number, events: CalendarDayEvent[], feriados: CalendarFeriado[], targetRect: DOMRect) => {
    const uniqueEvents = Array.from(new Map(events.map((event) => [event.lancamentoId, event])).values())
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'pt-BR'))
    const uniqueFeriados = Array.from(new Map(feriados.map((feriado) => [feriado.id, feriado])).values())
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

    if (uniqueEvents.length === 0 && uniqueFeriados.length === 0) {
      setHoverCalendarDay(null)
      return
    }

    const previewWidth = 320
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const maxPreviewHeight = Math.max(180, viewportHeight - 24)
    const headerHeight = 56
    const feriadosHeaderHeight = uniqueFeriados.length > 0 ? 24 : 0
    const feriadoRowHeight = 24
    const feriadosHeight = uniqueFeriados.length * feriadoRowHeight
    const rowHeight = 74
    const footerHeight = 22
    const maxVisibleRows = Math.max(1, Math.floor((maxPreviewHeight - headerHeight - feriadosHeaderHeight - feriadosHeight - footerHeight) / rowHeight))
    const visibleEvents = uniqueEvents.slice(0, maxVisibleRows)
    const hiddenEventsCount = uniqueEvents.length - visibleEvents.length
    const estimatedHeight = headerHeight + feriadosHeaderHeight + feriadosHeight + visibleEvents.length * rowHeight + (hiddenEventsCount > 0 ? footerHeight : 0)

    const preferredRight = targetRect.right + 8
    const preferredLeft = targetRect.left - previewWidth - 8
    const left = preferredRight + previewWidth <= viewportWidth - 12
      ? preferredRight
      : Math.max(12, Math.min(preferredLeft, viewportWidth - previewWidth - 12))

    const spaceBelow = viewportHeight - targetRect.bottom - 8
    const spaceAbove = targetRect.top - 8
    const top = spaceBelow >= estimatedHeight
      ? Math.min(targetRect.bottom + 6, viewportHeight - estimatedHeight - 12)
      : spaceAbove >= estimatedHeight
        ? Math.max(12, targetRect.top - estimatedHeight - 6)
        : Math.max(12, Math.min(targetRect.top - estimatedHeight / 2, viewportHeight - estimatedHeight - 12))

    setHoverCalendarDay({
      month,
      day,
      events: visibleEvents,
      feriados: uniqueFeriados,
      totalEvents: uniqueEvents.length,
      hiddenEventsCount,
      left,
      top,
    })
  }

  const handleCalendarDayLeave = () => {
    setHoverCalendarDay(null)
  }

  const shouldBlockTimelineScrollChain = (element: HTMLDivElement, deltaY: number) => {
    const { scrollTop, scrollHeight, clientHeight } = element

    const maxScrollTop = Math.max(0, scrollHeight - clientHeight)
    const isAtTop = scrollTop <= 0
    const isAtBottom = scrollTop >= maxScrollTop - 1
    const isScrollingUp = deltaY < 0
    const isScrollingDown = deltaY > 0
    const cannotScroll = maxScrollTop <= 0

    return cannotScroll || (isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)
  }

  const handleMonthlyTimelineWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const element = event.currentTarget

    if (shouldBlockTimelineScrollChain(element, event.deltaY)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  useEffect(() => {
    if (!isMonthlyView) return

    const element = monthlyTimelineRef.current
    if (!element) return

    const handleNativeWheel = (event: WheelEvent) => {
      if (shouldBlockTimelineScrollChain(element, event.deltaY)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    element.addEventListener('wheel', handleNativeWheel, { passive: false })
    return () => {
      element.removeEventListener('wheel', handleNativeWheel)
    }
  }, [isMonthlyView, selectedMonth, year, refreshKey])

  const selectedCalendarDayLabel = selectedCalendarDay
    ? `${String(selectedCalendarDay.day).padStart(2, '0')}/${String(selectedCalendarDay.month + 1).padStart(2, '0')}/${year}`
    : ''

  const resumoAnualMesSelecionado = useMemo(() => {
    if (selectedResumoAnualMes === null) return null
    return resumoAnualPorMes[selectedResumoAnualMes] || null
  }, [resumoAnualPorMes, selectedResumoAnualMes])

  const resumoAnualMesPorFuncionario = useMemo(() => {
    if (!resumoAnualMesSelecionado) {
      return {
        ferias: [] as ResumoAnualPorFuncionario[],
        atestados: [] as ResumoAnualPorFuncionario[],
        afastamentos: [] as ResumoAnualPorFuncionario[],
      }
    }

    return {
      ferias: agruparResumoPorFuncionario(resumoAnualMesSelecionado.ferias),
      atestados: agruparResumoPorFuncionario(resumoAnualMesSelecionado.atestados),
      afastamentos: agruparResumoPorFuncionario(resumoAnualMesSelecionado.afastamentos),
    }
  }, [resumoAnualMesSelecionado])

  const handleNovoLancamento = () => {
    // Sempre inicia um novo fluxo limpo, sem reaproveitar selecoes anteriores.
    localStorage.removeItem('licencaSelecionada')
    localStorage.removeItem('licencaShowAll')
    localStorage.removeItem('tipoLancamento')
    localStorage.removeItem('colaboradorSelecionadoId')
    localStorage.removeItem('colaboradorSelecionadoNome')
    localStorage.removeItem('licencaEdicaoId')

    if (onNovoLancamento) {
      onNovoLancamento()
      return
    }

    localStorage.setItem('currentPage', 'lancamento-licenca')
    window.dispatchEvent(new Event('storage'))
  }

  const handleEditarFeriasLancada = (item: { lancamentoId: string; tipoLicenca: string }) => {
    handleEditarLancamento(item.lancamentoId, item.tipoLicenca || 'Férias')
  }

  const handleEditarLancamento = (lancamentoId: string, tipoLicenca: string) => {
    setAusenciaDetalhesModal(null)
    localStorage.setItem('licencaEdicaoId', lancamentoId)
    localStorage.setItem('licencaSelecionada', tipoLicenca)
    localStorage.setItem('currentPage', 'lancamento-individual')
    window.dispatchEvent(new Event('storage'))
  }

  const handleExcluirFeriasLancada = (lancamentoId: string) => {
    const salvo = localStorage.getItem('lancamentosLicenca')
    if (!salvo) return

    try {
      const parsed = JSON.parse(salvo)
      if (!Array.isArray(parsed)) return

      const atualizado = parsed.filter((item) => String(item?.id || '') !== lancamentoId)
      localStorage.setItem('lancamentosLicenca', JSON.stringify(atualizado))
      setMenuFeriasAbertoId(null)
      setRefreshKey((prev) => prev + 1)
      window.dispatchEvent(new Event('storage'))
    } catch {
      // Mantem estado atual caso os dados estejam corrompidos.
    }
  }

  const handleAbrirConfirmacaoExclusao = (item: { lancamentoId: string; nome: string }) => {
    setAusenciaDetalhesModal(null)
    setMenuFeriasAbertoId(null)
    setPendingDeleteFerias({ lancamentoId: item.lancamentoId, nome: item.nome })
  }

  const handleAbrirConfirmacaoExclusaoLancamento = (lancamentoId: string, nome: string) => {
    setAusenciaDetalhesModal(null)
    setMenuFeriasAbertoId(null)
    setPendingDeleteFerias({ lancamentoId, nome })
  }

  const handleCancelarExclusao = () => {
    setPendingDeleteFerias(null)
  }

  const handleConfirmarExclusao = () => {
    if (!pendingDeleteFerias) return
    handleExcluirFeriasLancada(pendingDeleteFerias.lancamentoId)
    setPendingDeleteFerias(null)
    setAusenciaDetalhesModal(null)
  }

  const handleAbrirDetalhesAusencia = (item: AusenciaDetalhe) => {
    setAusenciaDetalhesModal({
      nome: item.nome,
      afastamentos: item.afastamentos,
    })
  }

  const handleFecharDetalhesAusencia = () => {
    setAusenciaDetalhesModal(null)
  }

  const handleFecharDetalhesCalendario = () => {
    setSelectedCalendarDay(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/40 to-white p-6">
      {showFiltersDrawer && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/35"
          onClick={() => setShowFiltersDrawer(false)}
        >
          <aside
            className="absolute inset-y-0 right-0 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Filtros avançados</p>
                <p className="text-base font-bold text-slate-800">Refinar resultados</p>
                <p className="text-xs text-slate-500">Combine vários critérios para encontrar rapidamente.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFiltersDrawer(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Fechar filtros"
              >
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Funcionários</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {draftSelectedEmployeeFilters.length} selecionado(s)
                  </span>
                </div>
                <input
                  type="text"
                  value={employeeFilterSearch}
                  onChange={(event) => setEmployeeFilterSearch(event.target.value)}
                  placeholder="Buscar funcionário"
                  className="mb-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
                <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
                  {filteredEmployeeFilterOptions.length > 0 ? (
                    filteredEmployeeFilterOptions.map((option) => {
                      const checked = draftSelectedEmployeeFilters.includes(option.value)
                      return (
                        <button
                          key={`filtro-func-${option.value}`}
                          type="button"
                          onClick={() => toggleInArray(option.value, setDraftSelectedEmployeeFilters)}
                          className={`flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-xs ${checked ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
                        >
                          <span className="truncate">{option.label}</span>
                          <div className="ml-2 flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {option.usageCount}
                            </span>
                            <span className={`h-3 w-3 rounded border ${checked ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'}`} />
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-xs text-slate-500">Nenhum funcionário encontrado.</p>
                  )}
                </div>

                {draftSelectedEmployeeFilters.length > 0 && (
                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Selecionados</p>
                    <div className="flex flex-wrap gap-1.5">
                      {draftSelectedEmployeeFilters.map((value) => (
                        <button
                          key={`chip-func-${value}`}
                          type="button"
                          onClick={() => setDraftSelectedEmployeeFilters((prev) => prev.filter((item) => item !== value))}
                          className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-800 hover:bg-blue-100"
                          title="Remover funcionário selecionado"
                        >
                          <span className="truncate">{employeeFilterLabelByValue.get(value) || value}</span>
                          <X size={12} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Tipos de licença</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {draftSelectedTipoFilters.length} selecionado(s)
                  </span>
                </div>
                <p className="mb-2 text-[11px] text-slate-500">Lista completa do catálogo + tipos já lançados. Use a busca para acelerar.</p>
                <input
                  type="text"
                  value={tipoFilterSearch}
                  onChange={(event) => setTipoFilterSearch(event.target.value)}
                  placeholder="Buscar tipo"
                  className="mb-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                />
                <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
                  {filteredTipoFilterOptions.length > 0 ? (
                    filteredTipoFilterOptions.map((option) => {
                      const checked = draftSelectedTipoFilters.includes(option.value)
                      return (
                        <button
                          key={`filtro-tipo-${option.value}`}
                          type="button"
                          onClick={() => toggleInArray(option.value, setDraftSelectedTipoFilters)}
                          className={`flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-xs ${checked ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
                        >
                          <span className="truncate">{option.label}</span>
                          <div className="ml-2 flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                              {option.usageCount}
                            </span>
                            <span className={`h-3 w-3 rounded border ${checked ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'}`} />
                          </div>
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-xs text-slate-500">Nenhum tipo encontrado.</p>
                  )}
                </div>

                {draftSelectedTipoFilters.length > 0 && (
                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Selecionados</p>
                    <div className="flex flex-wrap gap-1.5">
                      {draftSelectedTipoFilters.map((value) => (
                        <button
                          key={`chip-tipo-${value}`}
                          type="button"
                          onClick={() => setDraftSelectedTipoFilters((prev) => prev.filter((item) => item !== value))}
                          className="inline-flex max-w-full items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-800 hover:bg-blue-100"
                          title="Remover tipo selecionado"
                        >
                          <span className="truncate">{tipoFilterLabelByValue.get(value) || value}</span>
                          <X size={12} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusFilterOptions.map((option) => {
                    const checked = draftSelectedStatusFilters.includes(option.value)
                    return (
                      <button
                        key={`filtro-status-${option.value}`}
                        type="button"
                        onClick={() => toggleInArray(option.value, setDraftSelectedStatusFilters)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${checked ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">Período</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="text-[11px] text-slate-600">
                    Início
                    <DatePicker
                      ref={filtroDataInicioRef}
                      value={draftFiltroDataInicio}
                      onChange={setDraftFiltroDataInicio}
                      className="mt-1 text-xs"
                      nextRef={filtroDataTerminoRef}
                    />
                  </label>
                  <label className="text-[11px] text-slate-600">
                    Término
                    <DatePicker
                      ref={filtroDataTerminoRef}
                      value={draftFiltroDataTermino}
                      onChange={setDraftFiltroDataTermino}
                      className="mt-1 text-xs"
                      calendarAlign="right"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">Opções extras</p>
                <div className="space-y-2 text-xs text-slate-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draftFiltroSomenteComCid}
                      onChange={(event) => setDraftFiltroSomenteComCid(event.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300"
                    />
                    Somente lançamentos com CID
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={draftFiltroSomenteComObservacao}
                      onChange={(event) => setDraftFiltroSomenteComObservacao(event.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300"
                    />
                    Somente lançamentos com observação
                  </label>
                </div>
              </section>

            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <span className="text-xs font-semibold text-slate-600">{draftFiltrosSelecionadosCount} filtro(s) selecionado(s)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={aplicarFiltros}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {pendingDeleteFerias && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm"
          onClick={handleCancelarExclusao}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Excluir lançamento</h2>
                  <p className="text-xs text-gray-500">Esta ação não pode ser desfeita.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelarExclusao}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">Tem certeza que deseja excluir o registro abaixo?</p>
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-sm font-medium text-gray-900">{pendingDeleteFerias.nome}</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCancelarExclusao}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarExclusao}
                  className="flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {ausenciaDetalhesModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4"
          onClick={handleFecharDetalhesAusencia}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Afastamentos</p>
                <p className="text-base font-bold text-slate-800">{ausenciaDetalhesModal.nome}</p>
              </div>
              <button
                type="button"
                onClick={handleFecharDetalhesAusencia}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            {ausenciaDetalhesModal.afastamentos.length > 0 ? (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {ausenciaDetalhesModal.afastamentos.sort((a, b) => {
                  const dateA = new Date(parseInt(a.dataInicio.split('/')[2]), parseInt(a.dataInicio.split('/')[1]) - 1, parseInt(a.dataInicio.split('/')[0]));
                  const dateB = new Date(parseInt(b.dataInicio.split('/')[2]), parseInt(b.dataInicio.split('/')[1]) - 1, parseInt(b.dataInicio.split('/')[0]));
                  return dateB.getTime() - dateA.getTime();
                }).map((detalhe) => (
                  <div key={detalhe.lancamentoId} className="rounded-md border border-blue-100 bg-blue-50/50 px-2 py-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="truncate text-xs font-medium text-slate-700">{detalhe.tipoLicenca}</span>
                        {detalhe.cid && (
                          <div className="mt-0.5 text-[11px] text-slate-600">
                            CID: {detalhe.cid}
                          </div>
                        )}
                        {detalhe.observacao && (
                          <div className="mt-0.5 text-[11px] text-slate-600 italic break-words whitespace-normal">
                            {detalhe.observacao}
                          </div>
                        )}
                      </div>
                      <div className="ml-2 flex flex-shrink-0 flex-col items-end gap-1 whitespace-nowrap">
                        <span className="text-[10px] font-medium text-slate-500">
                          {detalhe.dataInicio} a {detalhe.dataTermino}
                        </span>
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700">
                          {formatDiasTexto(detalhe.dias)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        onClick={() => handleEditarLancamento(detalhe.lancamentoId, detalhe.tipoLicenca)}
                      >
                        <Pencil size={12} />
                        Editar
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => handleAbrirConfirmacaoExclusaoLancamento(detalhe.lancamentoId, `${ausenciaDetalhesModal.nome} - ${detalhe.tipoLicenca}`)}
                      >
                        <Trash2 size={12} />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Sem detalhes de afastamentos para este colaborador.</p>
            )}
          </div>
        </div>
      )}

      {selectedCalendarDay && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4"
          onClick={handleFecharDetalhesCalendario}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Detalhes do calendário</p>
                <p className="text-base font-bold text-slate-800">{selectedCalendarDayLabel}</p>
                <p className="text-xs text-slate-500">{selectedCalendarDay.events.length} lançamento(s) e {selectedCalendarDay.feriados.length} feriado(s) neste dia.</p>
              </div>
              <button
                type="button"
                onClick={handleFecharDetalhesCalendario}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {selectedCalendarDay.feriados.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-rose-700">Feriados</p>
                  <div className="space-y-1.5">
                    {selectedCalendarDay.feriados.map((feriado) => (
                      <div key={feriado.id} className="flex items-center justify-between rounded-md border border-rose-100 bg-white px-2.5 py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          <p className="text-xs font-semibold text-slate-800">{feriado.nome}</p>
                        </div>
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-700">
                          {feriado.tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCalendarDay.events.map((event) => (
                <div key={event.lancamentoId} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
                        <p className="text-sm font-semibold text-slate-800">{event.employeeName}</p>
                      </div>
                      <p className="text-xs font-medium text-slate-600">{event.tipoLicenca}</p>
                      {event.cid && <p className="text-xs text-slate-500">CID: {event.cid}</p>}
                      {event.observacao && <p className="text-xs text-slate-500 break-words">{event.observacao}</p>}
                    </div>

                    <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${getStatusStyles(event.status)}`}>
                        {event.status}
                      </span>
                      {normalizeText(event.tipoLicenca).includes('ferias') ? (
                        <>
                          <p className="text-[11px] text-right text-slate-500">Começo das Férias: {event.dataInicio}</p>
                          <p className="text-[11px] text-right text-slate-500">Término das Férias: {event.dataTermino}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[11px] text-right text-slate-500">Início do afastamento: {event.dataInicio}</p>
                          <p className="text-[11px] text-right text-slate-500">Término do afastamento: {event.dataTermino}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {selectedCalendarDay.events.length === 0 && selectedCalendarDay.feriados.length > 0 && (
                <p className="text-xs text-slate-500">Sem lançamentos neste dia. Apenas feriado(s) cadastrado(s).</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showFeriasInfoModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4"
          onClick={() => setShowFeriasInfoModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Guia rápido</p>
                <p className="text-base font-bold text-slate-800">Como as férias são calculadas (CLT)</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFeriasInfoModal(false)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1 text-sm text-slate-700">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-800">1. Direito às férias</p>
                <p>A cada 12 meses de trabalho (período aquisitivo), o colaborador tem direito a férias. Base legal: CLT, art. 129.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-800">2. Quantidade de dias</p>
                <p>Regra geral de até 30 dias. Faltas injustificadas podem reduzir os dias. Base legal: CLT, art. 130.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-800">3. Prazo para concessão</p>
                <p>A empresa deve conceder as férias nos 12 meses seguintes ao período aquisitivo (período concessivo). Base legal: CLT, art. 134.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-800">4. Fracionamento</p>
                <p>As férias podem ser fracionadas em até 3 períodos, com um período mínimo de 14 dias e os demais de no mínimo 5 dias cada. Base legal: CLT, art. 134, §1º.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-800">5. Valor a receber</p>
                <p>O pagamento inclui remuneração normal + adicional de 1/3 constitucional. Base legal: CF, art. 7º, XVII e CLT, art. 142.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-800">6. Data do pagamento</p>
                <p>O pagamento das férias deve ocorrer até 2 dias antes do início do período. Base legal: CLT, art. 145.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-800">7. Abono pecuniário (venda de férias)</p>
                <p>É possível converter até 1/3 das férias em abono pecuniário. Base legal: CLT, art. 143.</p>
              </div>

              <p className="text-xs text-slate-500">
                Resumo informativo. Em caso de dúvida, valide com RH/DP e normas coletivas da categoria.
              </p>

              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                <p className="font-semibold">Links oficiais da lei:</p>
                <a
                  href="https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 underline hover:text-blue-900"
                >
                  CLT (Decreto-Lei 5.452/1943) - Planalto
                </a>
                <a
                  href="https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 underline hover:text-blue-900"
                >
                  Constituição Federal (art. 7º, XVII) - Planalto
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {resumoAnualMesSelecionado && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4"
          onClick={() => setSelectedResumoAnualMes(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Resumo mensal</p>
                <p className="text-base font-bold text-slate-800">{months[resumoAnualMesSelecionado.monthIndex]} / {year}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResumoAnualMes(null)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-1.5 text-[11px]">
              <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">Afastamentos: {resumoAnualMesSelecionado.afastamentos.length}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">Atestados: {resumoAnualMesSelecionado.atestados.length}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">Férias: {resumoAnualMesSelecionado.ferias.length}</span>
            </div>

            <div className="max-h-[68vh] space-y-2 overflow-y-auto pr-1">
              {resumoAnualMesSelecionado.afastamentos.length + resumoAnualMesSelecionado.atestados.length + resumoAnualMesSelecionado.ferias.length === 0 ? (
                <p className="text-sm text-slate-500">Sem lançamentos neste mês.</p>
              ) : (
                <>
                  {resumoAnualMesPorFuncionario.ferias.length > 0 && (
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-2">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Férias (quem tirou)</p>
                      <div className="space-y-1">
                        {resumoAnualMesPorFuncionario.ferias.map((group) => (
                          <div key={`resumo-mes-ferias-${group.nome}`} className="text-[11px] text-slate-700">
                            <p>
                              <span className="font-semibold">{group.nome}</span>
                              <span className="text-slate-500"> ({group.quantidade})</span>
                            </p>
                            <div className="ml-2 mt-0.5 space-y-0.5 border-l border-emerald-200 pl-2">
                              {group.itens.map((item, idx) => (
                                <p key={`resumo-mes-ferias-item-${group.nome}-${item.lancamentoId}-${idx}`} className="text-[10px] text-slate-500">
                                  {item.dataInicio} a {item.dataTermino}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumoAnualMesPorFuncionario.atestados.length > 0 && (
                    <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-2">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">Atestados</p>
                      <div className="space-y-1">
                        {resumoAnualMesPorFuncionario.atestados.map((group) => (
                          <div key={`resumo-mes-atestado-${group.nome}`} className="text-[11px] text-slate-700">
                            <p>
                              <span className="font-semibold">{group.nome}</span>
                              <span className="text-slate-500"> ({group.quantidade})</span>
                            </p>
                            <div className="ml-2 mt-0.5 space-y-0.5 border-l border-amber-200 pl-2">
                              {group.itens.map((item, idx) => (
                                <p key={`resumo-mes-atestado-item-${group.nome}-${item.lancamentoId}-${idx}`} className="text-[10px] text-slate-500">
                                  {item.tipoLicenca} ({item.dataInicio} a {item.dataTermino})
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumoAnualMesPorFuncionario.afastamentos.length > 0 && (
                    <div className="rounded-lg border border-red-100 bg-red-50/70 p-2">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-red-700">Afastamentos</p>
                      <div className="space-y-1">
                        {resumoAnualMesPorFuncionario.afastamentos.map((group) => (
                          <div key={`resumo-mes-afastamento-${group.nome}`} className="text-[11px] text-slate-700">
                            <p>
                              <span className="font-semibold">{group.nome}</span>
                              <span className="text-slate-500"> ({group.quantidade})</span>
                            </p>
                            <div className="ml-2 mt-0.5 space-y-0.5 border-l border-red-200 pl-2">
                              {group.itens.map((item, idx) => (
                                <p key={`resumo-mes-afastamento-item-${group.nome}-${item.lancamentoId}-${idx}`} className="text-[10px] text-slate-500">
                                  {item.tipoLicenca} ({item.dataInicio} a {item.dataTermino})
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {hoverCalendarDay && !selectedCalendarDay && (
        <div
          className="pointer-events-none fixed z-30 w-[320px] rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur"
          style={{ left: hoverCalendarDay.left, top: hoverCalendarDay.top }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
            {String(hoverCalendarDay.day).padStart(2, '0')}/{String(hoverCalendarDay.month + 1).padStart(2, '0')}/{year}
          </p>
          <p className="mb-2 text-xs text-slate-500">{hoverCalendarDay.totalEvents} lançamento(s) e {hoverCalendarDay.feriados.length} feriado(s). Clique no dia para ver tudo.</p>

          <div className="space-y-1.5">
            {hoverCalendarDay.feriados.length > 0 && (
              <div className="rounded-md border border-rose-100 bg-rose-50 px-2 py-1.5">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-rose-700">Feriado(s)</p>
                <div className="space-y-1">
                  {hoverCalendarDay.feriados.map((feriado) => (
                    <div key={feriado.id} className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span className="truncate text-[11px] font-semibold text-slate-700">{feriado.nome}</span>
                      </div>
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-rose-700">{feriado.tipo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hoverCalendarDay.events.map((event) => (
              <div key={event.lancamentoId} className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: event.color }} />
                  <span className="truncate text-xs font-semibold text-slate-700">{event.employeeName}</span>
                </div>
                <p className="truncate text-[11px] text-slate-600">{event.tipoLicenca}</p>
                {normalizeText(event.tipoLicenca).includes('ferias') ? (
                  <p className="text-[10px] text-slate-500">
                    Começo: {event.dataInicio} | Término: {event.dataTermino}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    Início: {event.dataInicio} | Término: {event.dataTermino}
                  </p>
                )}
              </div>
            ))}
            {hoverCalendarDay.hiddenEventsCount > 0 && (
              <p className="text-[11px] font-medium text-slate-500">
                +{hoverCalendarDay.hiddenEventsCount} lançamento(s) não exibido(s) por limite de espaço.
              </p>
            )}
          </div>
        </div>
      )}

      <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 px-6 py-5 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <CalendarDays size={24} />
                Férias e Afastamentos
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                Gerencie ausências, licenças e férias com visão anual e monitoramento rápido.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNovoLancamento}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              <PlusCircle size={16} />
              Fazer novo lançamento
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-100 px-6 py-3">
          <button
            type="button"
            onClick={() => setShowFeriasInfoModal(true)}
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            Como é calculado as férias?
          </button>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
            <button
              type="button"
              onClick={() => setYear((prev) => prev - 1)}
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-700"
              aria-label="Ano anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="rounded-lg bg-white px-3 py-1.5 shadow-sm">
              <span className="text-sm font-semibold text-slate-700">{year}</span>
            </div>

            <button
              type="button"
              onClick={() => setYear((prev) => prev + 1)}
              className="rounded-md p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-700"
              aria-label="Próximo ano"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative" ref={nomeBuscaContainerRef}>
              <input
                type="text"
                value={nomeBuscaFuncionario}
                onChange={(event) => handleNomeBuscaChange(event.target.value)}
                onFocus={() => {
                  if (nomeBuscaFuncionario.trim()) {
                    setShowNomeBuscaSugestoes(true)
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setShowNomeBuscaSugestoes(false)
                  }

                  if (event.key === 'Enter' && nomeBuscaSugestoes.length > 0) {
                    event.preventDefault()
                    selecionarNomeBusca(nomeBuscaSugestoes[0].label)
                  }
                }}
                placeholder="Buscar funcionário"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 pr-9 text-sm text-slate-700 placeholder-slate-400"
              />
              {showNomeBuscaSugestoes && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {nomeBuscaSugestoes.length > 0 ? (
                    nomeBuscaSugestoes.map((option) => (
                      <button
                        key={`nome-busca-${option.value}`}
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault()
                          selecionarNomeBusca(option.label)
                        }}
                        className="block w-full border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 last:border-b-0 hover:bg-blue-50"
                      >
                        {option.label}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">Nenhum funcionário encontrado.</p>
                  )}
                </div>
              )}
              <Filter size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('anual')}
                className={`rounded-md px-3 py-1.5 text-sm ${viewMode === 'anual' ? 'bg-blue-50 font-semibold text-blue-700' : 'font-medium text-slate-500 hover:bg-slate-50'}`}
              >
                Anual
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mensal')}
                className={`rounded-md px-3 py-1.5 text-sm ${viewMode === 'mensal' ? 'bg-blue-50 font-semibold text-blue-700' : 'font-medium text-slate-500 hover:bg-slate-50'}`}
              >
                Mensal
              </button>
            </div>

            {viewMode === 'mensal' && (
              <div className="w-[170px]">
                <Select
                  value={selectedMonth}
                  onChange={(value) => setSelectedMonth(Number(value))}
                  options={months.map((monthLabel, monthIndex) => ({ label: monthLabel, value: monthIndex }))}
                  placeholder="Selecionar mês"
                  buttonClassName="h-[38px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-none focus:border-blue-300 focus:ring-blue-100"
                  menuClassName="rounded-lg border-slate-200"
                />
              </div>
            )}

            <button
              type="button"
              onClick={abrirFiltros}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ListFilter size={14} />
              Filtrar
              {filtrosAtivosCount > 0 && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  {filtrosAtivosCount}
                </span>
              )}
            </button>

          </div>
        </div>

      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              <span>Pendências de férias</span>
            </div>
            <span className="rounded-xl bg-red-100 p-2 text-red-600">
              <AlertTriangle size={16} />
            </span>
          </div>
          <p className="text-3xl font-bold leading-none text-slate-800">{pendenciasFerias}</p>
          <h3 className="text-sm font-semibold text-slate-800">
            {pendenciasFerias > 0 ? 'Férias vencidas para regularizar' : 'Tudo em dia'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {pendenciasFerias > 0
              ? 'Colaboradores com 1 ano ou mais sem férias iniciadas.'
              : 'Nenhuma pendência de férias vencidas no momento.'}
          </p>
          {pendenciasDetalhes.length > 0 && (
            <div className={`mt-2 space-y-1 ${pendenciasDetalhes.length > 4 ? 'max-h-28 overflow-y-auto pr-1' : ''}`}>
              {pendenciasDetalhes.map((item) => (
                <div key={item.nome} className="flex items-center justify-between rounded-md border border-red-100 bg-white px-2 py-1 text-[11px] leading-tight">
                  <div className="flex min-w-0 items-center">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span className="ml-1.5 truncate font-medium text-slate-700">{item.nome}</span>
                  </div>
                  <span className="ml-2 shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">
                    {formatPendenciaTempo(item.diasPendencia)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
              <span>Ausências no mês</span>
            </div>
            <span className="rounded-xl bg-blue-100 p-2 text-blue-600">
              <Users size={16} />
            </span>
          </div>
          <p className="text-3xl font-bold leading-none text-slate-800">{ausenciasMes}</p>
          <h3 className="text-sm font-semibold text-slate-800">
            {ausenciasMes > 0 ? 'Colaboradores com ausência no mês' : 'Sem ausências'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {ausenciasMes > 0
              ? 'Total de ausências no mês de referência, desconsiderando férias.'
              : 'Nenhuma ausência registrada para o mês de referência (sem contar férias).'}
          </p>
          {ausenciasDetalhesMes.length > 0 && (
            <div className="mt-2 max-h-28 space-y-1 overflow-y-auto pr-1">
              {ausenciasDetalhesMes.map((item) => (
                <div key={item.nome} className="flex items-center justify-between rounded-md border border-blue-100 bg-white px-2 py-1 text-[11px] leading-tight">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span className="truncate font-medium text-slate-700">{item.nome}</span>
                  </div>

                  <div className="ml-2 flex shrink-0 items-center gap-1">
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 font-semibold text-blue-700">
                      {formatDiasTexto(item.dias)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Visualizar afastamentos de ${item.nome}`}
                      className="rounded p-0.5 text-blue-700 hover:bg-blue-100"
                      onClick={() => handleAbrirDetalhesAusencia(item)}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <span>Férias agendadas</span>
            </div>
            <span className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <Clock3 size={16} />
            </span>
          </div>
          <p className="text-3xl font-bold leading-none text-slate-800">{feriasAgendadas}</p>
          <h3 className="text-sm font-semibold text-slate-800">
            {feriasAgendadas > 0 ? 'Férias agendadas aguardando início' : 'Sem eventos próximos'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {feriasAgendadas > 0
              ? 'Colaboradores já lançados e aguardando o dia de início das férias no mês de referência.'
              : 'Nenhum colaborador com férias agendadas para iniciar no mês de referência.'}
          </p>
          {feriasAgendadasDetalhes.length > 0 && (
            <div className={`mt-2 space-y-1 ${feriasAgendadasDetalhes.length > 4 ? 'max-h-28 overflow-y-auto pr-1' : ''}`}>
              {feriasAgendadasDetalhes.map((item) => (
                <div key={item.lancamentoId} className="group relative flex items-center justify-between rounded-md border border-emerald-100 bg-white px-2 py-1 text-[11px] leading-tight">
                  <div className="flex min-w-0 items-center">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span className="ml-1.5 truncate font-medium text-slate-700">{item.nome}</span>
                  </div>

                  <div className="ml-2 flex shrink-0 items-center gap-1">
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-700">
                      {item.diasParaInicio === 0
                        ? 'Hoje'
                        : item.diasParaInicio === 1
                          ? 'Falta 1 dia'
                          : `Faltam ${item.diasParaInicio} dias`}
                    </span>

                    <button
                      type="button"
                      aria-label="Mais opções"
                      data-ferias-menu-trigger="true"
                      className={`rounded p-0.5 text-emerald-700 hover:bg-emerald-100 ${menuFeriasAbertoId === item.lancamentoId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        setMenuFeriasAbertoId((prev) => (prev === item.lancamentoId ? null : item.lancamentoId))
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  {menuFeriasAbertoId === item.lancamentoId && (
                    <div data-ferias-menu="true" className="absolute right-1 top-7 z-30 min-w-28 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                      <button
                        type="button"
                        className="block w-full rounded px-2 py-1 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                        onClick={(event) => {
                          event.stopPropagation()
                          setMenuFeriasAbertoId(null)
                          handleEditarFeriasLancada(item)
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="block w-full rounded px-2 py-1 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleAbrirConfirmacaoExclusao(item)
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
              <span>Férias em andamento</span>
            </div>
            <span className="rounded-xl bg-violet-100 p-2 text-violet-600">
              <CalendarDays size={16} />
            </span>
          </div>
          <p className="text-3xl font-bold leading-none text-slate-800">{feriasEmAndamento}</p>
          <h3 className="text-sm font-semibold text-slate-800">
            {feriasEmAndamento > 0 ? 'Colaboradores em período de férias' : 'Sem férias em andamento'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {feriasEmAndamento > 0
              ? 'Férias iniciadas e ainda não finalizadas na data de referência.'
              : 'Nenhum colaborador em férias na data de referência.'}
          </p>
          {feriasEmAndamentoDetalhes.length > 0 && (
            <div className={`mt-2 space-y-1 ${feriasEmAndamentoDetalhes.length > 4 ? 'max-h-28 overflow-y-auto pr-1' : ''}`}>
              {feriasEmAndamentoDetalhes.map((item) => (
                <div key={item.lancamentoId} className="group relative flex items-center justify-between rounded-md border border-violet-100 bg-white px-2 py-1 text-[11px] leading-tight">
                  <div className="flex min-w-0 items-center">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                    <span className="ml-1.5 truncate font-medium text-slate-700">{item.nome}</span>
                  </div>

                  <div className="ml-2 flex shrink-0 items-center gap-1">
                    <span className="rounded-full bg-violet-100 px-1.5 py-0.5 font-semibold text-violet-700">
                      {item.diasParaTermino === 0
                        ? 'Termina hoje'
                        : item.diasParaTermino === 1
                          ? 'Acaba em 1 dia'
                          : `Acabam em ${item.diasParaTermino} dias`}
                    </span>

                    <button
                      type="button"
                      aria-label="Mais opções"
                      data-ferias-menu-trigger="true"
                      className={`rounded p-0.5 text-violet-700 hover:bg-violet-100 ${menuFeriasAbertoId === item.lancamentoId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        setMenuFeriasAbertoId((prev) => (prev === item.lancamentoId ? null : item.lancamentoId))
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  {menuFeriasAbertoId === item.lancamentoId && (
                    <div data-ferias-menu="true" className="absolute right-1 top-7 z-30 min-w-28 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                      <button
                        type="button"
                        className="block w-full rounded px-2 py-1 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
                        onClick={(event) => {
                          event.stopPropagation()
                          setMenuFeriasAbertoId(null)
                          handleEditarFeriasLancada(item)
                        }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="block w-full rounded px-2 py-1 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleAbrirConfirmacaoExclusao(item)
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </article>

      </section>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Cores dos funcionários</p>
            <p className="text-xs text-slate-500">
              {isMonthlyView
                ? `Cada colaborador possui uma cor fixa no calendário de ${months[selectedMonth]}.`
                : 'Cada colaborador possui uma cor fixa no calendário.'}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Feriado cadastrado
          </span>

          {calendarLegendEmployees.length > 0 ? (
            calendarLegendEmployees.map((employee) => (
              <span
                key={employee.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: employee.color }} />
                {employee.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">
              {isMonthlyView
                ? `Nenhum colaborador com lançamentos em ${months[selectedMonth]} do ano selecionado.`
                : 'Nenhum colaborador com lançamentos no ano selecionado.'}
            </span>
          )}
        </div>
      </section>

      {isMonthlyView ? (
        <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)]">
          <div ref={monthlyCalendarWrapperRef} className="mx-auto w-full max-w-5xl">
            <CalendarMonth
              key={`${months[selectedMonth]}-${year}`}
              month={selectedMonth}
              year={year}
              isCurrentMonth={isCurrentYear && selectedMonth === today.getMonth()}
              currentDay={today.getDate()}
              isLarge
              dayEventsByDay={calendarDayEventsByMonth.get(selectedMonth) || new Map<number, CalendarDayEvent[]>()}
              feriadosByDay={feriadosByMonthDay.get(selectedMonth) || new Map<number, CalendarFeriado[]>()}
              selectedDay={selectedCalendarDay?.month === selectedMonth ? selectedCalendarDay.day : null}
              onDayClick={handleCalendarDayClick}
              onDayHover={handleCalendarDayHover}
              onDayLeave={handleCalendarDayLeave}
            />
          </div>

          <aside
            className="flex flex-col rounded-2xl border border-slate-300 bg-slate-50 p-4 shadow-sm xl:sticky xl:top-4"
            style={monthlyCalendarHeight ? { height: monthlyCalendarHeight } : undefined}
          >
            <div className="border-b border-slate-300 pb-3">
              <p className="text-sm font-semibold text-slate-800">Detalhamento diário</p>
              <p className="text-xs text-slate-600">
                {months[selectedMonth]}/{year} - {monthlyTimelineTotalEvents} lançamento(s) e {monthlyTimelineTotalFeriados} feriado(s) no mês.
              </p>
            </div>

            <div
              ref={monthlyTimelineRef}
              className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
              onWheel={handleMonthlyTimelineWheel}
              style={{ overscrollBehavior: 'none' }}
            >
              {monthlyDayTimeline.map((item) => (
                <article
                  key={`${selectedMonth}-${item.day}`}
                  className={`rounded-xl border p-2.5 ${item.isToday ? 'border-blue-300 bg-blue-100/70 ring-1 ring-blue-200' : item.isWeekend ? 'border-slate-400 bg-slate-200/80' : 'border-slate-300 bg-slate-100'}`}
                >
                  <div className="mb-2 border-b border-slate-300 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold tabular-nums ${item.isToday ? 'border-blue-400 bg-blue-600 text-white' : 'border-slate-500 bg-slate-700 text-white'}`}>
                          {String(item.day).padStart(2, '0')}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-600">{item.weekDay}</p>
                          <p className="truncate text-xs font-semibold text-slate-800">{months[selectedMonth]} / {year}</p>
                        </div>
                      </div>

                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.events.length > 0 ? 'bg-blue-200 text-blue-800' : 'bg-slate-300 text-slate-800'}`}>
                        {item.events.length} evento(s)
                      </span>
                    </div>
                    {item.feriados.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.feriados.map((feriado) => (
                          <span
                            key={`${item.day}-${feriado.id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            {feriado.nome}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {item.events.length > 0 ? (
                    <div className="space-y-1.5">
                      {item.events.map((event) => (
                        <div
                          key={`${item.day}-${event.lancamentoId}-${event.employeeKey}`}
                          className="rounded-lg border border-slate-300 bg-white/95 p-2"
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
                            <p className="truncate text-xs font-semibold text-slate-800">{event.employeeName}</p>
                            <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${getStatusStyles(event.status)}`}>
                              {event.status}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-slate-700">{event.tipoLicenca}</p>
                              {event.cid && <p className="text-[11px] text-slate-600">CID: {event.cid}</p>}
                              {event.observacao && <p className="break-words text-[11px] text-slate-600">Observação: {event.observacao}</p>}
                            </div>

                            <div className="w-[118px] shrink-0 rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-right">
                              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600">Início</p>
                              <p className="text-[11px] font-semibold text-slate-800">{event.dataInicio}</p>
                              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-slate-600">Término</p>
                              <p className="text-[11px] font-semibold text-slate-800">{event.dataTermino}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      {item.feriados.length > 0 ? 'Sem lançamentos, somente feriado neste dia.' : 'Sem lançamentos neste dia.'}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </aside>
        </section>
      ) : (
        <section>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {months.map((_, idx) => (
              <CalendarMonth
                key={`${months[idx]}-${year}`}
                month={idx}
                year={year}
                isCurrentMonth={isCurrentYear && idx === today.getMonth()}
                currentDay={today.getDate()}
                dayEventsByDay={calendarDayEventsByMonth.get(idx) || new Map<number, CalendarDayEvent[]>()}
                feriadosByDay={feriadosByMonthDay.get(idx) || new Map<number, CalendarFeriado[]>()}
                selectedDay={selectedCalendarDay?.month === idx ? selectedCalendarDay.day : null}
                onDayClick={handleCalendarDayClick}
                onDayHover={handleCalendarDayHover}
                onDayLeave={handleCalendarDayLeave}
                onMonthSummaryClick={(monthIndex) => setSelectedResumoAnualMes(monthIndex)}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

export default FeriasEAfastamentos
