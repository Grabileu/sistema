import React from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'

const PendingTasks: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Tarefas pendentes <span className="text-gray-400">0</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">Dos últimos 15 dias</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
          <RefreshCw size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-gray-500 font-semibold">Não há tarefas pendentes</p>
        </div>
      </div>
    </div>
  )
}

export default PendingTasks
