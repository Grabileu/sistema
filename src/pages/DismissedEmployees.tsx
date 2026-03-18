import React, { useRef } from 'react'
import ReactDOM from 'react-dom'
import { Search } from 'lucide-react'
import { formatCPF } from '../utils/formatters'

const DismissedEmployees: React.FC = () => {
  // Exemplo de dados de demitidos
  const dismissed = [
    {
      id: 1,
      nome: 'Sirliene Ferreira',
      email: 'admin@example.com',
      dataDemissao: '06/02/2026',
      avatar: '',
    },
  ];

  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{top: number, left: number} | null>(null);
  const [showConfirm, setShowConfirm] = React.useState<{id: number, nome: string} | null>(null);
  const [cpfFilter, setCpfFilter] = React.useState('');
  const menuBtnRefs = useRef<{[key: number]: HTMLButtonElement | null}>({});

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
                  <th className="py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {dismissed.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-4">{d.dataDemissao}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                          {d.nome.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-indigo-700 hover:underline cursor-pointer">#{d.id} {d.nome}</div>
                          <div className="text-xs text-gray-500">{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        className="text-2xl text-gray-400 cursor-pointer p-2 hover:bg-gray-100 rounded"
                        ref={el => menuBtnRefs.current[d.id] = el}
                        onClick={e => {
                          if (openMenuId === d.id) {
                            setOpenMenuId(null);
                            setMenuPosition(null);
                          } else {
                            setOpenMenuId(d.id);
                            const rect = menuBtnRefs.current[d.id]?.getBoundingClientRect();
                            if (rect) {
                              setMenuPosition({
                                top: rect.bottom + window.scrollY,
                                left: rect.left + window.scrollX,
                              });
                            }
                          }
                        }}
                      >&#8230;</button>
                    </td>
                  </tr>
                ))}
                    {/* Menu de opções fora da tabela, logo abaixo dos pontinhos */}
                    {openMenuId !== null && menuPosition && ReactDOM.createPortal(
                      <>
                        <div className="fixed inset-0 z-[99998]" onClick={() => { setOpenMenuId(null); setMenuPosition(null); }}></div>
                        <div
                          className="absolute z-[99999] w-40 bg-white rounded-md shadow-xl border border-gray-200 py-1"
                          style={{ top: menuPosition.top + 4, left: menuPosition.left }}
                        >
                          <button
                            className="w-full px-4 py-2 text-left text-sm text-indigo-600 hover:bg-gray-100"
                            onClick={() => {
                              setOpenMenuId(null);
                              setMenuPosition(null);
                              const demitido = dismissed.find(d => d.id === openMenuId);
                              if (demitido) setShowConfirm({id: demitido.id, nome: demitido.nome});
                            }}
                          >Readmitir</button>
                        </div>
                      </>,
                      document.body
                    )}

                    {/* Modal customizado de confirmação */}
                    {showConfirm && ReactDOM.createPortal(
                      <div className="fixed inset-0 z-[999999] flex items-center justify-center">
                        <div className="bg-black bg-opacity-40 absolute inset-0" onClick={() => setShowConfirm(null)}></div>
                        <div className="relative z-10 w-[350px] bg-white rounded-xl shadow-2xl border border-gray-200 p-6 flex flex-col items-center">
                          <h2 className="text-lg font-bold mb-2 text-gray-800">Deseja readmitir o demitido?</h2>
                          <p className="text-sm text-gray-500 mb-6">{showConfirm.nome}</p>
                          <div className="flex gap-4 mt-2">
                            <button className="px-6 py-2 rounded-full border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition" onClick={() => setShowConfirm(null)}>Cancelar</button>
                            <button className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition" onClick={() => { setShowConfirm(null); }}>Confirmar</button>
                          </div>
                        </div>
                      </div>,
                      document.body
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DismissedEmployees
