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
  canAccessRoute: (route: string) => boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, canAccessRoute }) => {
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null)
  const [submenuTop, setSubmenuTop] = React.useState<number>(0)
  const [submenuPanelTop, setSubmenuPanelTop] = React.useState<number>(16)
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const submenuPanelRef = React.useRef<HTMLElement | null>(null)

  // Bloquear scroll quando o menu está aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      // Limpar a busca quando o menu é fechado
      setSearchQuery('')
      setOpenSubmenu(null)
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Limpar submenu aberto quando a busca é zerada
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setOpenSubmenu(null)
    }
  }, [searchQuery])

  const accessRouteMap: { [key: string]: string } = {
    Dashboard: 'dashboard',
    Calendário: 'Calendário',
    Funcionários: 'Funcionários',
    Departamentos: 'departamentos',
    Equipes: 'equipes',
    Turnos: 'turnos',
    Gestores: 'equipes',
    Demitidos: 'Demitidos',
    Aniversariantes: 'Aniversariantes',
    'Férias e Afastamentos': 'ferias-e-afastamentos',
    Faltas: 'faltas',
    Atrasos: 'atrasos',
    'Quebra de caixa': 'quebra-de-caixa',
    Ceasa: 'ceasa',
    'Espelho de ponto': 'espelho-de-ponto',
    'Histórico de ponto': 'historico-de-ponto',
    'Folha de pagamento': 'folha-de-pagamento',
    'Regras do ponto': 'regras-do-ponto',
    'Relatório geral': 'relatorio-geral',
    'Dados da empresa': 'Dados da empresa',
    Lojas: 'unidades-negocio',
    Cargos: 'cargos',
    Benefícios: 'beneficios',
    Feriados: 'feriados',
    Usuários: 'usuarios',
    Administradores: 'administradores',
    'Permissões de perfil': 'permissoes-perfil',
    Configurações: 'configuracoes',
  }

  const navigationRouteMap: { [key: string]: string } = {
    Dashboard: 'dashboard',
    Calendário: 'Calendário',
    Funcionários: 'Funcionários',
    Departamentos: 'departamentos',
    Equipes: 'equipes',
    Turnos: 'turnos',
    Gestores: 'equipes',
    Demitidos: 'Demitidos',
    Aniversariantes: 'Aniversariantes',
    'Férias e Afastamentos': 'ferias-e-afastamentos',
    Faltas: 'faltas',
    Atrasos: 'atrasos',
    'Quebra de caixa': 'quebra-de-caixa',
    Ceasa: 'ceasa',
    'Dados da empresa': 'Dados da empresa',
    Lojas: 'unidades-negocio',
    Cargos: 'cargos',
    Benefícios: 'beneficios',
    Feriados: 'feriados',
    Usuários: 'usuarios',
    Administradores: 'administradores',
    'Permissões de perfil': 'permissoes-perfil',
  }

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
      ]
    },
    { 
      icon: Gift, 
      label: 'Benefícios', 
      hasSubmenu: true,
      submenuItems: [
        'Benefícios',
        'Feriados',
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
        'Permissões de perfil',
        'Dados da empresa',
        'Lojas',
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

  const visibleMenuItems = React.useMemo(() => {
    return menuItems
      .map((item) => {
        if (item.submenuItems) {
          const allowedSubItems = item.submenuItems.filter((subItem) => {
            const route = accessRouteMap[subItem]
            if (!route) return true
            return canAccessRoute(route)
          })

          if (allowedSubItems.length === 0) {
            return null
          }

          return {
            ...item,
            submenuItems: allowedSubItems,
          }
        }

        const route = accessRouteMap[item.label]
        if (!route) return item
        return canAccessRoute(route) ? item : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [canAccessRoute])

  // Filtrar itens do menu baseado na busca
  const filteredMenuItems = React.useMemo(() => {
    if (!searchQuery.trim()) return visibleMenuItems

    // Quando há busca, filtrar apenas os menus que têm submenus correspondentes
    return visibleMenuItems
      .filter(item => {
        // Manter apenas itens que têm submenus com correspondência
        return item.submenuItems?.some(subItem => 
          subItem.toLowerCase().includes(searchQuery.toLowerCase())
        ) || false
      })
      .map(item => {
        // Filtrar os submenus para mostrar apenas os que correspondem
        if (item.submenuItems) {
          return {
            ...item,
            submenuItems: item.submenuItems.filter(subItem =>
              subItem.toLowerCase().includes(searchQuery.toLowerCase())
            )
          }
        }
        return item
      })
  }, [searchQuery, visibleMenuItems])

  const handleItemClick = (label: string) => {
        console.log('Sidebar onNavigate:', label)
    const accessRoute = accessRouteMap[label]
    if (accessRoute && !canAccessRoute(accessRoute)) {
      return
    }

    const targetRoute = navigationRouteMap[label]
    if (!targetRoute) {
      return
    }

    if (label === 'Gestores') {
      localStorage.setItem('teamsActiveTab', 'gestores');
    }

    setOpenSubmenu(null);
    onClose();
    onNavigate(targetRoute);
  }

  const recalculateSubmenuTop = React.useCallback(() => {
    const desiredTop = (submenuTop || 80) - 40
    const viewportPadding = 16
    const panelHeight = submenuPanelRef.current?.offsetHeight ?? 320
    const maxTop = window.innerHeight - panelHeight - viewportPadding
    const clampedTop = Math.min(
      Math.max(desiredTop, viewportPadding),
      Math.max(viewportPadding, maxTop)
    )
    setSubmenuPanelTop(clampedTop)
  }, [submenuTop])

  React.useEffect(() => {
    if (!openSubmenu || searchQuery.trim()) return

    const raf = window.requestAnimationFrame(recalculateSubmenuTop)
    const onResize = () => recalculateSubmenuTop()

    window.addEventListener('resize', onResize)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [openSubmenu, searchQuery, filteredMenuItems, recalculateSubmenuTop])

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg !border !border-[#3a4b79] !bg-[#233663] !text-white placeholder:!text-blue-200/75 text-sm focus:!outline-none focus:!bg-[#2b4279] focus:!border-[#5c7fcf] focus:!ring-2 focus:!ring-blue-300/30"
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
            {searchQuery.trim() ? (
              // Quando há busca, mostrar os submenus diretamente
              <div className="space-y-4">
                {filteredMenuItems.map((item) => (
                  item.submenuItems && item.submenuItems.length > 0 && (
                    <div key={item.label} className="space-y-1">
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.label}</p>
                      </div>
                      {item.submenuItems.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => {
                            handleItemClick(subItem)
                            setOpenSubmenu(null)
                            onClose()
                            setSearchQuery('')
                          }}
                          className="w-full text-left px-6 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] hover:text-white rounded transition flex items-center gap-2 font-medium"
                        >
                          {subItem}
                        </button>
                      ))}
                    </div>
                  )
                ))}
              </div>
            ) : (
              // Quando não há busca, mostrar os menus normais
              filteredMenuItems.map((item, index) => {
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
              })
            )}
          </nav>
        </div>

        {/* Footer removido */}
      </aside>

      {/* Submenu lateral - renderizado fora do sidebar principal */}
      {!searchQuery.trim() && (
        <CSSTransition
          in={!!openSubmenu && !!filteredMenuItems.find(item => item.label === openSubmenu)?.submenuItems}
          timeout={300}
          classNames="submenu-slide"
          unmountOnExit
        >
          <aside
            ref={submenuPanelRef}
            className="fixed left-80 w-64 bg-[#1e1e2e] text-white z-50 shadow-xl rounded-xl border border-gray-700/80 transition-all duration-300 max-h-[calc(100vh-1.5rem)] overflow-auto"
            style={{ top: submenuPanelTop }}
          >
            <div className="p-4">
              <h3 className="mb-2 text-base font-semibold text-white tracking-wide">{openSubmenu}</h3>
              <div className="mb-3 border-b border-gray-700"></div>
              <div className="space-y-1">
                {filteredMenuItems.find(item => item.label === openSubmenu)?.submenuItems?.map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={() => {
                      handleItemClick(subItem)
                      setOpenSubmenu(null)
                      onClose()
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#2a2a3e] hover:text-white rounded transition flex items-center gap-2 font-medium"
                  >
                    {subItem}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </CSSTransition>
      )}
    </>
  )
}

export default Sidebar
