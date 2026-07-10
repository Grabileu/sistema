import React, { useState, useRef } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { Department } from '../App'
import { useClickOutside } from '../hooks/useClickOutside'

interface DepartmentsProps {
  onNavigate?: (route: string) => void
  departments?: Department[]
  onDeleteDepartment?: (id: string) => void
  onEditDepartment?: (id: string) => void
}

const Departments: React.FC<DepartmentsProps> = ({ 
  onNavigate, 
  departments = [], 
  onDeleteDepartment, 
  onEditDepartment 
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nome: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside(menuRef, () => setOpenMenuId(null))

  const handleDelete = (id: string, nome: string) => {
    setPendingDelete({ id, nome })
    setOpenMenuId(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    onDeleteDepartment?.(pendingDelete.id)
    setPendingDelete(null)
  }

  const cancelDelete = () => {
    setPendingDelete(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {pendingDelete && (
        <DeleteConfirmModal
          title="Excluir departamento"
          description="Tem certeza que deseja excluir o departamento abaixo?"
          itemName={pendingDelete.nome}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Lista de departamentos</h1>
            <p className="mt-1 text-sm text-slate-500">Gerencie os departamentos cadastrados no sistema.</p>
          </div>
          <button
            onClick={() => onNavigate?.('cadastro-departamento')}
            className="app-button-primary"
          >
            Cadastrar departamento
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="app-card overflow-visible">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm text-slate-600">
            Exibindo {departments.length} registro(s)
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Criado em</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12">
                      <div className="mx-auto flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                        <div className="text-sm font-semibold text-slate-700">Nenhum departamento cadastrado</div>
                        <div className="mt-1 text-sm text-slate-500">Cadastre o primeiro departamento para começar.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{dept.codigo}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800">{dept.nome}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{dept.criadoEm}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        <div className="relative" ref={openMenuId === dept.id ? menuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === dept.id ? null : dept.id)}
                            className="rounded-lg p-1.5 transition hover:bg-slate-100"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenuId === dept.id && (
                            <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                              <button
                                onClick={() => {
                                  onEditDepartment?.(dept.id)
                                  setOpenMenuId(null)
                                }}
                                className="flex w-full items-center gap-3 rounded-t-xl px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                              >
                                <Edit2 size={16} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(dept.id, dept.nome)}
                                className="flex w-full items-center gap-3 rounded-b-xl px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
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
      </div>
    </div>
  )
}

export default Departments
