import React, { useState } from 'react'
import { Search, ChevronDown, MoreVertical } from 'lucide-react'

const ActiveEmployees: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Lista de funcionários ativos</h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700">
            Cadastrar novo funcionário
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Card filtros */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Search size={18} />
                <span>Buscar funcionários ativos</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Para uma busca mais específica, preencha os filtros que desejar ou selecione os filtros avançados para mais opções.
              </p>
            </div>
            <button
              className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-2"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Search size={14} />
              {showAdvanced ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-500">Funcionário</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="Comece digitando o nome"
                  className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Cargo</label>
              <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                Todos
                <ChevronDown size={16} />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500">Equipe</label>
              <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                Todos
                <ChevronDown size={16} />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500">Departamento</label>
              <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                Todos
                <ChevronDown size={16} />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500">Turno</label>
              <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                Todos
                <ChevronDown size={16} />
              </button>
            </div>
            {!showAdvanced && (
              <div className="flex items-end">
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700">
                  Pesquisar
                </button>
              </div>
            )}
          </div>

          {/* Filtros avançados */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showAdvanced ? 'max-h-[520px] opacity-100 mt-6' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-4">Filtros avançados:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Unidade de negócio</label>
                  <button className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                    Todos
                    <ChevronDown size={16} />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-gray-500">E-mail</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">CPF</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Código da matrícula</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">RG</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Cidade</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Número do PIS/PASEP</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Número da carteira de trabalho</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">CNH</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    className="mt-1 w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700">
                    Pesquisar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-end text-sm text-gray-500 mb-3">
            Página 1/1 - Exibindo 2 de 2 registros.
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3">Funcionário</th>
                  <th className="py-3">CPF</th>
                  <th className="py-3">E-mail</th>
                  <th className="py-3">Equipe</th>
                  <th className="py-3">Turno</th>
                  <th className="py-3">Departamento</th>
                  <th className="py-3">Último acesso</th>
                  <th className="py-3">Último registro</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-xs">AS</div>
                      <div>
                        <div className="text-indigo-600 font-semibold">#0 Administrador Super Machado</div>
                        <div className="text-xs text-gray-500">Cargo Administrativo</div>
                      </div>
                    </div>
                  </td>
                  <td>---</td>
                  <td>gabrielumbelino34@gmail.com</td>
                  <td className="text-indigo-600">Equipe Administrativa</td>
                  <td className="text-indigo-600">Turno Administrativo</td>
                  <td className="text-indigo-600">Departamento Administrativo</td>
                  <td>03/02/2026 17:36</td>
                  <td>03/02/2026 17:36</td>
                  <td className="text-right"><MoreVertical size={18} /></td>
                </tr>
                <tr>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-xs">SF</div>
                      <div>
                        <div className="text-indigo-600 font-semibold">#1 Sirilene Ferreira</div>
                        <div className="text-xs text-gray-500">Cargo Administrativo</div>
                      </div>
                    </div>
                  </td>
                  <td>090.348.993-73</td>
                  <td>admin@example.com</td>
                  <td className="text-indigo-600">Equipe Administrativa</td>
                  <td className="text-indigo-600">Turno Administrativo</td>
                  <td className="text-indigo-600">Departamento Administrativo</td>
                  <td>03/02/2026 14:24</td>
                  <td>03/02/2026 14:24</td>
                  <td className="text-right"><MoreVertical size={18} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActiveEmployees
