import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { BusinessUnit } from '../App'
import { useClickOutside } from '../hooks/useClickOutside'

interface BusinessUnitsProps {
  businessUnits: BusinessUnit[]
  onNavigate?: (route: string) => void
  onDeleteBusinessUnit?: (id: string) => void
  onEditBusinessUnit?: (id: string) => void
}

const BusinessUnits: React.FC<BusinessUnitsProps> = ({ businessUnits, onNavigate, onDeleteBusinessUnit, onEditBusinessUnit }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isActionMenuUpward, setIsActionMenuUpward] = useState(false)
  const [companyData, setCompanyData] = useState<any>(null)
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
  const getMainUnit = () => {
    const unitoPrincipal = businessUnits.find(unit => unit.unidadePrincipal)
    
    // Se não houver unidade marcada como principal, usar dados da empresa
    if (!unitoPrincipal && companyData) {
      return {
        id: 'company-main',
        nomeUnidade: companyData.nomeEmpresa || companyData.razaoSocial || 'Empresa',
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
    
    return unitoPrincipal || null
  }

  const mainUnit = getMainUnit()

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

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta loja?')) {
      onDeleteBusinessUnit?.(id)
      setOpenMenuId(null)
    }
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
              <div className="bg-white shadow rounded-lg p-8 mb-8 border-l-4 border-indigo-600">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        Loja Principal
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{mainUnit.nomeUnidade}</h2>
                  </div>
                  {mainUnit.id !== 'company-main' && (
                    <div className="relative" ref={openMenuId === mainUnit.id ? menuRef : null}>
                      <button
                        onClick={(event) => toggleActionMenu(mainUnit.id, event)}
                        className="hover:bg-gray-100 p-2 rounded"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      {openMenuId === mainUnit.id && (
                        <div className={`absolute right-0 w-48 max-h-[min(16rem,calc(100vh-2rem))] overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white shadow-lg z-50 ${isActionMenuUpward ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                          <button
                            onClick={() => {
                              onEditBusinessUnit?.(mainUnit.id)
                              setOpenMenuId(null)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                          >
                            <Edit2 size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(mainUnit.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                          >
                            <Trash2 size={16} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">CNPJ</p>
                    <p className="text-lg font-semibold text-gray-900">{mainUnit.cnpj || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Telefone</p>
                    <p className="text-lg font-semibold text-gray-900">{mainUnit.telefone || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">CEP</p>
                    <p className="text-lg font-semibold text-gray-900">{mainUnit.cep || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Criada em</p>
                    <p className="text-lg font-semibold text-gray-900">{mainUnit.criadoEm}</p>
                  </div>
                </div>

                {mainUnit.endereco && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm text-gray-600 mb-2">Endereço completo</p>
                    <p className="text-gray-900">
                      {mainUnit.endereco}, {mainUnit.numero}
                      {mainUnit.complemento && ` - ${mainUnit.complemento}`}
                      <br />
                      {mainUnit.bairro} - {mainUnit.cidade}, {mainUnit.estado}
                    </p>
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
                      Unidade principal?
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      CNPJ
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
                        {unit.unidadePrincipal ? 'Sim' : 'Não'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {unit.cnpj || '-'}
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
                                onClick={() => handleDelete(unit.id)}
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
