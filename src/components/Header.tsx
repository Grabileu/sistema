import React from 'react'
import { Menu, Bell, Plus, User } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold">GUF Sistemas</h1>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Pesquise funcionários pelo nome ou CPF"
              className="w-full px-4 py-1 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              🔍
            </button>
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-blue-700 rounded-lg transition">
            <Plus size={24} />
          </button>
          <button className="p-2 hover:bg-blue-700 rounded-lg transition">
            <Bell size={24} />
          </button>
          <button className="flex items-center gap-2 px-3 py-1 hover:bg-blue-700 rounded-lg transition">
            <User size={20} />
            <div className="text-left">
              <p className="text-sm font-semibold">Administrador S...</p>
              <p className="text-xs opacity-90">gabrielumbelino34@gmail...</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
