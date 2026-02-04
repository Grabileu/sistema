import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'

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
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cargo?')) {
      onDeletePosition?.(id)
      setOpenMenuId(null)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Lista de cargos</h1>
          <button
            onClick={() => onNavigate?.('cadastro-cargo')}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded font-medium hover:bg-indigo-700"
          >
            Cadastrar cargo
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg overflow-visible">
          {positions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">Nenhum cargo cadastrado</p>
              <button
                onClick={() => onNavigate?.('cadastro-cargo')}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded font-medium hover:bg-indigo-700"
              >
                Cadastrar primeiro cargo
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border-b text-right text-sm text-gray-600">
                Página 1/1 - Exibindo {positions.length} de {positions.length} registros
              </div>
              
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Total de funcionários
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
                  {positions.map((position) => (
                    <tr key={position.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.codigo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-800">
                          {position.nome}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.totalFuncionarios}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.criadoEm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="relative" ref={openMenuId === position.id ? menuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === position.id ? null : position.id)}
                            className="hover:bg-gray-100 p-1 rounded"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {openMenuId === position.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                              <button
                                onClick={() => {
                                  onEditPosition?.(position.id)
                                  setOpenMenuId(null)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                              >
                                <Edit2 size={16} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(position.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Positions
