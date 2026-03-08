import React from 'react'
import { CSSTransition } from 'react-transition-group'
import {
  LayoutDashboard,
  UserCog,
  CalendarDays,
  ActivitySquare,
  Briefcase,
  Settings2,
  BarChart4,
  ChevronRight,
  ArrowLeft,
  Search,
  Gift,
  Cake,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (route: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate }) => {
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null)
  const [submenuTop, setSubmenuTop] = React.useState<number>(0)

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
    { icon: LayoutDashboard, label: 'Dashboard' },
    { 
      icon: UserCog, 
      label: 'Departamento pessoal', 
      hasSubmenu: true,
      submenuItems: [
        'Funcionários',
        'Departamentos',
        'Cargos',
        'Equipes',
        'Turnos',
        'Gestores',
        'Demitidos',
        'Aniversariantes',
      ]
    },
    { icon: CalendarDays, label: 'Calendário' },
    { 
      icon: ActivitySquare, 
      label: 'Controle de Jornada', 
      hasSubmenu: true,
      submenuItems: [
        'Espelho de ponto',
        'Histórico de ponto',
        'Folha de pagamento',
        'Regras do ponto',
      ]
    },
    { 
      icon: BarChart4, 
      label: 'Lançamentos', 
      hasSubmenu: true,
      submenuItems: [
        'Férias e Afastamentos',
        'Faltas',
        'Atrasos',
        'Quebra de caixa',
        'Ceasa',
        'Configurações',
      ]
    },
    { 
      icon: Gift, 
      label: 'Benefícios', 
      hasSubmenu: true,
      submenuItems: [
        'Benefícios',
        'Adicionar Benefícios',
        'Configurações',
      ]
    },
    // { 
    //   icon: Settings2, 
    //   label: 'Parametrizações', 
    //   hasSubmenu: true,
    //   submenuItems: [
    //     'Dados da empresa',
    //     'Regras do ponto',
    //     'Unidades de negócio',
    //     'Motivos de pausa - NR17',
    //     'Personalização',
    //   ]
    // },
    { icon: BarChart4, label: 'Relatórios', hasSubmenu: true,
      submenuItems: [
        'Relatório geral',
        'Faltas',
        'Férias e Afastamentos',
        'Quebra de caixa',
        'Ceasa',
      ]
    },
    { icon: Briefcase, label: 'Administrativo', hasSubmenu: true,
      submenuItems: [
        'Administradores',
        'Usuários',
        'Dados da empresa',
        'Unidades de negócio',
        'Configurações',
      ]
    },
    // { icon: UserCog, label: 'Acesso gestor', hasSubmenu: true,
    //   submenuItems: [
    //     'Minha equipe',
    //   ]
    // },
  ]

  const toggleSubmenu = (label: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (openSubmenu === label) {
      setOpenSubmenu(null)
      return
    }
    setOpenSubmenu(label)
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      setSubmenuTop(rect.top)
    }
  }

  const handleItemClick = (label: string) => {
    // Mapeamento dos submenus para rotas
    const routeMap: { [key: string]: string } = {
      'Dashboard': 'Dashboard',
      'Calendário': 'Calendário',
      'Funcionários': 'Funcionários',
      'Departamentos': 'departamentos',
      'Equipes': 'equipes',
      'Turnos': 'turnos',
      'Gestores': 'equipes',
      'Demitidos': 'Demitidos',
      'Aniversariantes': 'Aniversariantes',
      'Férias e Afastamentos': 'ferias-e-afastamentos',
      'Faltas': 'faltas',
      'Dados da empresa': 'Dados da empresa',
      'Unidades de negócio': 'unidades-negocio',
      'Cargos': 'cargos',
      // Adicione outros submenus conforme necessário
    }
        console.log('Sidebar onNavigate:', label)
    if (routeMap[label]) {
      if (label === 'Gestores') {
        localStorage.setItem('teamsActiveTab', 'gestores');
      }
      setOpenSubmenu(null);
      onClose();
      onNavigate(routeMap[label]);
    }
  }

  return (
    <>
      {/* Overlay com transição */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-500 ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          onClose();
          setOpenSubmenu(null);
        }}
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
                    onClick={event => item.hasSubmenu ? toggleSubmenu(item.label, event) : handleItemClick(item.label)}
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

        {/* Footer removido */}
      </aside>

      {/* Submenu lateral - renderizado fora do sidebar principal */}
      <CSSTransition
        in={!!openSubmenu && !!menuItems.find(item => item.label === openSubmenu)?.submenuItems}
        timeout={300}
        classNames="submenu-slide"
        unmountOnExit
      >
        <aside
          className="fixed left-80 w-72 bg-[#1e1e2e] text-white z-50 shadow-2xl rounded-2xl border border-gray-700 transition-all duration-300 max-h-screen overflow-auto"
          style={{ top: Math.min((submenuTop || 80) - 40, window.innerHeight - 24 - 320) }}
        >
          <div className="p-6">
            <h3 className="mb-3 text-lg font-bold text-white tracking-wide">{openSubmenu}</h3>
            <div className="mb-4 border-b border-gray-700"></div>
            <div className="space-y-1">
              {menuItems.find(item => item.label === openSubmenu)?.submenuItems?.map((subItem, subIndex) => (
                <button
                  key={subIndex}
                  onClick={() => {
                    handleItemClick(subItem)
                    setOpenSubmenu(null)
                    onClose()
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-[#2a2a3e] hover:text-white rounded transition flex items-center gap-2 font-medium"
                >
                  {subItem}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </CSSTransition>
    </>
  )
}

export default Sidebar
