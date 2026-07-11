import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock, User, AlertCircle, Info, ShieldCheck, Sparkles } from 'lucide-react'
import { verifyPassword } from '../utils/auth'
import { SistemaUsuario, LoggedUser } from '../App'

interface LoginProps {
  onLogin: (user: LoggedUser) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [identifierFocused, setIdentifierFocused] = useState(false)
  const [senhaFocused, setSenhaFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFirstAccess, setIsFirstAccess] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sistema_usuarios')
    const users: SistemaUsuario[] = stored ? JSON.parse(stored) : []
    setIsFirstAccess(users.length === 0)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identificador.trim() || !senha) {
      setError('Preencha usuário/e-mail e senha.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const stored = localStorage.getItem('sistema_usuarios')
      const users: SistemaUsuario[] = stored ? JSON.parse(stored) : []
      const loginInput = identificador.trim().toLowerCase()

      const found = users.find(
        u =>
          u.ativo &&
          (u.usuario.toLowerCase() === loginInput || u.email.toLowerCase() === loginInput)
      )

      if (!found) {
        setError('Usuário ou e-mail não encontrado, ou conta inativa.')
        setLoading(false)
        return
      }

      const valid = await verifyPassword(senha, found.senhaHash)
      if (!valid) {
        setError('Senha incorreta.')
        setLoading(false)
        return
      }

      // Atualiza ultimoAcesso
      const updated = users.map(u =>
        u.id === found.id ? { ...u, ultimoAcesso: new Date().toISOString() } : u
      )
      localStorage.setItem('sistema_usuarios', JSON.stringify(updated))

      const loggedUser: LoggedUser = {
        id: found.id,
        nome: found.nome,
        usuario: found.usuario,
        email: found.email,
        perfil: found.perfil,
      }
      localStorage.setItem('sistema_usuario_logado', JSON.stringify(loggedUser))
      onLogin(loggedUser)
    } catch {
      setError('Erro ao verificar credenciais. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden flex bg-slate-100">
      {/* Left panel — branding */}
      <div className="login-hero hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="login-hero-grid" />
        <div className="login-orb login-orb-primary" />
        <div className="login-orb login-orb-secondary" />
        <div className="login-orb login-orb-tertiary" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100 backdrop-blur-sm">
            <Sparkles size={14} />
            Acesso
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">PontoG</h1>
          <p className="mt-1 text-blue-100 text-sm">Mais clareza no dia</p>
        </div>

        <div className="relative z-10 flex flex-1 items-center">
          <div className="w-full max-w-xl space-y-8">
            <div className="space-y-4">
              <p className="text-5xl font-semibold leading-none tracking-tight text-white">
                Seu dia rende.
              </p>
              <p className="max-w-md text-base leading-7 text-blue-100/85">
                Menos esforço. Mais controle.
              </p>
            </div>

            <div className="login-status-panel max-w-md rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-50">
                  <ShieldCheck size={18} />
                  <span className="text-sm font-semibold">Tudo em ordem</span>
                </div>
                <span className="login-status-dot" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="login-status-row">
                  <span className="text-sm text-blue-50/90">Foco</span>
                  <div className="login-status-bars">
                    <span className="login-status-bar w-16" />
                    <span className="login-status-bar w-10 opacity-70" />
                  </div>
                </div>

                <div className="login-status-row">
                  <span className="text-sm text-blue-50/90">Controle</span>
                  <div className="login-status-bars">
                    <span className="login-status-bar w-12" />
                    <span className="login-status-bar w-14 opacity-80" />
                  </div>
                </div>

                <div className="login-status-row">
                  <span className="text-sm text-blue-50/90">Resultado</span>
                  <div className="login-status-bars">
                    <span className="login-status-bar w-20" />
                    <span className="login-status-bar w-8 opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-200/80 text-xs">
          © {new Date().getFullYear()} PontoG. Todos os direitos reservados.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-white px-6 py-8">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/90 px-7 py-8 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-blue-700">PontoG</h1>
            <p className="text-gray-500 text-sm">Acesso rápido</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo</h2>
          <p className="text-sm text-gray-500 mb-8">Entre para continuar</p>

          {/* Primeiro acesso */}
          {isFirstAccess && (
            <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <Info size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Primeiro acesso</p>
                <p className="mt-0.5">
                  Use as credenciais padrão:<br />
                  <strong>Usuário:</strong> admin<br />
                  <strong>Senha:</strong> admin123
                </p>
                <p className="mt-1 text-blue-600">Altere a senha após entrar.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Usuário ou e-mail */}
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={17} />
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  value={identificador}
                  onChange={e => { setIdentificador(e.target.value); setError(null) }}
                  onFocus={() => setIdentifierFocused(true)}
                  onBlur={() => setIdentifierFocused(false)}
                  placeholder=" "
                  className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className={`pointer-events-none absolute left-8 px-2 transition-all duration-200 ${
                  identifierFocused || identificador
                    ? 'top-0 -translate-y-1/2 bg-white text-xs text-blue-600'
                    : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
                }`}>
                  Usuário ou e-mail
                </span>
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={17} />
                </span>
                <input
                  type={showSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setError(null) }}
                  onFocus={() => setSenhaFocused(true)}
                  onBlur={() => setSenhaFocused(false)}
                  placeholder=" "
                  className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-11 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className={`pointer-events-none absolute left-8 px-2 transition-all duration-200 ${
                  senhaFocused || senha
                    ? 'top-0 -translate-y-1/2 bg-white text-xs text-blue-600'
                    : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
                }`}>
                  Senha
                </span>
                <button
                  type="button"
                  onClick={() => setShowSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 text-sm transition-colors"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            Problemas para acessar? Fale com o administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
