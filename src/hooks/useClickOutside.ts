import { useEffect, useRef, RefObject } from 'react'

/**
 * Chama `handler` sempre que o usuário clica fora do elemento referenciado.
 * O handler é mantido em uma ref interna para evitar re-execuções desnecessárias.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handlerRef.current()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref])
}
