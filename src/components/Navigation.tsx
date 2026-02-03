import React from 'react'

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center gap-8 mb-8 border-b">
      <button
        onClick={() => setActiveTab('controle')}
        className={`py-4 px-2 font-semibold transition ${
          activeTab === 'controle'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        Controle de ponto
      </button>
      <button
        onClick={() => setActiveTab('beneficios')}
        className={`py-4 px-2 font-semibold transition flex items-center gap-2 ${
          activeTab === 'beneficios'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        Benefícios flexíveis
        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
          Novo
        </span>
      </button>
    </div>
  )
}

export default Navigation
