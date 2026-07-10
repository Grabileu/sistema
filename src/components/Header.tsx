import React, { useState, useRef, useEffect } from 'react'
import { Employee } from '../App'
import { Menu, Bell, Plus, User, Search, LogOut, ChevronDown, Settings } from 'lucide-react'
import { LoggedUser, SistemaUsuario } from '../App'
import { hashPassword } from '../utils/auth'

interface HeaderProps {
  onMenuClick: () => void
  loggedUser: LoggedUser | null
  onLogout: () => void
  onUpdateLoggedUser: (user: LoggedUser) => void
  onLogoClick?: () => void
}

const PERFIL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  rh: 'RH',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, loggedUser, onLogout, onUpdateLoggedUser, onLogoClick }) => {
    // Autocomplete de funcionários
    const [searchValue, setSearchValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Busca funcionários do localStorage
    useEffect(() => {
      if (!searchValue.trim()) {
        setFilteredEmployees([]);
        return;
      }
      const all = localStorage.getItem('employees');
      if (!all) return;
      try {
        const arr: Employee[] = JSON.parse(all);
        const term = searchValue.trim().toLowerCase();
        const cpfTerm = term.replace(/\D/g, '');
        setFilteredEmployees(
          arr.filter(emp => {
            const nomeMatch = emp.nomeCompleto.toLowerCase().includes(term);
            const cpfMatch =
              cpfTerm.length > 0 &&
              emp.cpf?.replace(/\D/g, '').includes(cpfTerm);
            return nomeMatch || cpfMatch;
          }).slice(0, 10)
        );
      } catch {}
    }, [searchValue]);

    // Fecha dropdown ao clicar fora
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setShowDropdown(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settingsError, setSettingsError] = useState('')
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState({
    nome: '',
    usuario: '',
    email: '',
    novaSenha: '',
    confirmarSenha: '',
  })
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

  useEffect(() => {
    if (!showSettingsModal) return

    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSettingsModal(false)
        setSettingsError('')
      }
    }

    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('keydown', onEscape)
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [showSettingsModal])

  const openSettings = () => {
    if (!loggedUser) return
    setSettingsForm({
      nome: loggedUser.nome || '',
      usuario: loggedUser.usuario || '',
      email: loggedUser.email || '',
      novaSenha: '',
      confirmarSenha: '',
    })
    setSettingsError('')
    setUserMenuOpen(false)
    setShowSettingsModal(true)
  }

  const handleSaveSettings = async () => {
    if (!loggedUser || isSavingSettings) return

    const nome = settingsForm.nome.trim()
    const usuario = settingsForm.usuario.trim().toLowerCase()
    const email = settingsForm.email.trim().toLowerCase()
    const novaSenha = settingsForm.novaSenha
    const confirmarSenha = settingsForm.confirmarSenha

    if (!nome || !usuario || !email) {
      setSettingsError('Preencha nome, usuário e e-mail.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setSettingsError('Informe um e-mail válido.')
      return
    }

    if (novaSenha && novaSenha.length < 6) {
      setSettingsError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setSettingsError('A confirmação da senha não confere.')
      return
    }

    const storedUsers = localStorage.getItem('sistema_usuarios')
    const users: SistemaUsuario[] = storedUsers ? JSON.parse(storedUsers) : []
    const currentUser = users.find((user) => user.id === loggedUser.id)

    if (!currentUser) {
      setSettingsError('Usuário não encontrado para atualização.')
      return
    }

    const hasUsuarioConflict = users.some(
      (user) => user.id !== loggedUser.id && user.usuario.toLowerCase() === usuario
    )

    if (hasUsuarioConflict) {
      setSettingsError('Este usuário já está em uso.')
      return
    }

    const hasEmailConflict = users.some(
      (user) => user.id !== loggedUser.id && user.email.toLowerCase() === email
    )

    if (hasEmailConflict) {
      setSettingsError('Este e-mail já está em uso.')
      return
    }

    setIsSavingSettings(true)
    setSettingsError('')

    try {
      let senhaHash = currentUser.senhaHash
      if (novaSenha) {
        senhaHash = await hashPassword(novaSenha)
      }

      const updatedUsers = users.map((user) =>
        user.id === loggedUser.id
          ? {
              ...user,
              nome,
              usuario,
              email,
              senhaHash,
            }
          : user
      )

      const updatedLoggedUser: LoggedUser = {
        ...loggedUser,
        nome,
        usuario,
        email,
      }

      localStorage.setItem('sistema_usuarios', JSON.stringify(updatedUsers))
      localStorage.setItem('sistema_usuario_logado', JSON.stringify(updatedLoggedUser))
      onUpdateLoggedUser(updatedLoggedUser)
      setShowSettingsModal(false)
    } catch {
      setSettingsError('Não foi possível salvar as configurações. Tente novamente.')
    } finally {
      setIsSavingSettings(false)
    }
  }

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
          <div className="flex items-center gap-1 select-none ml-6 md:ml-12 cursor-pointer" onClick={onLogoClick}>
            <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-lg" style={{letterSpacing: '-0.03em'}}>PontoG</span>
          </div>
        </div>

        {/* Centro: barra de pesquisa */}
        <div className="hidden md:flex justify-center w-full">
          <div className="relative mx-auto w-full max-w-xl" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Pesquise funcionários pelo nome ou CPF"
              className="w-full px-4 py-1 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none pr-9"
              value={searchValue}
                onChange={e => {
                  const value = e.target.value
                  setSearchValue(value)
                  setShowDropdown(true)
                  // Não disparar alterações globais a cada tecla: apenas atualiza sugestões locais
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = searchValue.trim()
                    if (value) {
                      window.localStorage.setItem('employeeSearchTerm', value)
                    } else {
                      window.localStorage.removeItem('employeeSearchTerm')
                    }
                    window.dispatchEvent(new Event('storage'))
                    window.dispatchEvent(new CustomEvent('headerSearchSubmit', { detail: value }))
                    setShowDropdown(false)
                  }
                }}
              onFocus={() => { if (searchValue) setShowDropdown(true); }}
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              type="button"
              onClick={() => {
                const value = searchValue.trim()
                if (value) {
                  window.localStorage.setItem('employeeSearchTerm', value)
                } else {
                  window.localStorage.removeItem('employeeSearchTerm')
                }
                window.dispatchEvent(new Event('storage'))
                window.dispatchEvent(new CustomEvent('headerSearchSubmit', { detail: value }))
                setShowDropdown(false)
                // opcional: limpar campo depois de submeter? mantemos o valor para UX
              }}
            >
              <Search size={16} />
            </button>
            {showDropdown && filteredEmployees.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-[120] max-h-80 overflow-y-auto divide-y divide-gray-100">
                {filteredEmployees.map(emp => (
                  <button
                    key={emp.id}
                    type="button"
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchValue('');
                      window.localStorage.removeItem('employeeSearchTerm')
                      window.localStorage.setItem('perfilFuncionarioId', emp.id);
                      window.localStorage.setItem('currentPage', `perfil-funcionario-${emp.id}`);
                      window.dispatchEvent(new Event('storage'));
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">{emp.nomeCompleto}</span>
                      <span className="text-xs text-gray-500">{emp.cpf}</span>
                    </div>
                  </button>
                ))}
                {filteredEmployees.length === 10 && (
                  <div className="px-4 py-3 text-xs text-gray-500 bg-gray-50">Mostrando os 10 primeiros resultados</div>
                )}
              </div>
            )}
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
                  onClick={openSettings}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <Settings size={16} />
                  Configurações da conta
                </button>
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

      {showSettingsModal && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/45 backdrop-blur-sm px-4"
          onClick={() => {
            setShowSettingsModal(false)
            setSettingsError('')
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Configurações da conta"
          >
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Configurações da conta</h2>
              <p className="text-xs text-gray-500 mt-1">Atualize os dados do seu usuário de acesso.</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={settingsForm.nome}
                  onChange={(event) => setSettingsForm((prev) => ({ ...prev, nome: event.target.value }))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Usuário</label>
                  <input
                    type="text"
                    value={settingsForm.usuario}
                    onChange={(event) => setSettingsForm((prev) => ({ ...prev, usuario: event.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(event) => setSettingsForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Nova senha</label>
                  <input
                    type="password"
                    value={settingsForm.novaSenha}
                    onChange={(event) => setSettingsForm((prev) => ({ ...prev, novaSenha: event.target.value }))}
                    placeholder="Opcional"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Confirmar senha</label>
                  <input
                    type="password"
                    value={settingsForm.confirmarSenha}
                    onChange={(event) => setSettingsForm((prev) => ({ ...prev, confirmarSenha: event.target.value }))}
                    placeholder="Opcional"
                    className="w-full"
                  />
                </div>
              </div>

              {settingsError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {settingsError}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false)
                  setSettingsError('')
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60"
              >
                {isSavingSettings ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
