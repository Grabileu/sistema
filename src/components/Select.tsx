import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  label: string
  value: string | number
}

interface SelectProps {
  value: string | number
  onChange: (value: string | number) => void
  options: SelectOption[]
  placeholder?: string
  buttonClassName?: string
  menuClassName?: string
  buttonRef?: React.Ref<HTMLButtonElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>
  nextRef?: React.RefObject<HTMLElement | null>
  showSearchBar?: boolean // NOVO: só mostra barra de busca se true
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  buttonClassName = '',
  menuClassName = '',
  buttonRef,
  onKeyDown,
  nextRef,
  showSearchBar = false
}) => {

  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [search, setSearch] = useState('')
  const [openUpward, setOpenUpward] = useState(false)
  const [menuMaxHeight, setMenuMaxHeight] = useState(256)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null)

  const updateMenuViewportPosition = () => {
    const anchor = triggerButtonRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const margin = 8
    const preferredHeight = 256

    const spaceBelow = viewportHeight - rect.bottom - margin
    const spaceAbove = rect.top - margin
    const shouldOpenUpward = spaceBelow < preferredHeight && spaceAbove > spaceBelow
    const availableSpace = shouldOpenUpward ? spaceAbove : spaceBelow
    const safeMaxHeight = Math.max(120, Math.min(320, Math.floor(availableSpace)))

    setOpenUpward(shouldOpenUpward)
    setMenuMaxHeight(safeMaxHeight)
  }

  const selectedIndex = options.findIndex((option) => option.value === value)

  // Só filtra se a barra de busca estiver ativa
  const filteredOptions = (showSearchBar && search.trim().length > 0)
    ? options.filter(opt => opt.label.toLowerCase().includes(search.trim().toLowerCase()))
    : options

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    if (selectedIndex >= 0) {
      setHighlightedIndex(selectedIndex)
      return
    }

    setHighlightedIndex(options.length > 0 ? 0 : -1)
  }, [open, selectedIndex, options.length])

  useEffect(() => {
    if (!open) return

    updateMenuViewportPosition()

    window.addEventListener('resize', updateMenuViewportPosition)
    window.addEventListener('scroll', updateMenuViewportPosition, true)

    return () => {
      window.removeEventListener('resize', updateMenuViewportPosition)
      window.removeEventListener('scroll', updateMenuViewportPosition, true)
    }
  }, [open])

  const focusNext = () => {
    if (nextRef?.current) {
      setTimeout(() => nextRef.current?.focus(), 0)
      return
    }

    const current = triggerButtonRef.current
    if (!current) return

    const root = current.closest('form, [role="dialog"], main, body') ?? document
    const focusableElements = Array.from(
      root.querySelectorAll<HTMLElement>(
        'input:not([disabled]):not([type="hidden"]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      if (element === current) return true
      return element.offsetParent !== null
    })

    const currentIndex = focusableElements.indexOf(current)
    if (currentIndex === -1) return

    const next = focusableElements.slice(currentIndex + 1).find((element) => !element.hasAttribute('disabled'))
    if (!next) return

    setTimeout(() => next.focus(), 0)
  }

  const selectAtIndex = (index: number) => {
    if (index < 0 || index >= options.length) return

    const option = options[index]
    onChange(option.value)
    setOpen(false)
    focusNext()
  }

  const moveHighlight = (direction: 1 | -1) => {
    if (options.length === 0) return

    const baseIndex = highlightedIndex >= 0 ? highlightedIndex : selectedIndex >= 0 ? selectedIndex : 0
    let nextIndex = baseIndex + direction

    if (nextIndex < 0) nextIndex = options.length - 1
    if (nextIndex >= options.length) nextIndex = 0

    setHighlightedIndex(nextIndex)
  }

  const handleButtonKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
      } else {
        moveHighlight(1)
      }
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
      } else {
        moveHighlight(-1)
      }
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
      } else {
        const indexToSelect = highlightedIndex >= 0 ? highlightedIndex : selectedIndex >= 0 ? selectedIndex : 0
        selectAtIndex(indexToSelect)
      }
      return
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const selectedOption = options.find((option) => option.value === value)
  const displayLabel = selectedOption?.label ?? placeholder

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        ref={(element) => {
          triggerButtonRef.current = element

          if (!buttonRef) return
          if (typeof buttonRef === 'function') {
            buttonRef(element)
            return
          }

          ;(buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = element
        }}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 shadow-sm flex items-center justify-between focus:outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 ${buttonClassName}`}
      >
        <span className={selectedOption ? 'text-slate-700' : 'text-slate-500'}>{displayLabel}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-auto ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} ${menuClassName}`}
          style={{ maxHeight: `${menuMaxHeight}px` }}
        >
          {showSearchBar && options.length > 15 && (
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-2">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">Nenhuma opção encontrada</div>
          ) : (
            filteredOptions.map((option, index) => (
              <button
                key={`${option.value}`}
                type="button"
                onClick={() => selectAtIndex(options.indexOf(option))}
                onMouseEnter={() => setHighlightedIndex(options.indexOf(option))}
                className={`w-full px-3 py-2 text-left text-sm ${highlightedIndex === options.indexOf(option) ? 'bg-slate-100' : 'hover:bg-slate-50'} ${option.value === value ? 'text-slate-900' : 'text-slate-700'}`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Select
