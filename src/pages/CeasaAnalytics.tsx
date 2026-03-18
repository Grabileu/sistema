import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CalendarDays, ChevronDown, Pencil, Plus, Store, Trash2, Truck } from 'lucide-react'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'
import { safeNumber, normalizeDate, parseDateBR, toCurrency, toPercent } from '../utils/formatters'

interface CeasaCompra {
  id: string
  dataCompra: string
  produto: string
  categoria: string
  fornecedor: string
  loja: string
  unidadeMedida: string
  quantidade: number
  valorUnitario: number
  valorCaixa?: number
  valorTotal?: number
  criadoEm: string
}

interface CeasaProps {
  onNavigate?: (route: string) => void
  businessUnits?: any[]
}

interface CeasaFornecedorCadastro {
  id: string
  codigo: string
  nome: string
  telefone: string
  observacao: string
  produtos: Array<{ nome: string }>
  criadoEm: string
}

type ListViewMode = 'compras' | 'fornecedores'

const CEASA_EDIT_IDS_KEY = 'ceasaCompraEdicaoIds'

interface PendingCompraDelete {
  ids: string[]
  data: string
  loja: string
  fornecedor: string
  quantidadeItens: number
}

const formatCategoryLabel = (value: string) => {
  const normalized = String(value || '').trim()
  if (!normalized) return '-'

  return normalized
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const normalizeCategory = (value: string) => String(value || '').trim().toLowerCase()

const isOtherCategory = (category: string) => {
  const normalized = normalizeCategory(category)
  return normalized === 'outro' || normalized === 'outros'
}

const isProduceCategory = (category: string) => {
  const normalized = normalizeCategory(category)
  return ['hortifruti', 'fruta', 'frutas', 'verdura', 'verduras', 'legume', 'legumes'].includes(normalized)
}

const getUnitLabel = (value: string) => {
  const unit = String(value || '').trim().toLowerCase()
  if (unit === 'fd') return 'FD'
  if (unit === 'unid') return 'Unid'
  if (unit === 'kg') return 'KG'
  return 'CX'
}

const getCommercialUnitLabel = (category: string, unidadeMedida: string) => {
  if (isProduceCategory(category)) return 'CX'
  return getUnitLabel(unidadeMedida)
}

const formatQuantityDisplay = (quantity: number, category: string, unidadeMedida: string) => {
  const compact = quantity.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  })

  if (isOtherCategory(category)) {
    return `${compact}${getUnitLabel(unidadeMedida)}`
  }

  if (isProduceCategory(category)) {
    return `${compact}CX`
  }

  return quantity.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const lojaStylePalette = [
  {
    shell: 'from-sky-50 via-white to-white border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
    supplierCard: 'border-sky-100'
  },
  {
    shell: 'from-emerald-50 via-white to-white border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    supplierCard: 'border-emerald-100'
  },
  {
    shell: 'from-amber-50 via-white to-white border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    supplierCard: 'border-amber-100'
  },
  {
    shell: 'from-cyan-50 via-white to-white border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-700',
    supplierCard: 'border-cyan-100'
  },
  {
    shell: 'from-lime-50 via-white to-white border-lime-200',
    badge: 'bg-lime-100 text-lime-700',
    supplierCard: 'border-lime-100'
  }
]

const getLojaStyle = (lojaName: string) => {
  const normalized = String(lojaName || 'Sem loja').trim().toLowerCase()
  const hash = normalized.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return lojaStylePalette[hash % lojaStylePalette.length]
}

const getValorTotal = (compra: CeasaCompra) => {
  const total = safeNumber(compra.valorTotal, Number.NaN)
  if (Number.isFinite(total) && total > 0) return total
  return safeNumber(compra.quantidade) * safeNumber(compra.valorUnitario)
}

const loadCeasaFornecedores = (): CeasaFornecedorCadastro[] => {
  const raw = localStorage.getItem('ceasaFornecedores')
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as any[]
    if (!Array.isArray(parsed)) return []

    return parsed.map((item) => ({
      id: String(item?.id || `fornecedor-${Date.now()}-${Math.random()}`),
      codigo: String(item?.codigo || ''),
      nome: String(item?.nome || '').trim(),
      telefone: String(item?.telefone || ''),
      observacao: String(item?.observacao || ''),
      produtos: Array.isArray(item?.produtos)
        ? item.produtos
          .map((product: any) => ({ nome: String(product?.nome || '').trim() }))
          .filter((product: { nome: string }) => Boolean(product.nome))
        : [],
      criadoEm: String(item?.criadoEm || new Date().toLocaleDateString('pt-BR'))
    })).filter((supplier) => Boolean(supplier.nome))
  } catch {
    localStorage.removeItem('ceasaFornecedores')
    return []
  }
}

