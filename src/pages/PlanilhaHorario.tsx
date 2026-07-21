import React from 'react'
import type { Employee } from '../App'
import { Search, Calendar, ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react'

interface PlanilhaHorarioProps {
  onNavigate?: (route: string) => void
  employees: Employee[]
}

const PlanilhaHorario: React.FC<PlanilhaHorarioProps> = ({ onNavigate, employees }) => {
  const headerLabels = [
    'Dias',
    'Registros',
    'Jornada prevista',
    'H.T.',
    'H.N.',
    'H.E.',
    'H.F.',
    'Saldo',
    'Incidentes',
    'Motivo',
  ]

  const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const pad2 = (value: number) => String(value).padStart(2, '0')
  const formatDayLabel = (date: Date) => `${weekdays[date.getDay()]} - ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`
  const formatPeriodRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    return `${pad2(start.getDate())}/${pad2(start.getMonth() + 1)}/${start.getFullYear()} - ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`
  }
  const createRowForDate = (date: Date) => ({
    dias: formatDayLabel(date),
    registros: '-',
    jornada: '08:00 - 12:00 - 13:00 - 17:00',
    ht: '00:00',
    hn: '08:00',
    he: '00:00',
    hf: '00:00',
    saldo: '+ 00:00',
    incidentes: 'Sem registro',
    motivo: '',
  })

  const buildRowsThroughDate = (date: Date) => {
    const rows: Array<Record<string, string>> = []
    const current = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    while (current <= end) {
      rows.push(createRowForDate(new Date(current)))
      current.setDate(current.getDate() + 1)
    }
    return rows
  }

  const colRefs = React.useRef<Array<HTMLTableColElement | null>>([])
  const tableRef = React.useRef<HTMLTableElement | null>(null)
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date())
  const [colWidths, setColWidths] = React.useState<number[]>([])
  const [rows, setRows] = React.useState<Array<Record<string, string>>>(() => buildRowsThroughDate(new Date()))
  const [searchName, setSearchName] = React.useState('')
  const [employeePage, setEmployeePage] = React.useState(0)
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | null>(() => employees[0]?.id ?? null)
  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId) ?? employees[0]
  const [hoveredCell, setHoveredCell] = React.useState<{row: number; col: number} | null>(null)
  const [editingCell, setEditingCell] = React.useState<{row: number; col: number} | null>(null)
  const [showHTTooltip, setShowHTTooltip] = React.useState(false)

  const startXRef = React.useRef<number>(0)
  const startWidthsRef = React.useRef<number[]>([])
  const resizingIndexRef = React.useRef<number | null>(null)

  const onMouseMove = (ev: MouseEvent) => {
    const idx = resizingIndexRef.current
    if (idx === null) return
    const delta = ev.clientX - startXRef.current
    const next = [...startWidthsRef.current]
    next[idx] = Math.max(idx === 1 ? 140 : 60, startWidthsRef.current[idx] + delta)
    // ensure 'Registros' (index 1) is at least as wide as 'Jornada prevista' (index 2)
    if (idx === 2) {
      next[1] = Math.max(next[1] || 0, next[2])
    }
    if (idx === 1) {
      next[1] = Math.max(next[1], next[2] || 140)
    }
    setColWidths(next)
  }

  const stopResize = () => {
    resizingIndexRef.current = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', stopResize)
  }

  const startResize = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    startXRef.current = (e as any).clientX
    startWidthsRef.current = colRefs.current.map((c) => c?.getBoundingClientRect().width ?? 100)
    resizingIndexRef.current = index
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', stopResize)
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      if (now.toDateString() !== currentDate.toDateString()) {
        setCurrentDate(now)
        setRows(buildRowsThroughDate(now))
      }
    }, 60_000)
    return () => clearInterval(interval)
  }, [currentDate])

  React.useEffect(() => {
    // initialize widths after first paint
    const raf = requestAnimationFrame(() => {
      // try to load persisted widths
      try {
        const raw = localStorage.getItem('planilha_col_widths')
        if (raw) {
          const parsed = JSON.parse(raw) as number[]
          if (Array.isArray(parsed) && parsed.length === headerLabels.length) {
            // ensure registros >= jornada prevista
            parsed[1] = Math.max(parsed[1] || 0, parsed[2] || 140)
            setColWidths(parsed)
            return
          }
        }
      } catch {}

      const table = tableRef.current
      if (!table) return
      const n = headerLabels.length
      const widths: number[] = new Array(n).fill(80)
      for (let i = 0; i < n; i++) {
        let max = 60
        for (let r = 0; r < table.rows.length; r++) {
          const row = table.rows[r]
          const cell = row.cells[i]
          if (!cell) continue
          const child = cell.firstElementChild as HTMLElement | null
          const measureEl = child ?? cell
          const w = measureEl.scrollWidth
          if (w > max) max = w
        }
        widths[i] = Math.max(i === 1 ? 140 : 80, Math.ceil(max) + 24)
      }
      // ensure 'Registros' is at least as wide as 'Jornada prevista'
      if (widths.length) {
        widths[1] = Math.max(widths[1], widths[2] || 140)
        setColWidths(widths)
      }
    })
    return () => {
      cancelAnimationFrame(raf)
      stopResize()
    }
  }, [])

  // persist column widths whenever they change
  React.useEffect(() => {
    try {
      if (colWidths && colWidths.length) {
        localStorage.setItem('planilha_col_widths', JSON.stringify(colWidths))
      }
    } catch {}
  }, [colWidths])

  const autoSize = React.useCallback((index: number) => {
    const table = tableRef.current
    if (!table) return

    let max = 60
    // iterate all rows and measure the cell content width
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r]
      const cell = row.cells[index]
      if (!cell) continue
      // measure inner content width
      const child = cell.firstElementChild as HTMLElement | null
      const measureEl = child ?? cell
      const w = measureEl.scrollWidth
      if (w > max) max = w
    }

    // add some padding buffer
    let desired = Math.max(index === 1 ? 140 : 60, Math.ceil(max) + 24)
    setColWidths((prev) => {
      const next = [...prev]
      // if autosizing 'Registros', ensure it's not smaller than jornada
      if (index === 1) {
        const jornadaW = prev[2] || 140
        desired = Math.max(desired, jornadaW)
      }
      next[index] = desired
      // if autosizing 'Jornada prevista', make 'Registros' at least as wide
      if (index === 2) {
        next[1] = Math.max(next[1] || 0, desired)
      }
      return next
    })
  }, [])

  const formatDias = (s: string) => {
    if (!s) return s
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]
      if (/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(ch)) {
        return s.slice(0, i) + ch.toUpperCase() + s.slice(i + 1)
      }
    }
    return s
  }

  const isTodayFromDias = (s: string) => {
    if (!s) return false
    const m = s.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/)
    if (!m) return false
    const parts = m[1].split('/')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const today = new Date()
    return day === today.getDate() && month === (today.getMonth() + 1)
  }

  const computeRegistroStatus = (row: Record<string, string>) => {
    if (isTodayFromDias(row.dias)) return 'gray'
    const reg = (row.registros || '').trim()
    if (!reg || reg === '-') return 'red'
    const matches = reg.match(/\d{1,2}:\d{2}/g) || []
    if (matches.length >= 4) return 'green'
    if (matches.length === 3) return 'yellow'
    return 'red'
  }

  const statusLabelFor = (s: string) => {
    switch (s) {
      case 'gray': return 'Hoje'
      case 'green': return 'Presença completa'
      case 'yellow': return 'Faltou uma batida'
      case 'red': return 'Sem presença'
      default: return ''
    }
  }

  const statusClassFor = (s: string) => {
    switch (s) {
      case 'gray': return 'bg-gray-400'
      case 'green': return 'bg-green-500'
      case 'yellow': return 'bg-yellow-400'
      case 'red': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Planilha Horário</h1>
            <p className="text-sm text-gray-500">Edite, adicione e reorganize os pontos marcados pelo seu colaborador em tempo real</p>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <div className="relative">
                  <input placeholder="Nome do colaborador" className="w-full border rounded-lg px-4 py-2" />
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="w-64">
                <div className="flex items-center border rounded-lg px-3 py-2 text-sm text-gray-600">
                  <Calendar className="mr-2" />
                  {formatPeriodRange(currentDate)}
                </div>
              </div>

              <div className="w-44">
                <select className="w-full border rounded-lg px-3 py-2">
                  <option>Equipes</option>
                </select>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Pesquisar</button>
              <button className="border px-4 py-2 rounded-lg">Filtros</button>
            </div>

            <div className="mt-4 bg-gray-50 border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEmployeePage((prev) => Math.max(prev - 1, 0))}
                  disabled={employeePage === 0}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex-1 overflow-visible">
                  <div className="flex gap-2 whitespace-nowrap">
                    {employees.slice(employeePage * 6, employeePage * 6 + 6).map((employee) => {
                      const initials = employee.nomeCompleto
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0].toUpperCase())
                        .join('')

                      return (
                        <button
                          key={employee.id}
                          onClick={() => setSelectedEmployeeId(employee.id)}
                          aria-pressed={selectedEmployeeId === employee.id}
                          className={`flex w-44 flex-shrink-0 items-center gap-3 px-3 py-2 min-h-[56px] rounded-xl border transition-all duration-200 ${selectedEmployeeId === employee.id ? 'border-sky-300 bg-sky-50 text-slate-900 shadow-md' : 'border-gray-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md'}`}
                        >
                          <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-semibold text-slate-700">
                            {initials || 'FN'}
                          </span>
                          <div className="min-w-0 text-left">
                            <div className="truncate text-sm font-medium leading-5">{employee.nomeCompleto}</div>
                            <div className="truncate text-[11px] text-gray-500 leading-4">{employee.cargo || 'Cargo'}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEmployeePage((prev) => prev + 1)}
                  disabled={(employeePage + 1) * 6 >= employees.length}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-slate-700">
                  {selectedEmployee?.nomeCompleto
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0].toUpperCase())
                    .join('')}
                </div>
                <div>
                  <div className="font-semibold">{selectedEmployee?.nomeCompleto ?? 'Selecionar funcionário'}</div>
                  <div className="text-sm text-gray-500">{selectedEmployee?.cargo || 'Cargo'}</div>
                  {selectedEmployee?.turno ? (
                    <div className="text-xs text-gray-500">Turno: {selectedEmployee.turno}</div>
                  ) : null}
                </div>
                <div className="ml-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border">0 Ocorrências</span>
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border">0 Faltas</span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border">0 Abonos</span>
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border">0 Ajustes</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-red-600">Saldo do período: 00:00</div>
                <div className="text-sm text-gray-600 flex items-center gap-2"><MoreHorizontal /> Ações</div>
              </div>
            </div>

            <div className="mt-4 bg-white/30 backdrop-blur-sm border border-gray-200 rounded-lg overflow-auto">
              {/* Table with resizable columns using colgroup */}
              <div className="overflow-x-auto">
                <table
                  className="text-sm table-fixed border-collapse"
                  ref={(el) => { tableRef.current = el }}
                  style={{ width: colWidths && colWidths.length ? `${colWidths.reduce((s, w) => s + w, 0)}px` : undefined }}
                >
                  <colgroup>
                    {/** Generate cols based on headerLabels length */}
                    {headerLabels.map((_, i) => (
                      <col
                        key={i}
                        ref={(el) => (colRefs.current[i] = el)}
                        style={{ width: colWidths[i] ? `${colWidths[i]}px` : undefined }}
                      />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="bg-white/40">
                      {headerLabels.map((label, i) => (
                        <th key={i} className="relative px-3 py-2 border-b border-r border-gray-300 bg-gray-50 text-left">
                          <div className="select-none whitespace-nowrap">{label}</div>
                          <div
                            onMouseDown={(e) => startResize(e as any, i)}
                            onDoubleClick={(e) => { e.stopPropagation(); autoSize(i) }}
                            className="absolute top-0 right-0 h-full w-2 -mr-1 cursor-col-resize"
                            style={{ touchAction: 'none' }}
                          >
                            <div className="h-full w-px bg-gray-300 mx-auto" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, rowIndex) => (
                      <tr key={rowIndex} className="bg-white/10 border-b border-gray-300 hover:bg-sky-100 transition-colors duration-150">
                        <td className="px-3 py-2 border-r border-gray-300 truncate">{formatDias(r.dias)}</td>
                        <td className="px-3 py-2 border-r border-gray-300 truncate relative">
                          <div className="pr-6">{r.registros}</div>
                          {(() => {
                            const st = computeRegistroStatus(r)
                            const cls = statusClassFor(st)
                            const title = statusLabelFor(st)
                            return (
                              <span title={title} className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${cls}`} />
                            )
                          })()}
                        </td>
                        <td className="px-3 py-2 border-r border-gray-300 truncate">{r.jornada}</td>
                        <td className="px-3 py-2 border-r border-gray-300 truncate">{r.ht}</td>
                        <td className="px-3 py-2 border-r border-gray-300 truncate">{r.hn}</td>
                        <td className="px-3 py-2 border-r border-gray-300 truncate">{r.he}</td>
                        <td className="px-3 py-2 border-r border-gray-300 truncate">{r.hf}</td>
                        <td className="px-3 py-2 border-r border-gray-300 truncate">{r.saldo}</td>
                        <td className="px-3 py-2 border-r border-gray-300 truncate">{r.incidentes}</td>
                        <td
                          className="px-3 py-2 relative min-w-0"
                          onMouseEnter={() => setHoveredCell({row: rowIndex, col: 9})}
                          onMouseLeave={() => { if (!editingCell) setHoveredCell(null) }}
                        >
                          {editingCell && editingCell.row === rowIndex && editingCell.col === 9 ? (
                            <input
                              autoFocus
                              className="block w-full min-w-0 border rounded px-2 py-1 text-sm"
                              value={r.motivo}
                              onChange={(e) => {
                                const next = [...rows]
                                next[rowIndex] = { ...next[rowIndex], motivo: e.target.value }
                                setRows(next)
                              }}
                              onBlur={() => { setEditingCell(null); setHoveredCell(null) }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') { setEditingCell(null); setHoveredCell(null) }
                                if (e.key === 'Escape') { setEditingCell(null); setHoveredCell(null) }
                              }}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              {r.motivo ? (
                                <>
                                  <span className="truncate">{r.motivo}</span>
                                  <button
                                    onClick={() => setEditingCell({row: rowIndex, col: 9})}
                                    disabled={!!editingCell}
                                    className={`text-left text-xs font-medium text-blue-700 hover:text-blue-900 transition min-w-[90px] ${editingCell || !hoveredCell || hoveredCell.row !== rowIndex ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100 pointer-events-auto'}`}
                                    aria-label="Editar motivo"
                                  >
                                    Editar motivo
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className={`truncate ${hoveredCell && hoveredCell.row === rowIndex ? 'invisible opacity-0' : 'visible opacity-100'}`}>
                                    -
                                  </span>
                                  <button
                                    onClick={() => setEditingCell({row: rowIndex, col: 9})}
                                    disabled={!!editingCell}
                                    className={`text-left text-xs font-medium text-blue-700 hover:text-blue-900 transition min-w-[90px] ${editingCell || !hoveredCell || hoveredCell.row !== rowIndex ? 'invisible opacity-0 pointer-events-none' : 'visible opacity-100 pointer-events-auto'}`}
                                    aria-label="Editar motivo"
                                  >
                                    Editar motivo
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanilhaHorario
