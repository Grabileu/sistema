import React, { useState, useRef, useEffect } from 'react'
import { Menu, Bell, Plus, User, Search, LogOut, ChevronDown } from 'lucide-react'
import { LoggedUser } from '../App'

interface HeaderProps {
  onMenuClick: () => void
  loggedUser: LoggedUser | null
  onLogout: () => void
}

const PERFIL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  rh: 'RH',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, loggedUser, onLogout }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayName = loggedUser?.nome ?? 'Usuário'
  const displayEmail = loggedUser?.email ?? ''
  const perfil = loggedUser?.perfil ? PERFIL_LABELS[loggedUser.perfil] ?? loggedUser.perfil : ''

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="w-full py-2 grid grid-cols-[auto_1fr_auto] items-center">
        {/* Esquerda: menu e logo */}
        <div className="flex items-center gap-3 justify-start">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-blue-700 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-end select-none leading-tight">
            <span
              className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight"
              style={{ letterSpacing: '-0.04em', textShadow: '0 2px 12px rgba(0,0,0,0.12)' }}
            >
              GUF
            </span>
            <span
              className="text-xs md:text-sm font-semibold tracking-widest text-blue-100 uppercase mb-1 ml-2 drop-shadow-sm"
              style={{ letterSpacing: '0.35em' }}
            >
              Sistemas
            </span>
          </div>
        </div>

        {/* Centro: barra de pesquisa */}
        <div className="hidden md:flex justify-center w-full">
          <div className="relative mx-auto w-full max-w-xl">
            <input
              type="text"
              placeholder="Pesquise funcionários pelo nome ou CPF"
              className="w-full px-4 py-1 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none pr-9"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Direita: ícones e usuário */}
        <div className="flex items-center gap-3 justify-end">
          <button className="p-2 hover:bg-blue-700 rounded-lg transition">
            <Plus size={24} />
          </button>
          <button className="p-2 hover:bg-blue-700 rounded-lg transition">
            <Bell size={24} />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1 hover:bg-blue-700 rounded-lg transition"
            >
              <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-blue-300 flex items-center justify-center text-sm font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold leading-tight">
                  {displayName.length > 18 ? displayName.slice(0, 18) + '…' : displayName}
                </p>
                <p className="text-xs opacity-80 leading-tight">{perfil}</p>
              </div>
              <ChevronDown size={14} className={`opacity-70 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                  <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {perfil}
                  </span>
                </div>
                <button
                  onClick={() => { setUserMenuOpen(false); onLogout() }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  Sair do sistema
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
