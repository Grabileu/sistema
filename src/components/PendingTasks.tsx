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
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
          <h4 className="font-semibold text-green-900 mb-1">Precisando de Ajuda?</h4>
          <p className="text-sm text-green-800 mb-3">
            Caso precise de ajuda para cadastrar seu turno, equipe ou funcionários, fale com nosso suporte agora mesmo no chat
          </p>
          <a href="#" className="text-green-600 hover:text-green-700 font-semibold text-sm">
            Ativar o Windows?
          </a>
          <p className="text-xs text-green-600 mt-1">Acesse Configurações para ativar o Windows</p>
        </div>

        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={40} />
          <p className="text-gray-500 font-semibold">Não há Funcionários Cadastrados</p>
        </div>
      </div>
    </div>
  )
}

export default PendingTasks
