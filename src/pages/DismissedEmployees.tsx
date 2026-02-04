import React from 'react'
import { Search } from 'lucide-react'

const DismissedEmployees: React.FC = () => {
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
              <label className="text-xs text-gray-500">E-mail</label>
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

        {/* Estado vazio */}
        <div className="bg-white shadow rounded-lg p-10">
          <div className="flex flex-col items-center justify-center text-center text-gray-500">
            <div className="w-36 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
              <span className="text-gray-400 text-sm">Sem registros</span>
            </div>
            <p>Nenhum demitido encontrado</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DismissedEmployees
