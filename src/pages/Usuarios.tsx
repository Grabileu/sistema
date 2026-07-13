import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Search, Eye, EyeOff, AlertTriangle, ShieldCheck, User, CheckCircle2, XCircle } from 'lucide-react'
import type { SistemaUsuario, LoggedUser } from '../App'
import { hashPassword } from '../utils/auth'
import Select from '../components/Select'

export const TODOS_PERFIS: { value: SistemaUsuario['perfil']; label: string; color: string }[] = [
  { value: 'admin', label: 'Administrador', color: 'bg-violet-100 text-violet-800' },
  { value: 'rh', label: 'RH', color: 'bg-blue-100 text-blue-800' },
  { value: 'gestor', label: 'Gestor', color: 'bg-amber-100 text-amber-800' },
  { value: 'colaborador', label: 'Colaborador', color: 'bg-gray-100 text-gray-700' },
]

const PERFIS_ADMIN: SistemaUsuario['perfil'][] = ['admin', 'rh']
const PERFIS_USUARIO: SistemaUsuario['perfil'][] = ['gestor', 'colaborador']

export function getPerfilMeta(perfil: SistemaUsuario['perfil']) {
  return TODOS_PERFIS.find(p => p.value === perfil) ?? TODOS_PERFIS[3]
}

interface FormState {
  nome: string
  usuario: string
  email: string
  perfil: SistemaUsuario['perfil']
  senha: string
  confirmarSenha: string
  ativo: boolean
}



interface ToastState {
  message: string
  type: 'success' | 'error'
}

// Tipagem correta para as props

type UsuariosProps = {
  mode: 'administradores' | 'usuarios';
  loggedUser: LoggedUser | null;
  setLoggedUser: (user: LoggedUser) => void;
}

