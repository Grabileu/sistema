import React, { useRef } from 'react'
import { Search, MoreVertical } from 'lucide-react'
import { formatCPF } from '../utils/formatters'
import { useClickOutside } from '../hooks/useClickOutside'


interface DismissedEmployeesProps {
  employees: Array<{
    id: string;
    nomeCompleto: string;
    email?: string;
    cpf?: string;
    dataDemissao?: string;
    avatar?: string;
  }>;
}

const DismissedEmployees: React.FC<DismissedEmployeesProps> = ({ employees }) => {
  const dismissed = employees;

  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [isActionMenuUpward, setIsActionMenuUpward] = React.useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null)
  
  const menuBtnRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const [cpfFilter, setCpfFilter] = React.useState('');

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

  // Função para readmitir funcionário
  const handleReadmit = (id: string) => {
    // Recupera listas do localStorage
    const employeesRaw = localStorage.getItem('employees');
    const dismissedRaw = localStorage.getItem('dismissedEmployees');
    let employeesArr = employeesRaw ? JSON.parse(employeesRaw) : [];
    let dismissedArr = dismissedRaw ? JSON.parse(dismissedRaw) : [];
    // Encontra o funcionário a readmitir
    const idx = dismissedArr.findIndex((e: any) => e.id === id);
    if (idx === -1) return;
    const readmitido = { ...dismissedArr[idx] };
    // Remove dataDemissao
    delete readmitido.dataDemissao;
    // Remove da lista de demitidos
    dismissedArr = dismissedArr.filter((e: any) => e.id !== id);
    // Adiciona de volta aos ativos
    employeesArr.push(readmitido);
    // Atualiza localStorage
    localStorage.setItem('employees', JSON.stringify(employeesArr));
    localStorage.setItem('dismissedEmployees', JSON.stringify(dismissedArr));
    // Permanece na tela de demitidos
    localStorage.setItem('currentPage', 'demitidos');
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Lista de demitidos</h1>

        {/* Card filtros */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Search size={18} />
                <span>Filtros</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Para uma busca mais específica, preencha os filtros que desejar.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500">Nome</label>
              <div className="relative mt-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite"
                  className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100 pr-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpfFilter}
                onChange={(e) => setCpfFilter(formatCPF(e.target.value))}
                maxLength={14}
                className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">E-mail</label>
              <input
                type="text"
                placeholder="Digite"
                className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700">
                Pesquisar
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de demitidos */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              Página 1/1 - Exibindo {dismissed.length} de {dismissed.length} registros.
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3">Data de demissão</th>
                  <th className="py-3">Funcionário</th>
                  <th className="py-3">CPF</th>
                  <th className="py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {dismissed.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-gray-500">
                      Nenhum funcionário demitido encontrado.
                    </td>
                  </tr>
                ) : dismissed.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-4">{d.dataDemissao || '-'}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                          {d.nomeCompleto.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-indigo-700 hover:underline cursor-pointer">{d.nomeCompleto}</div>
                          <div className="text-xs text-gray-500">{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-500">
                      {d.cpf || '-'}
                    </td>
                    <td className="py-4 text-right">
                      <div className="relative inline-block" ref={openMenuId === d.id ? menuRef : null}>
                        <button
                          className="p-2 hover:bg-gray-100 rounded"
                          ref={el => menuBtnRefs.current[d.id] = el}
                          onClick={(event) => toggleActionMenu(d.id, event)}
                          aria-expanded={openMenuId === d.id}
                        >
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                        {openMenuId === d.id && (
                          <div className={`absolute right-0 w-44 max-h-[min(16rem,calc(100vh-2rem))] overflow-y-auto overscroll-contain rounded-md border border-gray-200 bg-white py-1 shadow-xl ${isActionMenuUpward ? 'bottom-full mb-1' : 'top-full mt-1'}`} style={{ zIndex: 9999 }}>
                            <button
                              onClick={() => { handleReadmit(d.id); setOpenMenuId(null); }}
                              className="w-full px-4 py-2 text-left text-sm text-indigo-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              Readmitir
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
        </div>
        
      </div>
    </div>
  )
}

export default DismissedEmployees
