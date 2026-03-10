import React, { useState, useRef, useEffect } from 'react'
import { formatDate } from '../utils/formatters'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
  disabled?: boolean
  ref?: React.Ref<HTMLInputElement>
  autoOpen?: boolean
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(({
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  className = '',
  error = false,
  disabled = false,
  autoOpen = false
}, ref) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [yearInput, setYearInput] = useState(new Date().getFullYear().toString())
  const calendarRef = useRef<HTMLDivElement>(null)

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

  // Abre o calendário automaticamente quando autoOpen muda para true
  useEffect(() => {
    if (autoOpen && !showCalendar) {
      setShowCalendar(true)
    }
  }, [autoOpen, showCalendar])

  // Atualiza selectedDate quando value muda
  useEffect(() => {
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
    const formatted = formatDate(e.target.value)
    onChange(formatted)

    // Atualiza o calendário conforme digita
    if (formatted.length === 10) {
      const [day, month, year] = formatted.split('/')
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
    if (autoOpen && !showCalendar) {
      setShowCalendar(true)
    }
  }

  return (
    <div className="relative inline-block w-full" ref={calendarRef}>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 pr-10 ${className} ${error ? 'border-red-500' : ''} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 transform -translate-y-1/2"
        onClick={(e) => {
          e.stopPropagation()
          if (!disabled) {
            setShowCalendar(!showCalendar)
          }
        }}
        disabled={disabled}
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Calendário */}
      {showCalendar && (
        <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-lg p-4 z-50 border border-gray-200" style={{minWidth: '300px', zIndex: 9999}}>
          {/* Cabeçalho do calendário */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-2">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))}
                className="px-2 py-1 border border-gray-300 rounded text-sm font-semibold capitalize"
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
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                placeholder="AAAA"
              />
            </div>
            
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-600 py-1">
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
                days.push(<div key={`empty-${i}`} className="aspect-square" />)
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
                    className={`
                      aspect-square p-1 text-sm rounded hover:bg-indigo-100 transition-colors
                      ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
                      ${isToday && !isSelected ? 'border-2 border-indigo-600' : ''}
                    `}
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
