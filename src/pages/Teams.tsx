import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

import { Employee } from '../App'

interface TeamsProps {
  onNavigate?: (route: string) => void
  teams: Array<{
    id: string
    codigo: string
    nome: string
    departamentoNome: string
    totalFuncionarios: number
    totalGestores: number
    employeeIds: string[]
  }>
  employees: Employee[]
  onViewTeam?: (id: string) => void
  onEditTeam?: (id: string) => void
  onDeleteTeam?: (id: string) => void
  initialTab?: 'gerenciar' | 'gestores'
}

const Teams: React.FC<TeamsProps> = ({ onNavigate, teams, employees, onViewTeam, onEditTeam, onDeleteTeam, initialTab }) => {

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nome: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'gerenciar' | 'gestores'>(initialTab || 'gerenciar');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
      localStorage.removeItem('teamsActiveTab')
    }
  }, [initialTab])

  useClickOutside(menuRef, () => setOpenMenuId(null))

  const handleDelete = (id: string, nome: string) => {
    setPendingDelete({ id, nome })
    setOpenMenuId(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    onDeleteTeam?.(pendingDelete.id)
    setPendingDelete(null)
  }

  const cancelDelete = () => {
    setPendingDelete(null)
  }

  const handleEdit = (id: string) => {
    onEditTeam?.(id)
    setOpenMenuId(null)
  }

  const handleView = (id: string) => {
    onViewTeam?.(id)
    setOpenMenuId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {pendingDelete && (
        <DeleteConfirmModal
          title="Excluir equipe"
          description="Tem certeza que deseja excluir a equipe abaixo?"
          itemName={pendingDelete.nome}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Equipes</h1>
            <p className="mt-1 text-sm text-slate-500">Gerencie equipes, gestores e estrutura da operação.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('cadastro-equipe')}
            className="app-button-primary"
          >
            Cadastrar equipe
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === 'gerenciar' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            onClick={() => setActiveTab('gerenciar')}
          >
            Gerenciar
          </button>
          <button
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === 'gestores' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            onClick={() => setActiveTab('gestores')}
          >
            Gestores
          </button>
        </div>

        {activeTab === 'gerenciar' && (
          <div className="app-card mt-6 p-0 overflow-visible">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-600">
              Exibindo {teams.length} equipe(s)
            </div>
            <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Código</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Nome</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Departamento</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Nº Funcionários</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide">Nº Gestores</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-slate-700">
                  {teams.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12">
                        <div className="mx-auto flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                          <div className="text-sm font-semibold text-slate-700">Nenhuma equipe cadastrada</div>
                          <div className="mt-1 text-sm text-slate-500">Cadastre uma equipe para começar.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    teams.map((team) => (
                      <tr key={team.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        <td className="px-6 py-4">{team.codigo}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{team.nome}</td>
                        <td className="px-6 py-4">
                          <button className="text-blue-700 hover:text-blue-800 hover:underline">
                            {team.departamentoNome}
                          </button>
                        </td>
                        <td className="px-6 py-4">{team.totalFuncionarios}</td>
                        <td className="px-6 py-4">{team.totalGestores}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block" ref={openMenuId === team.id ? menuRef : null}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === team.id ? null : team.id)}
                              className="rounded-lg p-1.5 transition hover:bg-slate-100"
                            >
                              <MoreVertical size={16} className="text-slate-500" />
                            </button>
                            {openMenuId === team.id && (
                              <div className="absolute right-0 z-[9999] mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                                <button
                                  onClick={() => handleView(team.id)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                                >
                                  <Eye size={16} />
                                  Visualizar
                                </button>
                                <button
                                  onClick={() => handleEdit(team.id)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                                >
                                  <Edit2 size={16} />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(team.id, team.nome)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'gestores' && (
          <div className="app-card mt-6 p-6">
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <h2 className="text-lg font-semibold text-slate-900">O que seria um gestor?</h2>
              <p className="mt-2 text-sm text-slate-600">Gestor é o profissional responsável por liderar sua equipe. Ele pode visualizar os registros da equipe, além de aprovar e reprovar solicitações. Os gestores podem ser adicionados na tela de criar ou editar equipe.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Funcionário</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">E-mail</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Equipe</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-slate-700">
                  {teams.length === 0 || teams.filter(team => team.totalGestores > 0).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12">
                        <div className="mx-auto flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                          <div className="text-sm font-semibold text-slate-700">Nenhum gestor cadastrado</div>
                          <div className="mt-1 text-sm text-slate-500">Adicione gestores nas equipes para visualizá-los aqui.</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    teams.filter(team => team.totalGestores > 0).flatMap(team => {
                      const gestoresIds = team.employeeIds.slice(0, team.totalGestores)
                      const gestores = gestoresIds.map(id => employees.find(e => e.id === id)).filter(Boolean) as Employee[]
                      return gestores.map(gestor => (
                        <tr key={team.id + '-' + gestor.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-blue-700">
                                {gestor.nomeCompleto.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800">{gestor.nomeCompleto}</div>
                                <div className="text-xs text-slate-500">{gestor.cargo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{gestor.email}</td>
                          <td className="px-4 py-4">
                            <span className="font-medium text-blue-700">{team.nome}</span>
                          </td>
                        </tr>
                      ))
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Teams
import { useClickOutside } from '../hooks/useClickOutside'
