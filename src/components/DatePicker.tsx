import React, { useState, useRef, useEffect } from 'react'
import { formatDate } from '../utils/formatters'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
  disabled?: boolean
  autoOpen?: boolean
  openOnFocus?: boolean
  enterSelectsToday?: boolean
  nextRef?: React.RefObject<HTMLElement | null>
  calendarAlign?: 'left' | 'right'
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(({
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  className = '',
  error = false,
  disabled = false,
  autoOpen = false,
  openOnFocus = true,
  enterSelectsToday = true,
  nextRef,
  calendarAlign = 'left'
}, ref) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [yearInput, setYearInput] = useState(new Date().getFullYear().toString())
  const calendarRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hasHandledInitialAutoOpen = useRef(false)

  const setInputRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node

    if (typeof ref === 'function') {
      ref(node)
      return
    }

    if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
    }
  }

  // Fecha o calendário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

  // autoOpen e para abertura programatica (ex.: encadear datas),
  // mas nao deve abrir automaticamente no carregamento inicial.
  useEffect(() => {
    if (!hasHandledInitialAutoOpen.current) {
      hasHandledInitialAutoOpen.current = true
      return
    }

    if (autoOpen) {
      setShowCalendar(true)
    }
  }, [autoOpen])

  // Atualiza selectedDate quando value muda
  useEffect(() => {
    if (!value || !value.trim()) {
      const today = new Date()
      setSelectedDate(null)
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
      setYearInput(String(today.getFullYear()))
      return
    }

    if (value && value.length === 10) {
      const [day, month, year] = value.split('/')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (!isNaN(date.getTime())) {
        setSelectedDate(date)
        setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1))
        setYearInput(year)
      }
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Só formata se não estiver no padrão DD/MM/AAAA
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      value = formatDate(value);
    }
    onChange(value);

    // Atualiza o calendário conforme digita
    if (value.length === 10) {
      const [day, month, year] = value.split('/')
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      if (!isNaN(date.getTime())) {
        setSelectedDate(date)
        setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1))
        setYearInput(year)
      }
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    onChange(`${day}/${month}/${year}`)
    setShowCalendar(false)

    if (nextRef?.current && inputRef.current) {
      focusNext(inputRef.current)
    }
  }

  const handleSelectToday = () => {
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setYearInput(String(today.getFullYear()))
    handleDateSelect(today)
  }

  const focusNext = (currentInput: HTMLInputElement) => {
    if (nextRef?.current) {
      setTimeout(() => nextRef.current?.focus(), 0)
      return
    }

    const root = currentInput.closest('form, [role="dialog"], main, body') ?? document
    const focusableElements = Array.from(
      root.querySelectorAll<HTMLElement>(
        'input:not([disabled]):not([type="hidden"]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      if (element === currentInput) return true
      return element.offsetParent !== null
    })

    const currentIndex = focusableElements.indexOf(currentInput)
    if (currentIndex === -1) return

    const next = focusableElements.slice(currentIndex + 1).find((element) => !element.hasAttribute('disabled'))
    if (!next) return

    setTimeout(() => next.focus(), 0)
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 4) {
      setYearInput(value)
      if (value.length === 4) {
        setCurrentMonth(new Date(parseInt(value), currentMonth.getMonth()))
      }
    }
  }

  const handleInputFocus = () => {
    if (openOnFocus && !showCalendar) {
      setShowCalendar(true)
    }
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return

    event.preventDefault()

    if (enterSelectsToday) {
      handleSelectToday()
    }

    focusNext(event.currentTarget)
  }

  return (
    <div className="relative inline-block w-full" ref={calendarRef}>
      <input
        ref={setInputRefs}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 ${className} ${error ? 'border-red-500' : ''} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) {
            setShowCalendar(!showCalendar)
          }
        }}
        disabled={disabled}
        aria-label="Abrir calendário"
      >
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Calendário */}
      {showCalendar && (
        <div
          className={`absolute top-full mt-2 z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ${calendarAlign === 'right' ? 'right-0' : 'left-0'}`}
          style={{ minWidth: 200, maxWidth: 300, width: 'auto', zIndex: 9999 }}
        >
          {/* Cabeçalho do calendário */}
          <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
              aria-label="Mês anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 grid gap-2 grid-cols-1 items-center justify-center sm:grid-cols-[minmax(100px,1fr)_minmax(70px,1fr)]">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))}
                className="w-full min-w-[100px] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-semibold capitalize text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'].map((month, i) => (
                  <option key={i} value={i}>{month}</option>
                ))}
              </select>
              <input
                type="text"
                value={yearInput}
                onChange={handleYearChange}
                className="w-full min-w-[70px] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-center text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="AAAA"
              />
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
              aria-label="Próximo mês"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dias da semana */}
          <div className="mb-2 grid grid-cols-7 gap-1 text-xs uppercase tracking-wide text-slate-500">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const year = currentMonth.getFullYear()
              const month = currentMonth.getMonth()
              const firstDay = new Date(year, month, 1).getDay()
              const daysInMonth = new Date(year, month + 1, 0).getDate()
              const days = []

              // Dias vazios antes do primeiro dia
              for (let i = 0; i < firstDay; i++) {
                days.push(<div key={`empty-${i}`} className="aspect-square rounded-lg bg-transparent" />)
              }

              // Dias do mês
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day)
                const isSelected = selectedDate?.toDateString() === date.toDateString()
                const isToday = new Date().toDateString() === date.toDateString()

                days.push(
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={`flex aspect-square items-center justify-center rounded-lg text-sm transition ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-blue-50'} ${isToday && !isSelected ? 'border border-blue-200' : 'border border-transparent'} focus:outline-none focus:ring-2 focus:ring-blue-100`}
                  >
                    {day}
                  </button>
                )
              }

              return days
            })()}
          </div>
        </div>
      )}
    </div>
  )
})

DatePicker.displayName = 'DatePicker'

export default DatePicker
