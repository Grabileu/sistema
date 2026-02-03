import React from 'react'
import { Home, Clock } from 'lucide-react'

const Navigation2: React.FC = () => {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
        <Home size={20} />
        Início
      </button>
      <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition">
        <Clock size={20} />
        Histórico
      </button>
    </div>
  )
}

export default Navigation2
