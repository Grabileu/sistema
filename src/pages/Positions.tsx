import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { useClickOutside } from '../hooks/useClickOutside'

interface Position {
  id: string
  codigo: string
  nome: string
  totalFuncionarios: number
  criadoEm: string
}

interface PositionsProps {
  positions: Position[]
  onNavigate?: (route: string) => void
  onDeletePosition?: (id: string) => void
  onEditPosition?: (id: string) => void
}

const Positions: React.FC<PositionsProps> = ({ positions, onNavigate, onDeletePosition, onEditPosition }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isActionMenuUpward, setIsActionMenuUpward] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cargo?')) {
      onDeletePosition?.(id)
      setOpenMenuId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Lista de cargos</h1>
            <p className="mt-1 text-sm text-slate-500">Visualize e organize os cargos da empresa.</p>
          </div>
          <button
            onClick={() => onNavigate?.('cadastro-cargo')}
            className="app-button-primary"
          >
            Cadastrar cargo
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="app-card overflow-visible">
          {positions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8">
                <p className="text-lg font-semibold text-slate-700">Nenhum cargo cadastrado</p>
                <p className="mt-1 text-sm text-slate-500">Cadastre o primeiro cargo para começar.</p>
                <button
                  onClick={() => onNavigate?.('cadastro-cargo')}
                  className="mt-4 app-button-primary"
                >
                  Cadastrar primeiro cargo
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-600">
                Exibindo {positions.length} registro(s)
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Total de funcionários</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Criado em</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                    {positions.map((position) => (
                      <tr key={position.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{position.codigo}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800">{position.nome}</span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{position.totalFuncionarios}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{position.criadoEm}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          <div className="relative" ref={openMenuId === position.id ? menuRef : null}>
                            <button
                              onClick={(event) => toggleActionMenu(position.id, event)}
                              className="rounded-lg p-1.5 transition hover:bg-slate-100"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {openMenuId === position.id && (
                              <div className={`absolute right-0 z-50 w-48 max-h-[min(16rem,calc(100vh-2rem))] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${isActionMenuUpward ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                                <button
                                  onClick={() => {
                                    onEditPosition?.(position.id)
                                    setOpenMenuId(null)
                                  }}
                                  className="flex w-full items-center gap-3 rounded-t-xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                                >
                                  <Edit2 size={16} />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(position.id)}
                                  className="flex w-full items-center gap-3 rounded-b-xl px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Positions
