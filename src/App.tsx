import React, { useState } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import PromoCards from './components/PromoCards'
import StatusCard from './components/StatusCard'
import PendingTasks from './components/PendingTasks'
import Sidebar from './components/Sidebar'
import ActiveEmployees from './pages/ActiveEmployees'

function App() {
  const [activeTab, setActiveTab] = useState('controle')
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'funcionarios-ativos'>('dashboard')

  const handleNavigate = (route: string) => {
    if (route === 'dashboard') {
      setCurrentPage('dashboard')
      return
    }
    if (route === 'Funcionários ativos') {
      setCurrentPage('funcionarios-ativos')
      return
    }
    setCurrentPage('dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
      />
      
      <div>
        <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
        
        {currentPage === 'dashboard' && (
          <div className="container mx-auto px-4 py-8">
            {/* Navigation Tabs */}
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Promo Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PromoCards />
            </div>

            {/* Status and Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusCard />
              <PendingTasks />
            </div>
          </div>
        )}

        {currentPage === 'funcionarios-ativos' && <ActiveEmployees />}
      </div>
    </div>
  )
}

export default App