// Função para calcular comparação de preços históricos
const buildPriceComparison = (compras: CeasaCompra[]) => {
  const comparisons: Record<string, { mediaAnterior: number | null; variacaoPercentual: number | null }> = {}
  const lastValueByProduto = new Map<string, number>()

  const sortedByDate = [...compras].sort((a, b) => {
    const dateA = parseDateBR(a.dataCompra)?.getTime() ?? 0
    const dateB = parseDateBR(b.dataCompra)?.getTime() ?? 0
    return dateA - dateB
  })

  sortedByDate.forEach((compra) => {
    const key = (compra.produto || '').trim().toLowerCase()
    const previousValue = lastValueByProduto.get(key)
    const mediaAnterior = typeof previousValue === 'number' ? previousValue : null

    let variacaoPercentual: number | null = null
    if (mediaAnterior !== null && mediaAnterior > 0) {
      variacaoPercentual = ((compra.valorUnitario - mediaAnterior) / mediaAnterior) * 100
    }

    comparisons[compra.id] = { mediaAnterior, variacaoPercentual }

    const currentValue = safeNumber(compra.valorUnitario, 0)
    if (currentValue > 0) {
      lastValueByProduto.set(key, currentValue)
    }
  })

  return comparisons
}

// Estrutura de dados agrupados
interface GroupedData {
  data: string
  lojas: {
    nome: string
    fornecedores: {
      nome: string
      compras: CeasaCompra[]
      totalGasto: number
      quantidadeProdutos: number
      ticketMedio: number
    }[]
    totalGastoLoja: number
    totalProdutosLoja: number
  }[]
  totalGastoData: number
  totalProdutosData: number
}