const Usuarios: React.FC<UsuariosProps> = ({ mode, loggedUser, setLoggedUser }) => {
  const perfisDisponiveis = mode === 'administradores' ? PERFIS_ADMIN : PERFIS_USUARIO
  const perfilPadrao: SistemaUsuario['perfil'] = mode === 'administradores' ? 'admin' : 'gestor'

  const emptyForm: FormState = {
    nome: '',
    usuario: '',
    email: '',
    perfil: perfilPadrao,
    senha: '',
    confirmarSenha: '',
    ativo: true,
  }

  const [users, setUsers] = useState<SistemaUsuario[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<SistemaUsuario | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const loadUsers = () => {
    const stored = localStorage.getItem('sistema_usuarios')
    setUsers(stored ? JSON.parse(stored) : [])
  }

  const saveUsers = (updated: SistemaUsuario[]) => {
    localStorage.setItem('sistema_usuarios', JSON.stringify(updated))
    setUsers(updated)
  }

  const showSuccessToast = (message: string) => {
    setToast({ message, type: 'success' })
  }

  const showErrorToast = (message: string) => {
    setToast({ message, type: 'error' })
  }

  const filtered = users.filter(u => {
    if (!perfisDisponiveis.includes(u.perfil)) return false
    const q = search.toLowerCase()
    return (
      u.nome.toLowerCase().includes(q) ||
      u.usuario.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

  const openAdd = () => {
    setEditingId(null)
    setForm({ nome: '', usuario: '', email: '', perfil: perfilPadrao, senha: '', confirmarSenha: '', ativo: true })
    setFormError(null)
    setShowSenha(false)
    setShowConfirmar(false)
    setShowModal(true)
  }

  const openEdit = (user: SistemaUsuario) => {
    setEditingId(user.id)
    setForm({
      nome: user.nome,
      usuario: user.usuario,
      email: user.email,
      perfil: user.perfil,
      senha: '',
      confirmarSenha: '',
      ativo: user.ativo,
    })
    setFormError(null)
    setShowSenha(false)
    setShowConfirmar(false)
    setShowModal(true)
  }

  const handleSave = async () => {
    setFormError(null)

    const normalizedUsuario = form.usuario.trim().toLowerCase()
    const normalizedEmail = form.email.trim().toLowerCase()

    if (!form.nome.trim()) { setFormError('Informe o nome completo.'); return }
    if (!form.usuario.trim()) { setFormError('Informe o nome de usuário.'); return }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError('Informe um e-mail válido.'); return
    }
    if (!editingId && !form.senha) { setFormError('Informe a senha.'); return }
    if (form.senha && form.senha.length < 6) { setFormError('A senha deve ter no mínimo 6 caracteres.'); return }
    if (form.senha && form.senha !== form.confirmarSenha) {
      setFormError('As senhas não conferem.'); return
    }

    // Verificar duplicidade de usuário
    const duplicate = users.find(
      u => u.usuario.toLowerCase() === normalizedUsuario && u.id !== editingId
    )
    if (duplicate) { setFormError('Já existe um usuário com esse nome de login.'); return }

    const duplicateEmail = users.find(
      u => u.email.toLowerCase() === normalizedEmail && u.id !== editingId
    )
    if (duplicateEmail) { setFormError('Já existe um usuário com esse e-mail.'); return }

    setSaving(true)
    try {
      if (editingId) {
        // Editar
        let senhaHash: string | undefined
        if (form.senha) {
          senhaHash = await hashPassword(form.senha)
        }
        const updated = users.map(u => {
          if (u.id !== editingId) return u
          return {
            ...u,
            nome: form.nome.trim(),
            usuario: form.usuario.trim(),
            email: normalizedEmail,
            perfil: form.perfil,
            ativo: form.ativo,
            ...(senhaHash ? { senhaHash } : {}),
          }
        })
        saveUsers(updated)
        // Se o usuário editado é o logado, atualiza também o estado e localStorage do usuário logado
        const updatedUser = updated.find(u => u.id === editingId)
        if (loggedUser && updatedUser && loggedUser.id === updatedUser.id) {
          const logged: LoggedUser = {
            id: updatedUser.id,
            nome: updatedUser.nome,
            usuario: updatedUser.usuario,
            email: updatedUser.email,
            perfil: updatedUser.perfil,
          }
          localStorage.setItem('sistema_usuario_logado', JSON.stringify(logged))
          setLoggedUser(logged)
        }
        showSuccessToast(`Usuário "${form.nome}" atualizado com sucesso.`)
      } else {
        // Novo
        const senhaHash = await hashPassword(form.senha)
        const newUser: SistemaUsuario = {
          id: `u_${Date.now()}`,
          nome: form.nome.trim(),
          usuario: form.usuario.trim(),
          email: normalizedEmail,
          senhaHash,
          perfil: form.perfil,
          ativo: form.ativo,
          criadoEm: new Date().toISOString(),
        }
        saveUsers([...users, newUser])
        showSuccessToast(`Usuário "${form.nome}" cadastrado com sucesso.`)
      }
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (user: SistemaUsuario) => {
    const adminCount = users.filter(u => u.perfil === 'admin' && u.ativo).length
    if (user.perfil === 'admin' && adminCount <= 1) {
      showErrorToast('Não é possível excluir o único administrador ativo do sistema.')
      return
    }
    setDeleteModal(user)
  }

  const confirmDelete = () => {
    if (!deleteModal) return
    const updated = users.filter(u => u.id !== deleteModal.id)
    saveUsers(updated)
    showSuccessToast(`Usuário "${deleteModal.nome}" excluído com sucesso.`)
    setDeleteModal(null)
  }

  const handleToggleAtivo = (user: SistemaUsuario) => {
    const adminCount = users.filter(u => u.perfil === 'admin' && u.ativo).length
    if (user.perfil === 'admin' && user.ativo && adminCount <= 1) {
      showErrorToast('Não é possível desativar o único administrador ativo do sistema.')
      return
    }
    const updated = users.map(u => u.id === user.id ? { ...u, ativo: !u.ativo } : u)
    saveUsers(updated)
    showSuccessToast(`Usuário "${user.nome}" ${user.ativo ? 'desativado' : 'ativado'} com sucesso.`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Toast */
      }
      {toast && (
        <div className="fixed right-5 top-5 z-[90] w-full max-w-sm animate-fadeIn">
          <div className={`rounded-lg px-4 py-3 shadow-lg flex items-start gap-3 border ${
            toast.type === 'error'
              ? 'border-red-200 bg-red-50'
              : 'border-green-200 bg-green-50'
          }`}>
            {toast.type === 'error' ? (
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${toast.type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className={`ml-auto text-xs ${toast.type === 'error' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'administradores' ? 'Administradores do sistema' : 'Usuarios'}
          </h1>
          {mode === 'administradores' && (
            <p className="text-sm text-gray-500 mt-0.5">
              Perfis com acesso total ou de RH ao sistema
            </p>
          )}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <Plus size={17} />
          Novo usuário
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, usuário ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <User size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">Usuário</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">E-mail</th>
                <th className="px-4 py-3 text-left font-semibold">Perfil</th>
                {mode !== 'administradores' && (
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                )}
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(user => {
                const perfil = getPerfilMeta(user.perfil)
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {user.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{user.usuario}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${perfil.color}`}>
                        {user.perfil === 'admin' && <ShieldCheck size={12} />}
                        {perfil.label}
                      </span>
                    </td>
                    {mode !== 'administradores' && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleAtivo(user)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition ${
                            user.ativo
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {user.ativo
                            ? <><CheckCircle2 size={12} /> Ativo</>
                            : <><XCircle size={12} /> Inativo</>
                          }
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar usuário' : 'Novo usuário'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Usuário de login */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuário de login *</label>
                  <input
                    type="text"
                    value={form.usuario}
                    onChange={e => setForm(f => ({ ...f, usuario: e.target.value.replace(/\s/g, '') }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="joao.silva"
                  />
                </div>

                {/* Perfil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
                  <Select
                    value={form.perfil}
                    onChange={(value) => setForm(f => ({ ...f, perfil: value as SistemaUsuario['perfil'] }))}
                    options={TODOS_PERFIS
                      .filter(p => perfisDisponiveis.includes(p.value))
                      .map(p => ({ label: p.label, value: p.value }))}
                  />
                </div>
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="joao@empresa.com"
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingId ? 'Nova senha (deixe em branco para não alterar)' : 'Senha *'}
                </label>
                <div className="relative">
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={form.senha}
                    onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" onClick={() => setShowSenha(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}
              {form.senha && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha *</label>
                  <div className="relative">
                    <input
                      type={showConfirmar ? 'text' : 'password'}
                      value={form.confirmarSenha}
                      onChange={e => setForm(f => ({ ...f, confirmarSenha: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Repita a senha"
                    />
                    <button type="button" onClick={() => setShowConfirmar(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Ativo */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.ativo ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.ativo ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm text-gray-700">Usuário ativo</span>
                </label>
              </div>

              {/* Erro */}
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <AlertTriangle size={15} className="shrink-0" />
                  {formError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
              >
                {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Excluir usuário</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Tem certeza que deseja excluir o usuário <strong>{deleteModal.nome}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios
