import React, { useState } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import PromoCards from './components/PromoCards'
import StatusCard from './components/StatusCard'
import PendingTasks from './components/PendingTasks'
import Sidebar from './components/Sidebar'

function App() {
  const [activeTab, setActiveTab] = useState('controle')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <div>
        <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
        
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
      </div>
    </div>
  )
}

export default App
