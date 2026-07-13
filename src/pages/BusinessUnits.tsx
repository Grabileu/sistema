import React, { useMemo, useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { BusinessUnit, Employee } from '../App'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { useClickOutside } from '../hooks/useClickOutside'

interface BusinessUnitsProps {
  businessUnits: BusinessUnit[]
  employees: Employee[]
  onNavigate?: (route: string) => void
  onDeleteBusinessUnit?: (id: string) => void
  onEditBusinessUnit?: (id: string) => void
}

const BusinessUnits: React.FC<BusinessUnitsProps> = ({ businessUnits, employees, onNavigate, onDeleteBusinessUnit, onEditBusinessUnit }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isActionMenuUpward, setIsActionMenuUpward] = useState(false)
  const [companyData, setCompanyData] = useState<any>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Carregar dados da empresa
  useEffect(() => {
    const loadCompanyData = () => {
      const companyDataStr = localStorage.getItem('companyData')
      if (companyDataStr) {
        try {
          setCompanyData(JSON.parse(companyDataStr))
        } catch {
          setCompanyData(null)
        }
      }
    }
    
    loadCompanyData()
    
    // Listener para atualizar quando localStorage mudar
    window.addEventListener('storage', loadCompanyData)
    return () => window.removeEventListener('storage', loadCompanyData)
  }, [])

  // Buscar dados da empresa como loja principal
  const getMainUnit = (): BusinessUnit | null => {
    if (companyData && (companyData.nomeEmpresa || companyData.razaoSocial)) {
      return {
        id: 'company-main',
        nomeUnidade: companyData.nomeEmpresa || companyData.razaoSocial || 'Empresa',
        razaoSocial: companyData.razaoSocial || companyData.nomeEmpresa || '',
        unidadePrincipal: true,
        cnpj: companyData.cnpj || '',
        telefone: companyData.telefone || '',
        cep: companyData.cep || '',
        endereco: companyData.endereco || '',
        numero: companyData.numero || '',
        complemento: companyData.complemento || '',
        bairro: companyData.bairro || '',
        estado: companyData.estado || '',
        cidade: companyData.cidade || '',
        criadoEm: new Date().toLocaleDateString('pt-BR')
      }
    }

    const unidadePrincipal = businessUnits.find(unit => unit.unidadePrincipal)
    return unidadePrincipal || null
  }

  const mainUnit = getMainUnit()

  const employeesByStore = useMemo(() => {
    return employees.reduce<Record<string, number>>((acc, employee) => {
      const storeName = employee.loja || ''
      if (!storeName) return acc
      acc[storeName] = (acc[storeName] || 0) + 1
      return acc
    }, {})
  }, [employees])

  useClickOutside(menuRef, () => setOpenMenuId(null))

  const resolveActionMenuDirection = (button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect()
    const estimatedMenuHeight = 120
    const margin = 12
    const spaceBelow = window.innerHeight - rect.bottom - margin
    const spaceAbove = rect.top - margin
    const wouldOverflowBottom = rect.bottom + estimatedMenuHeight + margin > window.innerHeight

    setIsActionMenuUpward(wouldOverflowBottom && spaceAbove > spaceBelow)
  }

  const toggleActionMenu = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenuId === id) {
      setOpenMenuId(null)
      return
    }

    resolveActionMenuDirection(event.currentTarget)
    setOpenMenuId(id)
  }

  const handleDelete = (id: string, nomeUnidade: string) => {
    setPendingDelete({ id, name: nomeUnidade })
    setOpenMenuId(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    onDeleteBusinessUnit?.(pendingDelete.id)
    setPendingDelete(null)
  }

  const cancelDelete = () => {
    setPendingDelete(null)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Lojas</h1>
          <button
            onClick={() => onNavigate?.('cadastro-unidade-negocio')}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded font-medium hover:bg-indigo-700"
          >
            Cadastrar loja
          </button>
        </div>
      </div>

      {pendingDelete && (
        <DeleteConfirmModal
          title="Excluir loja"
          description="Tem certeza que deseja excluir a loja abaixo?"
          itemName={pendingDelete.name}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <div className="container mx-auto px-6 py-6">
        {businessUnits.length === 0 && !mainUnit ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Nenhuma loja cadastrada</p>
            <button
              onClick={() => onNavigate?.('cadastro-unidade-negocio')}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded font-medium hover:bg-indigo-700"
            >
              Cadastrar primeira loja
            </button>
          </div>
        ) : (
          <>
            {/* Unidade Principal - Destaque */}
            {mainUnit && (
              <div className="rounded-[1.5rem] bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 p-5 mb-8 text-white shadow-xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80">
                      Loja Principal
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">{mainUnit.nomeUnidade}</h2>
                      <p className="mt-1 text-sm text-white/70">{mainUnit.razaoSocial || 'Razão social não informada'}</p>
                    </div>
                  </div>

                  <div className="grid w-full max-w-[560px] gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">CNPJ</p>
                      <p className="mt-2 font-semibold text-white text-sm">{mainUnit.cnpj || '-'}</p>
                    </div>
                    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Funcionários</p>
                      <p className="mt-2 font-semibold text-white text-sm">{employeesByStore[mainUnit.nomeUnidade] ?? 0}</p>
                    </div>
                    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Criada em</p>
                      <p className="mt-2 font-semibold text-white text-sm">{mainUnit.criadoEm}</p>
                    </div>
                  </div>
                </div>

                {mainUnit.endereco && (
                  <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-4 text-white/80">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">Endereço</p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {mainUnit.endereco}, {mainUnit.numero}{mainUnit.complemento ? `, ${mainUnit.complemento}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-white/70">{mainUnit.bairro} · {mainUnit.cidade} · {mainUnit.estado}</p>
                  </div>
                )}
              </div>
            )}

            {/* Lista de Unidades */}
            {businessUnits.length > 0 && (
              <div className="bg-white shadow rounded-lg overflow-visible">
                <div className="p-4 bg-gray-50 border-b text-right text-sm text-gray-600">
                  Página 1/1 - Exibindo {businessUnits.length} de {businessUnits.length} registros
                </div>
              
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Nome da loja
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Funcionários
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Criada em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {businessUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-800">
                          {unit.nomeUnidade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.cnpj || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employeesByStore[unit.nomeUnidade] ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.criadoEm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="relative" ref={openMenuId === unit.id ? menuRef : null}>
                          <button
                            onClick={(event) => toggleActionMenu(unit.id, event)}
                            className="hover:bg-gray-100 p-1 rounded"
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {openMenuId === unit.id && (
                            <div className={`absolute right-0 w-48 max-h-[min(16rem,calc(100vh-2rem))] overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white shadow-lg z-50 ${isActionMenuUpward ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                              <button
                                onClick={() => {
                                  onEditBusinessUnit?.(unit.id)
                                  setOpenMenuId(null)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                              >
                                <Edit2 size={16} />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(unit.id, unit.nomeUnidade)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                              >
                                <Trash2 size={16} />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default BusinessUnits
