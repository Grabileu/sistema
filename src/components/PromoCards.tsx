import React from 'react'
import { ArrowRight } from 'lucide-react'

const PromoCards: React.FC = () => {
  return (
    <>
      {/* Card 1 - Trial */}
      <div className="bg-gradient-to-r from-blue-600 to-yellow-300 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 opacity-20">
          <div className="text-8xl">🚀</div>
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Seu teste grátis acaba em 8 dias</h3>
          <p className="text-sm mb-4 opacity-90">
            Atualize seu plano até o dia 11/02/2026 para fazer o seu treinamento.
          </p>
          <button className="flex items-center gap-2 text-yellow-300 font-bold hover:opacity-80 transition">
            Entre em contato <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Card 2 - Setup */}
      <div className="bg-gradient-to-r from-yellow-300 to-gray-800 rounded-2xl p-8 text-gray-900 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 opacity-20">
          <div className="text-8xl">📋</div>
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2 text-gray-900">Configure sua empresa</h3>
          <p className="text-sm mb-4 text-gray-700">
            Defina as regras da sua empresa para configurar o sistema na MarQ. Leva menos de 1 minuto, vamos lá?
          </p>
          <button className="flex items-center gap-2 text-gray-900 font-bold hover:opacity-80 transition">
            Continuar agora <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </>
  )
}

export default PromoCards
