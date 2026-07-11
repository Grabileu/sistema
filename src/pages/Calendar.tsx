import React, { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ArrowLeft, ArrowRight, Filter, Search, User, Plane, Stethoscope, AlertTriangle, CalendarClock, BadgeCheck } from 'lucide-react'
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

const getBadgeMeta = (evento: { tipo: string; subtipo?: string }) => {
  const label = String(evento.subtipo || '').trim()
  const normalized = label.toLowerCase()

  if (evento.tipo === 'falta') {
    return { label: 'Falta', className: 'border-red-200 bg-red-50 text-red-700', icon: <AlertTriangle size={10} className="shrink-0" /> }
  }

  if (evento.tipo === 'atraso') {
    return { label: 'Atraso', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: <CalendarClock size={10} className="shrink-0" /> }
  }

  if (evento.tipo === 'licenca') {
    if (normalized.includes('atestado')) {
      return { label: 'Atestado', className: 'border-sky-200 bg-sky-50 text-sky-700', icon: <Stethoscope size={10} className="shrink-0" /> }
    }
    if (normalized.includes('férias') || normalized.includes('ferias')) {
      return { label: 'Férias', className: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: <Plane size={10} className="shrink-0" /> }
    }
    return { label: label || 'Licença', className: 'border-violet-200 bg-violet-50 text-violet-700', icon: <BadgeCheck size={10} className="shrink-0" /> }
  }

  if (evento.tipo === 'admissao') {
    return { label: 'Admissão', className: 'border-purple-200 bg-purple-50 text-purple-700', icon: <BadgeCheck size={10} className="shrink-0" /> }
  }

  if (evento.tipo === 'demissao') {
    return { label: 'Demissão', className: 'border-slate-200 bg-slate-50 text-slate-700', icon: <AlertTriangle size={10} className="shrink-0" /> }
  }

  return { label: 'Evento', className: 'border-slate-200 bg-slate-50 text-slate-700', icon: <CalendarDays size={10} className="shrink-0" /> }
}

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
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-700">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Visualização mensal</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-900">{month} {year}</span>
                <div className="flex items-center gap-1">
                  <button className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" onClick={goToPreviousMonth}>
                    <ArrowLeft size={17} />
                  </button>
                  <button className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" onClick={goToNextMonth}>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar colaborador"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
              <Filter size={15} />
              Filtrar
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm">
              <span className="rounded-full bg-white p-1 shadow-sm">
                <AlertTriangle size={11} />
              </span>
              Falta
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
              <span className="rounded-full bg-white p-1 shadow-sm">
                <CalendarClock size={11} />
              </span>
              Atraso
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-sm">
              <span className="rounded-full bg-white p-1 shadow-sm">
                <Stethoscope size={11} />
              </span>
              Atestado
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
              <span className="rounded-full bg-white p-1 shadow-sm">
                <Plane size={11} />
              </span>
              Férias
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
              <span className="rounded-full bg-white p-1 shadow-sm">
                <BadgeCheck size={11} />
              </span>
              Licença
            </span>
          </div>
        </div>

        <div className="calendar-scrollbar relative w-full overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          <table className="w-full min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-[240px] min-w-[240px] max-w-[240px] border-r border-b border-slate-200 bg-slate-100 px-3 py-2 text-left align-middle">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm">
                  <div className="rounded-full bg-blue-50 p-1.5 text-blue-600">
                    <User size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Colaboradores</p>
                    <p className="text-[11px] text-slate-500">Nome e função</p>
                  </div>
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
                    className={`w-[80px] min-w-[80px] max-w-[80px] border-r border-b border-slate-200 px-1 py-1 text-center align-middle font-bold text-gray-700 ${day === 1 ? 'border-l border-slate-200' : ''} ${isToday ? 'bg-blue-100' : hasFeriado ? 'bg-amber-50' : 'bg-white'}`}
                  >
                    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-white/70 bg-white/70 px-1 py-1 shadow-sm">
                      <span className="relative flex h-7 items-center justify-center text-base font-bold">
                        {isToday && (
                          <span className="absolute h-7 w-7 rounded-full bg-blue-600 opacity-80" style={{zIndex:0}}></span>
                        )}
                        <span className={isToday ? 'relative z-10 font-bold text-white' : ''}>{day}</span>
                      </span>
                      <span className="text-[10px] text-gray-400">{weekDays[new Date(year, monthIdx, day).getDay()]}</span>
                      {hasFeriado && (
                        <span className="mt-0.5 text-[10px] font-semibold text-yellow-700" style={{lineHeight:'1'}}>
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
                <th scope="row" className="h-16 w-[240px] min-w-[240px] max-w-[240px] border-r border-b border-slate-200 bg-white align-middle font-normal">
                  <div className="mx-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 shadow-sm">
                    <img src={buildAvatarUrl(colab.nome)} alt={colab.nome} className="h-9 w-9 rounded-full border border-blue-100" />
                    <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
                      <span className="truncate text-sm font-semibold leading-tight text-blue-700">{colab.nome}</span>
                      <span className="mt-0.5 truncate text-[11px] leading-tight text-gray-400">{colab.cargo}</span>
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
                      className={`h-16 w-[80px] min-w-[80px] max-w-[80px] border-r border-b border-slate-200 align-middle transition ${day === 1 ? 'border-l border-slate-200' : ''} ${isToday ? 'bg-blue-50' : 'bg-white'}`}
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 py-1">
                        {eventosNoDia.length > 0 && (
                          <div className="flex w-full flex-col items-center gap-1">
                            {eventosNoDia.map((evento, idx) => {
                              const meta = getBadgeMeta(evento)
                              return (
                                <span
                                  key={`${colab.key}-${day}-${idx}`}
                                  className={`inline-flex max-w-full items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold shadow-sm ${meta.className}`}
                                  title={tooltip || undefined}
                                  style={{ lineHeight: '1.1' }}
                                >
                                  {meta.icon}
                                  <span className="truncate">{meta.label}</span>
                                </span>
                              )
                            })}
                          </div>
                        )}
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