const CeasaAnalytics: React.FC<CeasaProps> = ({ onNavigate, businessUnits = [] }) => {
  const standardFieldClass = 'rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'

  const handleAddSupplier = () => {
    localStorage.removeItem('ceasaFornecedorEdicaoId')
    onNavigate?.('ceasa-cadastro-fornecedor')
  }

  const [compras, setCompras] = useState<CeasaCompra[]>(() => {
    const storedCompras = localStorage.getItem('ceasaCompras')
    if (storedCompras) {
      try {
        const parsed = JSON.parse(storedCompras) as any[]
        return parsed.map((item) => ({
          id: String(item.id || `ceasa-${Date.now()}-${Math.random()}`),
          dataCompra: normalizeDate(item.dataCompra || item.data || ''),
          produto: String(item.produto || item.descricao || 'Item sem produto'),
          categoria: String(item.categoria || 'Hortifruti'),
          fornecedor: String(item.fornecedor || item.funcionarioNome || '-'),
          loja: String(item.loja || ''),
          unidadeMedida: String(item.unidadeMedida || 'kg'),
          quantidade: safeNumber(item.quantidade, 1),
          valorUnitario: safeNumber(item.valorUnitario || item.valor, 0),
          valorCaixa: safeNumber(item.valorCaixa, 0),
          valorTotal: safeNumber(item.valorTotal, 0),
          criadoEm: String(item.criadoEm || new Date().toLocaleDateString('pt-BR'))
        }))
      } catch {
        localStorage.removeItem('ceasaCompras')
      }
    }
    return []
  })

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<PendingCompraDelete | null>(null)
  const [pendingSupplierDelete, setPendingSupplierDelete] = useState<{ id: string; nome: string } | null>(null)
  const [fornecedoresCadastrados, setFornecedoresCadastrados] = useState<CeasaFornecedorCadastro[]>(() => loadCeasaFornecedores())
  const [listViewMode, setListViewMode] = useState<ListViewMode>('compras')
  const [isFornecedorDropdownOpen, setIsFornecedorDropdownOpen] = useState(false)
  const fornecedorDropdownRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState({
    fornecedores: [] as string[],
    loja: '',
    dataInicio: '',
    dataFim: ''
  })

  useEffect(() => {
    const refreshSuppliers = () => setFornecedoresCadastrados(loadCeasaFornecedores())
    refreshSuppliers()
    window.addEventListener('storage', refreshSuppliers)
    window.addEventListener('focus', refreshSuppliers)
    return () => {
      window.removeEventListener('storage', refreshSuppliers)
      window.removeEventListener('focus', refreshSuppliers)
    }
  }, [])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!fornecedorDropdownRef.current) return
      if (!fornecedorDropdownRef.current.contains(event.target as Node)) {
        setIsFornecedorDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const priceComparisons = useMemo(() => buildPriceComparison(compras), [compras])

  // Filtra e agrupa dados por Data → Loja → Fornecedor
  const groupedData = useMemo(() => {
    const filtered = compras.filter((compra) => {
      if (filters.fornecedores.length > 0 && !filters.fornecedores.includes(compra.fornecedor)) return false
      if (filters.loja && compra.loja !== filters.loja) return false
      if (filters.dataInicio) {
        const compraDate = parseDateBR(compra.dataCompra)
        const filterDate = parseDateBR(filters.dataInicio)
        if (compraDate && filterDate && compraDate < filterDate) return false
      }
      if (filters.dataFim) {
        const compraDate = parseDateBR(compra.dataCompra)
        const filterDate = parseDateBR(filters.dataFim)
        if (compraDate && filterDate && compraDate > filterDate) return false
      }
      return true
    })

    // Agrupar por data (descrescente)
    const byDate = new Map<string, typeof filtered>()
    filtered.forEach((item) => {
      if (!byDate.has(item.dataCompra)) byDate.set(item.dataCompra, [])
      byDate.get(item.dataCompra)!.push(item)
    })

    const result: GroupedData[] = Array.from(byDate.entries())
      .sort((a, b) => {
        const dateA = parseDateBR(a[0])?.getTime() ?? 0
        const dateB = parseDateBR(b[0])?.getTime() ?? 0
        return dateB - dateA // Mais recente primeiro
      })
      .map(([data, itemsData]) => {
        // Agrupar por loja
        const byLoja = new Map<string, typeof itemsData>()
        itemsData.forEach((item) => {
          const lojaKey = item.loja || 'Sem loja'
          if (!byLoja.has(lojaKey)) byLoja.set(lojaKey, [])
          byLoja.get(lojaKey)!.push(item)
        })

        const lojas = Array.from(byLoja.entries()).map(([lojaName, itemsLoja]) => {
          // Agrupar por fornecedor
          const byFornecedor = new Map<string, typeof itemsLoja>()
          itemsLoja.forEach((item) => {
            if (!byFornecedor.has(item.fornecedor)) byFornecedor.set(item.fornecedor, [])
            byFornecedor.get(item.fornecedor)!.push(item)
          })

          const fornecedores = Array.from(byFornecedor.entries()).map(([fornecedorName, itemsFornecedor]) => {
            const totalGasto = itemsFornecedor.reduce((sum, item) => sum + getValorTotal(item), 0)
            return {
              nome: fornecedorName,
              compras: itemsFornecedor,
              totalGasto,
              quantidadeProdutos: itemsFornecedor.length,
              ticketMedio: totalGasto / itemsFornecedor.length
            }
          })

          const totalGastoLoja = fornecedores.reduce((sum, f) => sum + f.totalGasto, 0)
          const totalProdutosLoja = fornecedores.reduce((sum, f) => sum + f.quantidadeProdutos, 0)

          return {
            nome: lojaName,
            fornecedores: fornecedores.sort((a, b) => b.totalGasto - a.totalGasto),
            totalGastoLoja,
            totalProdutosLoja
          }
        })

        const totalGastoData = lojas.reduce((sum, l) => sum + l.totalGastoLoja, 0)
        const totalProdutosData = lojas.reduce((sum, l) => sum + l.totalProdutosLoja, 0)

        return { data, lojas, totalGastoData, totalProdutosData }
      })

    return result
  }, [compras, filters])

  const fornecedorFilterLabel = useMemo(() => {
    if (filters.fornecedores.length === 0) return 'Todos'
    if (filters.fornecedores.length === 1) return filters.fornecedores[0]
    return `${filters.fornecedores.length} fornecedores`
  }, [filters.fornecedores])

  const toggleFornecedor = (fornecedor: string) => {
    setFilters((prev) => {
      const exists = prev.fornecedores.includes(fornecedor)
      return {
        ...prev,
        fornecedores: exists
          ? prev.fornecedores.filter((item) => item !== fornecedor)
          : [...prev.fornecedores, fornecedor]
      }
    })
  }

  const selectAllFornecedores = () => {
    setFilters((prev) => ({
      ...prev,
      fornecedores: fornecedorOptions.filter((option) => option.value).map((option) => String(option.value))
    }))
  }

  const clearFornecedores = () => {
    setFilters((prev) => ({ ...prev, fornecedores: [] }))
  }

  const handleDeleteCompraGroup = (
    data: string,
    loja: string,
    fornecedor: string,
    comprasDoFornecedor: CeasaCompra[]
  ) => {
    setPendingDelete({
      ids: comprasDoFornecedor.map((item) => item.id),
      data,
      loja,
      fornecedor,
      quantidadeItens: comprasDoFornecedor.length
    })
  }

  const handleEditCompraGroup = (comprasDoFornecedor: CeasaCompra[]) => {
    const ids = comprasDoFornecedor.map((item) => item.id)
    localStorage.setItem(CEASA_EDIT_IDS_KEY, JSON.stringify(ids))
    onNavigate?.('ceasa-adicionar-compra')
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const idsToDelete = new Set(pendingDelete.ids)
    setCompras((prev) => prev.filter((item) => !idsToDelete.has(item.id)))
    setPendingDelete(null)
  }

  const handleEditSupplier = (supplierId: string) => {
    localStorage.setItem('ceasaFornecedorEdicaoId', supplierId)
    onNavigate?.('ceasa-cadastro-fornecedor')
  }

  const handleDeleteSupplier = (supplierId: string, supplierName: string) => {
    setPendingSupplierDelete({ id: supplierId, nome: supplierName })
  }

  const confirmDeleteSupplier = () => {
    if (!pendingSupplierDelete) return
    const updatedSuppliers = loadCeasaFornecedores().filter((supplier) => supplier.id !== pendingSupplierDelete.id)
    localStorage.setItem('ceasaFornecedores', JSON.stringify(updatedSuppliers))
    setFornecedoresCadastrados(updatedSuppliers)
    setPendingSupplierDelete(null)
  }

  const toggleExpandGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const lojaOptions = useMemo(() => {
    const lojas = new Set(compras.map((c) => c.loja).filter(Boolean))
    return [
      { label: 'Todas', value: '' },
      ...Array.from(lojas)
        .sort()
        .map((loja) => ({ label: loja, value: loja }))
    ]
  }, [compras])

  const fornecedorOptions = useMemo(() => {
    const fornecedores = new Set(compras.map((c) => c.fornecedor))
    return [
      { label: 'Todos', value: '' },
      ...Array.from(fornecedores)
        .sort()
        .map((forn) => ({ label: forn, value: forn }))
    ]
  }, [compras])

  const resumoGeral = useMemo(() => {
    const totalGasto = groupedData.reduce((sum, d) => sum + d.totalGastoData, 0)
    const totalProdutos = groupedData.reduce((sum, d) => sum + d.totalProdutosData, 0)
    const totalCompras = groupedData.reduce((sum, d) => sum + d.lojas.reduce((ls, l) => ls + l.fornecedores.reduce((fs, f) => fs + f.compras.length, 0), 0), 0)
    return {
      totalGasto,
      totalProdutos,
      totalCompras,
      ticketMedio: totalCompras > 0 ? totalGasto / totalCompras : 0
    }
  }, [groupedData])

  return (
    <div className="bg-gray-50 min-h-screen">
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm px-4"
          onClick={() => setPendingDelete(null)}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h2 className="text-lg font-semibold">Excluir compra</h2>
            </div>
            <p className="text-gray-600 mb-4">Tem certeza? Esta ação não pode ser desfeita.</p>
            <div className="bg-gray-100 p-3 rounded mb-6">
              <p className="text-sm font-medium">{pendingDelete.fornecedor}</p>
              <p className="text-xs text-gray-600 mt-1">{pendingDelete.data} • {pendingDelete.loja || 'Sem loja'} • {pendingDelete.quantidadeItens} item(ns)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingSupplierDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm px-4"
          onClick={() => setPendingSupplierDelete(null)}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-600" size={24} />
              <h2 className="text-lg font-semibold">Excluir fornecedor</h2>
            </div>
            <p className="text-gray-600 mb-4">Tem certeza? Esta ação não pode ser desfeita.</p>
            <div className="bg-gray-100 p-3 rounded mb-6">
              <p className="text-sm font-medium">{pendingSupplierDelete.nome}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingSupplierDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteSupplier}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Compra ceasa</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(CEASA_EDIT_IDS_KEY)
              onNavigate?.('ceasa-adicionar-compra')
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Nova compra
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="mb-4">
          <div className="inline-flex rounded-md bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setListViewMode('compras')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                listViewMode === 'compras' ? 'bg-white text-indigo-700 shadow' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Compras
            </button>
            <button
              type="button"
              onClick={() => setListViewMode('fornecedores')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                listViewMode === 'fornecedores' ? 'bg-white text-indigo-700 shadow' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Fornecedores
            </button>
          </div>
        </div>

        {listViewMode === 'compras' && (
          <>
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-indigo-700 mb-1">Total Gasto</p>
            <p className="text-2xl font-bold text-indigo-900">{toCurrency(resumoGeral.totalGasto)}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-emerald-700 mb-1">Itens</p>
            <p className="text-2xl font-bold text-emerald-900">{resumoGeral.totalProdutos}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-700 mb-1">Compras</p>
            <p className="text-2xl font-bold text-blue-900">{resumoGeral.totalCompras}</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">Ticket Médio</p>
            <p className="text-2xl font-bold text-amber-900">{toCurrency(resumoGeral.ticketMedio)}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
              <div ref={fornecedorDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsFornecedorDropdownOpen((prev) => !prev)}
                  className={`w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 flex items-center justify-between ${standardFieldClass}`}
                >
                  <span className="truncate">{fornecedorFilterLabel}</span>
                  <span className="text-xs text-gray-500">Selecionar</span>
                </button>

                {isFornecedorDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto p-2">
                    <div className="flex items-center justify-between gap-2 px-1 pb-2 border-b border-gray-100 mb-2">
                      <button
                        type="button"
                        onClick={selectAllFornecedores}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Marcar todos
                      </button>
                      <button
                        type="button"
                        onClick={clearFornecedores}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        Limpar
                      </button>
                    </div>
                    {fornecedorOptions
                      .filter((option) => option.value)
                      .map((option) => {
                        const value = String(option.value)
                        const checked = filters.fornecedores.includes(value)
                        return (
                          <label key={value} className="flex items-center gap-2 px-1 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleFornecedor(value)}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-blue-100"
                            />
                            <span className="truncate">{option.label}</span>
                          </label>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loja</label>
              <Select
                value={filters.loja}
                onChange={(val) => setFilters({ ...filters, loja: String(val) })}
                options={lojaOptions}
                buttonClassName={standardFieldClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">De</label>
              <DatePicker
                value={filters.dataInicio}
                onChange={(val) => setFilters({ ...filters, dataInicio: val })}
                placeholder="Data início"
                className={standardFieldClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Até</label>
              <DatePicker
                value={filters.dataFim}
                onChange={(val) => setFilters({ ...filters, dataFim: val })}
                placeholder="Data fim"
                className={standardFieldClass}
              />
            </div>
          </div>
        </div>

        {/* Dados агрупados */}
        <div className="space-y-3">
          {groupedData.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">Nenhuma compra encontrada</p>
            </div>
          ) : (
            groupedData.map((dayGroup) => {
              const isExpanded = expandedGroups.has(dayGroup.data)

              return (
                <div key={dayGroup.data} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <button
                    onClick={() => toggleExpandGroup(dayGroup.data)}
                    className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
                          <CalendarDays size={18} />
                        </span>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-white">{dayGroup.data}</p>
                          <p className="text-xs text-slate-200">{dayGroup.lojas.length} loja(s) • {dayGroup.totalProdutosData} produtos</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wide text-slate-300">Total do dia</p>
                          <p className="text-sm font-semibold text-white">{toCurrency(dayGroup.totalGastoData)}</p>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`text-slate-200 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5">
                      {dayGroup.lojas.map((loja, lojaIdx) => {
                        const lojaStyle = getLojaStyle(loja.nome)

                        return (
                          <div
                            key={`${dayGroup.data}-${lojaIdx}`}
                            className={`overflow-hidden rounded-2xl border bg-gradient-to-br ${lojaStyle.shell} shadow-sm`}
                          >
                            <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${lojaStyle.badge}`}>
                                  <Store size={16} />
                                </span>
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Loja</p>
                                  <p className="text-sm font-semibold text-slate-900">{loja.nome}</p>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-slate-500">{loja.fornecedores.length} fornecedor(es)</p>
                                <p className="text-sm font-semibold text-slate-900">{toCurrency(loja.totalGastoLoja)}</p>
                              </div>
                            </div>

                            <div className="h-px bg-slate-200/70" />

                            <div className="space-y-3 p-3 sm:p-4">
                              {loja.fornecedores.map((fornecedor, fornIdx) => (
                                <div key={`${dayGroup.data}-${lojaIdx}-${fornIdx}`} className={`rounded-xl border bg-white p-3 shadow-sm sm:p-4 ${lojaStyle.supplierCard}`}>
                                  <div className="mb-3 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <Truck size={14} />
                                      </span>
                                      <div>
                                        <p className="text-sm font-semibold text-slate-900">{fornecedor.nome}</p>
                                        <p className="text-xs text-slate-500">{fornecedor.quantidadeProdutos} itens • Ticket: {toCurrency(fornecedor.ticketMedio)}</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <p className="text-[11px] uppercase tracking-wide text-slate-500">Total fornecedor</p>
                                        <p className="text-sm font-semibold text-slate-900">{toCurrency(fornecedor.totalGasto)}</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleEditCompraGroup(fornecedor.compras)}
                                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                        title="Editar compra"
                                      >
                                        <Pencil size={12} />
                                        Editar compra
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCompraGroup(dayGroup.data, loja.nome, fornecedor.nome, fornecedor.compras)}
                                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                        title="Excluir compra"
                                      >
                                        <Trash2 size={12} />
                                        Excluir compra
                                      </button>
                                    </div>
                                  </div>

                                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="bg-slate-100 border-b border-slate-200">
                                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Produto</th>
                                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Categoria</th>
                                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">Qtd</th>
                                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">Valor Caixa/Fardo</th>
                                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">Valor Unit.</th>
                                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">Custo Anterior</th>
                                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">Variação</th>
                                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {fornecedor.compras.map((item) => {
                                          const comparison = priceComparisons[item.id]
                                          const total = getValorTotal(item)
                                          return (
                                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                                              <td className="px-3 py-2 font-medium text-slate-900 text-xs">{item.produto}</td>
                                              <td className="px-3 py-2 text-slate-600 text-xs">{formatCategoryLabel(item.categoria)}</td>
                                              <td className="px-3 py-2 text-right text-slate-600 text-xs">
                                                {formatQuantityDisplay(item.quantidade, item.categoria, item.unidadeMedida)}
                                              </td>
                                              <td className="px-3 py-2 text-right text-slate-900 font-medium text-xs">
                                                {item.valorCaixa && item.valorCaixa > 0
                                                  ? `${toCurrency(item.valorCaixa)} (${getCommercialUnitLabel(item.categoria, item.unidadeMedida)})`
                                                  : '-'}
                                              </td>
                                              <td className="px-3 py-2 text-right text-slate-900 font-medium text-xs">{toCurrency(item.valorUnitario)}</td>
                                              <td className="px-3 py-2 text-right text-slate-600 text-xs">
                                                {comparison.mediaAnterior ? toCurrency(comparison.mediaAnterior) : '-'}
                                              </td>
                                              <td className="px-3 py-2 text-right text-xs">
                                                {comparison.variacaoPercentual !== null ? (
                                                  <span className={`font-semibold ${comparison.variacaoPercentual > 0.5 ? 'text-red-600' : comparison.variacaoPercentual < -0.5 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                    {comparison.variacaoPercentual > 0 ? '+' : ''}{toPercent(comparison.variacaoPercentual)}
                                                  </span>
                                                ) : (
                                                  <span className="text-slate-400 text-xs">-</span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2 text-right text-slate-900 font-medium text-xs">{toCurrency(total)}</td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
          </>
        )}

        {listViewMode === 'fornecedores' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Fornecedores cadastrados</h2>
                <p className="text-xs text-gray-500">Total: {fornecedoresCadastrados.length} fornecedor(es)</p>
              </div>
              <button
                type="button"
                onClick={handleAddSupplier}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-indigo-700"
              >
                Cadastrar fornecedor
              </button>
            </div>

            {fornecedoresCadastrados.length === 0 ? (
              <div className="p-10 text-center text-gray-500">Nenhum fornecedor cadastrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Fornecedor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Telefone</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Produtos</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Criado em</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fornecedoresCadastrados.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-700">{supplier.codigo || '-'}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{supplier.nome}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{supplier.telefone || '-'}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-700">{supplier.produtos.length}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{supplier.criadoEm}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditSupplier(supplier.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              <Pencil size={12} />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSupplier(supplier.id, supplier.nome)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={12} />
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CeasaAnalytics
