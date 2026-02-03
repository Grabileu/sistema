import React from 'react'
import {
  Home,
  Clock,
  Users,
  Settings,
  BarChart3,
  ChevronRight,
  ArrowLeft,
  Search,
  Calendar,
  Gift,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (route: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate }) => {
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null)

  // Bloquear scroll quando o menu está aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const menuItems = [
    { icon: Home, label: 'Dashboard' },
    { 
      icon: Users, 
      label: 'Departamento pessoal', 
      hasSubmenu: true,
      submenuItems: [
        'Funcionários ativos',
        'Aniversariantes',
        'Demitidos',
        'Gerar crachá',
        'Documentos',
        'Documentos em massa',
        'Assinatura eletrônica',
        'Configurar assinatura eletrônica',
        'Reembolsos',
        'Comunicados',
      ]
    },
    { icon: Calendar, label: 'Calendário' },
    { 
      icon: Clock, 
      label: 'Controle de Ponto', 
      hasSubmenu: true,
      submenuItems: [
        'Sobreaviso',
        'Férias e Afastamentos',
        'Planilha horário',
        'Histórico de ponto',
        'Lançamentos',
        'Escalas',
        'Cercos eletrônicos',
        'Reconhecimento facial',
        'Fechamento de ponto',
        'Espelho de ponto',
        'Permissões de ponto',
        'Exportar arquivos',
        'Relatórios do controle de ponto',
      ]
    },
    { 
      icon: Gift, 
      label: 'Benefícios flexíveis', 
      hasSubmenu: true,
      submenuItems: [
        'Pedidos',
        'Grupos de benefícios',
        'Gerenciar cartões',
        'Saldo/Extrato da empresa',
        'Regras do benefícios',
      ]
    },
    { 
      icon: Settings, 
      label: 'Parametrizações', 
      hasSubmenu: true,
      submenuItems: [
        'Dados da empresa',
        'Regras do ponto',
        'Unidades de negócio',
        'Departamentos',
        'Equipes',
        'Cargos',
        'Turnos',
        'Motivos de pausa - NR17',
        'Personalização',
      ]
    },
    { icon: BarChart3, label: 'Relatórios', hasSubmenu: true,
      submenuItems: [
        'People analytics',
        'Central de relatórios',
        'Relatórios de ponto',
        'Configurar relatórios por e-mail',
        'Resumo geral em Excel',
      ]
    },
    { icon: Settings, label: 'Administrativo', hasSubmenu: true,
      submenuItems: [
        'Administradores',
        'Meu plano',
        'Dados da empresa',
        'Indique uma empresa',
      ]
    },
    { icon: Users, label: 'Acesso gestor', hasSubmenu: true,
      submenuItems: [
        'Minha equipe',
      ]
    },
  ]

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label)
  }

  const handleItemClick = (label: string) => {
    if (label === 'Dashboard') {
      onClose()
      onNavigate('dashboard')
    }
  }

  return (
    <>
      {/* Overlay com transição */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-500 ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar com transição suave */}
      <aside
        className={`fixed left-0 top-0 h-screen w-80 bg-[#1e1e2e] text-white overflow-y-auto hide-scrollbar z-50 transition-all duration-500 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Pesquisar no menu"
                className="w-full px-4 py-2.5 rounded-lg bg-[#2a2a3e] text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-gray-600"
              />
              <Search size={18} className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#2a2a3e] rounded-lg transition ml-3"
            >
              <ArrowLeft size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const isSubmenuOpen = openSubmenu === item.label
              
              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => item.hasSubmenu ? toggleSubmenu(item.label) : handleItemClick(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition duration-200 ${
                      isSubmenuOpen
                        ? 'bg-[#3b4cca] text-white'
                        : 'text-gray-300 hover:bg-[#2a2a3e]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.hasSubmenu && <ChevronRight size={16} />}
                  </button>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Footer com URL */}
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs text-gray-500 break-words">
            https://app.marqponto.com.br/#
          </p>
        </div>
      </aside>

      {/* Submenu lateral - renderizado fora do sidebar principal */}
      {openSubmenu && menuItems.find(item => item.label === openSubmenu)?.submenuItems && (
        <aside className={`fixed left-[336px] top-0 h-screen w-72 bg-[#1e1e2e] text-white overflow-y-auto hide-scrollbar z-50 shadow-2xl transition-all duration-500 ${
          isOpen ? '' : '-translate-x-full'
        }`}>
          <div className="p-6">
            <h3 className="mb-3 text-base font-bold text-white">{openSubmenu}</h3>
            <div className="mb-4 border-b border-gray-700"></div>
            <div className="space-y-0.5">
              {menuItems.find(item => item.label === openSubmenu)?.submenuItems?.map((subItem, subIndex) => (
                <button
                  key={subIndex}
                  onClick={() => {
                    onNavigate(subItem)
                    setOpenSubmenu(null)
                    onClose()
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#2a2a3e] rounded transition"
                >
                  {subItem}
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}
    </>
  )
}

export default Sidebar
