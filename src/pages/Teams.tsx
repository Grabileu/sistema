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
    <div className="bg-gray-50 min-h-screen">
      {pendingDelete && (
        <DeleteConfirmModal
          title="Excluir equipe"
          description="Tem certeza que deseja excluir a equipe abaixo?"
          itemName={pendingDelete.nome}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Equipes</h1>
          <button
            type="button"
            onClick={() => onNavigate?.('cadastro-equipe')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
          >
            Cadastrar equipe
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">

        <div className="flex items-center gap-6 border-b">
          <button
            className={`py-3 text-sm font-semibold ${activeTab === 'gerenciar' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('gerenciar')}
          >
            Gerenciar
          </button>
          <button
            className={`py-3 text-sm font-semibold ${activeTab === 'gestores' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('gestores')}
          >
            Gestores
          </button>
        </div>

        {activeTab === 'gerenciar' && (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-3">Código</th>
                    <th className="py-3">Nome</th>
                    <th className="py-3">Departamento</th>
                    <th className="py-3">Nº Funcionários</th>
                    <th className="py-3">Nº Gestores</th>
                    <th className="py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {teams.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">
                        Nenhuma equipe cadastrada
                      </td>
                    </tr>
                  ) : (
                    teams.map((team) => (
                      <tr key={team.id} className="border-b hover:bg-gray-50">
                        <td className="py-4">{team.codigo}</td>
                        <td className="py-4">{team.nome}</td>
                        <td className="py-4">
                          <button className="text-indigo-600 hover:underline">
                            {team.departamentoNome}
                          </button>
                        </td>
                        <td className="py-4">{team.totalFuncionarios}</td>
                        <td className="py-4">{team.totalGestores}</td>
                        <td className="py-4 text-right">
                          <div className="relative inline-block" ref={openMenuId === team.id ? menuRef : null}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === team.id ? null : team.id)}
                              className="p-2 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical size={16} className="text-gray-500" />
                            </button>
                            {openMenuId === team.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-[9999]">
                                <button
                                  onClick={() => handleView(team.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Eye size={16} />
                                  Visualizar
                                </button>
                                <button
                                  onClick={() => handleEdit(team.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Edit2 size={16} />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(team.id, team.nome)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">O que seria um gestor?</h2>
              <p className="text-sm text-gray-600 mb-1">Gestor é o profissional responsável por liderar sua equipe.<br />
                O gestor poderá ver os registros da sua equipe, além de aprovar e reprovar solicitações.<br />
                Os gestores de equipes podem ser adicionados na tela de criar/editar equipe.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-3">Funcionário</th>
                    <th className="py-3">E-mail</th>
                    <th className="py-3">Equipe</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {teams.length === 0 || teams.filter(team => team.totalGestores > 0).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-gray-500">
                        Nenhum gestor cadastrado
                      </td>
                    </tr>
                  ) : (
                    teams.filter(team => team.totalGestores > 0).flatMap(team => {
                      // Pegue os N primeiros IDs de employeeIds como gestores
                      const gestoresIds = team.employeeIds.slice(0, team.totalGestores)
                      const gestores = gestoresIds.map(id => employees.find(e => e.id === id)).filter(Boolean) as Employee[]
                      return gestores.map(gestor => (
                        <tr key={team.id + '-' + gestor.id}>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                {gestor.nomeCompleto.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-indigo-700 hover:underline cursor-pointer">{gestor.nomeCompleto}</div>
                                <div className="text-xs text-gray-500">{gestor.cargo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">{gestor.email}</td>
                          <td className="py-4">
                            <span className="text-indigo-700 hover:underline cursor-pointer">{team.nome}</span>
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
