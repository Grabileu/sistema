import React from 'react'
import { Eye, RefreshCw } from 'lucide-react'

const StatusCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Status de hoje</h3>
          <p className="text-sm text-gray-500 mt-1">Atualizado em 03/02/2026 às 15:49</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
          <RefreshCw size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6 flex items-center justify-center">
            ▶️
          </div>
          <span className="text-lg font-semibold text-gray-900">
            <span className="text-blue-600">0 de 0</span> funcionários trabalhando
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-600 h-full w-0"></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">0% de presença</p>
      </div>

      <button className="p-2 hover:bg-gray-100 rounded-lg transition absolute top-8 right-8">
        <Eye size={24} className="text-gray-600" />
      </button>
    </div>
  )
}

export default StatusCard
