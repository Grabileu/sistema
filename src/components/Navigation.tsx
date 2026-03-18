import React from 'react'

interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center gap-8 border-b">
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
        onClick={() => setActiveTab('historico')}
        className={`py-4 px-2 font-semibold transition ${
          activeTab === 'historico'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        Histórico
      </button>
    </div>
  )
}

export default Navigation
