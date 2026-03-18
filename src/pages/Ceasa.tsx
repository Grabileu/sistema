import React, { useEffect, useMemo, useRef, useState } from 'react'
import { MoreVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'
import { safeNumber, normalizeDate, parseDateBR, toCurrency, toPercent, buildStoreOptions, focusNext, handleKeyDown } from '../utils/formatters'
import { useClickOutside } from '../hooks/useClickOutside'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

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
  valorTotal?: number
  criadoEm: string
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

interface CeasaProps {
  onNavigate?: (route: string) => void
  businessUnits?: any[]
}

type ComparacaoStatus = 'sem-historico' | 'acima' | 'abaixo' | 'igual'

interface ComparacaoCusto {
  mediaAnterior: number | null
  variacaoPercentual: number | null
  status: ComparacaoStatus
}

type ListViewMode = 'diario' | 'fornecedores'

const getValorTotal = (compra: CeasaCompra) => {
  const total = safeNumber(compra.valorTotal, Number.NaN)
  if (Number.isFinite(total) && total > 0) return total
  return safeNumber(compra.quantidade) * safeNumber(compra.valorUnitario)
}

const buildComparacaoMap = (compras: CeasaCompra[]) => {
  const comparisonById: Record<string, ComparacaoCusto> = {}
  const historyByProduto = new Map<string, number[]>()

  const sortedByDateAsc = [...compras].sort((left, right) => {
    const leftDate = parseDateBR(left.dataCompra)?.getTime() ?? 0
    const rightDate = parseDateBR(right.dataCompra)?.getTime() ?? 0
    return leftDate - rightDate
  })

  sortedByDateAsc.forEach((compra) => {
    const productKey = (compra.produto || '').trim().toLowerCase()
    const history = historyByProduto.get(productKey) || []
    const mediaAnterior = history.length > 0
      ? history.reduce((accumulator, current) => accumulator + current, 0) / history.length
      : null

    let variacaoPercentual: number | null = null
    let status: ComparacaoStatus = 'sem-historico'

    if (mediaAnterior !== null && mediaAnterior > 0) {
      variacaoPercentual = ((compra.valorUnitario - mediaAnterior) / mediaAnterior) * 100
      if (variacaoPercentual > 0.5) {
        status = 'acima'
      } else if (variacaoPercentual < -0.5) {
        status = 'abaixo'
      } else {
        status = 'igual'
      }
    }

    comparisonById[compra.id] = {
      mediaAnterior,
      variacaoPercentual,
      status
    }

    const unitValue = safeNumber(compra.valorUnitario)
    if (unitValue > 0) {
      historyByProduto.set(productKey, [...history, unitValue])
    }
  })

  return comparisonById
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

const Ceasa: React.FC<CeasaProps> = ({ onNavigate, businessUnits = [] }) => {
  const standardFieldClass = 'rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'

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
          valorTotal: safeNumber(item.valorTotal, 0),
          criadoEm: String(item.criadoEm || new Date().toLocaleDateString('pt-BR'))
        }))
      } catch {
        localStorage.removeItem('ceasaCompras')
      }
    }

    const legacy = localStorage.getItem('ceasaRegistros')
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as any[]
        return parsed.map((item) => ({
          id: String(item.id || `ceasa-${Date.now()}-${Math.random()}`),
          dataCompra: normalizeDate(item.data || ''),
          produto: String(item.descricao || 'Item sem produto'),
          categoria: 'Hortifruti',
          fornecedor: String(item.funcionarioNome || '-'),
          loja: '',
          unidadeMedida: 'kg',
          quantidade: 1,
          valorUnitario: 0,
          valorTotal: 0,
          criadoEm: String(item.criadoEm || new Date().toLocaleDateString('pt-BR'))
        }))
      } catch {
        localStorage.removeItem('ceasaRegistros')
      }
    }

    return []
  })

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [openSupplierMenuId, setOpenSupplierMenuId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; produto: string } | null>(null)
  const [pendingSupplierDelete, setPendingSupplierDelete] = useState<{ id: string; nome: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [companyData, setCompanyData] = useState<any>(() => {
    const companyDataStr = localStorage.getItem('companyData')
    if (companyDataStr) {
      try {
        return JSON.parse(companyDataStr)
      } catch {}
    }
    return null
  })
  const [fornecedoresCadastrados, setFornecedoresCadastrados] = useState<CeasaFornecedorCadastro[]>(() => loadCeasaFornecedores())

  const produtoFilterRef = useRef<HTMLInputElement>(null)
  const fornecedorFilterRef = useRef<HTMLInputElement>(null)
  const categoriaRef = useRef<HTMLButtonElement>(null)
  const lojaRef = useRef<HTMLButtonElement>(null)
  const dataInicioRef = useRef<HTMLInputElement>(null)
  const dataFimRef = useRef<HTMLInputElement>(null)
  const pesquisarRef = useRef<HTMLButtonElement>(null)
  const [autoOpenDataFim, setAutoOpenDataFim] = useState(false)

  const [inputProdutoFilter, setInputProdutoFilter] = useState('')
  const [inputFornecedorFilter, setInputFornecedorFilter] = useState('')
  const [inputCategoriaFilter, setInputCategoriaFilter] = useState('')
  const [inputLojaFilter, setInputLojaFilter] = useState('')
  const [inputDataInicio, setInputDataInicio] = useState('')
  const [inputDataFim, setInputDataFim] = useState('')

  const [appliedFilters, setAppliedFilters] = useState({
    produto: '',
    fornecedor: '',
    categoria: '',
    loja: '',
    dataInicio: '',
    dataFim: ''
  })
  const [listViewMode, setListViewMode] = useState<ListViewMode>('diario')

  useEffect(() => {
    localStorage.setItem('ceasaCompras', JSON.stringify(compras))
  }, [compras])

  useClickOutside(menuRef, () => { setOpenMenuId(null); setOpenSupplierMenuId(null) })

  useEffect(() => {
    const handleStorageChange = () => {
      const companyDataStr = localStorage.getItem('companyData')
      if (companyDataStr) {
        try {
          setCompanyData(JSON.parse(companyDataStr))
        } catch {
          setCompanyData(null)
        }
      } else {
        setCompanyData(null)
      }

      setFornecedoresCadastrados(loadCeasaFornecedores())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const categoryOptions = useMemo(() => {
    const values = new Set<string>()
    compras.forEach((item) => {
      if (item.categoria) values.add(item.categoria)
    })

    return [
      { label: 'Todas', value: '' },
      ...Array.from(values).sort((left, right) => left.localeCompare(right, 'pt-BR')).map((categoria) => ({
        label: categoria,
        value: categoria
      }))
    ]
  }, [compras])

  const storeOptions = useMemo(() => buildStoreOptions(businessUnits, companyData), [businessUnits, companyData])

  const comparacaoMap = useMemo(() => buildComparacaoMap(compras), [compras])

  const filteredCompras = useMemo(() => {
    return [...compras]
      .filter((compra) => {
        if (
          appliedFilters.produto.trim() &&
          !compra.produto.toLowerCase().includes(appliedFilters.produto.trim().toLowerCase())
        ) {
          return false
        }

        if (
          appliedFilters.fornecedor.trim() &&
          !compra.fornecedor.toLowerCase().includes(appliedFilters.fornecedor.trim().toLowerCase())
        ) {
          return false
        }

        if (appliedFilters.categoria && compra.categoria !== appliedFilters.categoria) {
          return false
        }

        if (appliedFilters.loja && compra.loja !== appliedFilters.loja) {
          return false
        }

        if (appliedFilters.dataInicio) {
          const compraDate = parseDateBR(compra.dataCompra)
          const inicioDate = parseDateBR(appliedFilters.dataInicio)
          if (compraDate && inicioDate && compraDate < inicioDate) {
            return false
          }
        }

        if (appliedFilters.dataFim) {
          const compraDate = parseDateBR(compra.dataCompra)
          const fimDate = parseDateBR(appliedFilters.dataFim)
          if (compraDate && fimDate && compraDate > fimDate) {
            return false
          }
        }

        return true
      })
      .sort((left, right) => {
        const leftDate = parseDateBR(left.dataCompra)?.getTime() ?? 0
        const rightDate = parseDateBR(right.dataCompra)?.getTime() ?? 0
        return rightDate - leftDate
      })
  }, [appliedFilters, compras])

  const resumo = useMemo(() => {
    const totalGasto = filteredCompras.reduce((accumulator, compra) => accumulator + getValorTotal(compra), 0)
    const ticketMedio = filteredCompras.length > 0 ? totalGasto / filteredCompras.length : 0
    const itensComAlta = filteredCompras.filter((compra) => comparacaoMap[compra.id]?.status === 'acima').length

    return {
      totalGasto,
      ticketMedio,
      itensComAlta
    }
  }, [filteredCompras, comparacaoMap])

  const fornecedoresResumo = useMemo(() => {
    const grouped = new Map<string, {
      fornecedor: string
      cadastroId: string | null
      totalGasto: number
      compras: number
      ultimaCompra: string
      ultimaCompraTimestamp: number
      produtos: Set<string>
    }>()

    filteredCompras.forEach((compra) => {
      const key = (compra.fornecedor || '-').trim() || '-'
      const compraTimestamp = parseDateBR(compra.dataCompra)?.getTime() ?? 0
      const existing = grouped.get(key)

      if (!existing) {
        grouped.set(key, {
          fornecedor: key,
          cadastroId: null,
          totalGasto: getValorTotal(compra),
          compras: 1,
          ultimaCompra: compra.dataCompra || '-',
          ultimaCompraTimestamp: compraTimestamp,
          produtos: new Set([compra.produto || '-'])
        })
        return
      }

      existing.totalGasto += getValorTotal(compra)
      existing.compras += 1
      existing.produtos.add(compra.produto || '-')

      if (compraTimestamp > existing.ultimaCompraTimestamp) {
        existing.ultimaCompraTimestamp = compraTimestamp
        existing.ultimaCompra = compra.dataCompra || '-'
      }
    })

    fornecedoresCadastrados.forEach((fornecedor) => {
      const key = (fornecedor.nome || '-').trim() || '-'
      const existing = grouped.get(key)

      if (!existing) {
        grouped.set(key, {
          fornecedor: key,
          cadastroId: fornecedor.id,
          totalGasto: 0,
          compras: 0,
          ultimaCompra: '-',
          ultimaCompraTimestamp: 0,
          produtos: new Set((fornecedor.produtos || []).map((product) => product.nome || '-'))
        })
        return
      }

      existing.cadastroId = fornecedor.id
      fornecedor.produtos.forEach((product) => {
        existing.produtos.add(product.nome || '-')
      })
    })

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        ticketMedio: item.compras > 0 ? item.totalGasto / item.compras : 0,
        totalProdutos: item.produtos.size
      }))
      .sort((left, right) => {
        if (right.totalGasto !== left.totalGasto) return right.totalGasto - left.totalGasto
        return left.fornecedor.localeCompare(right.fornecedor, 'pt-BR')
      })
  }, [filteredCompras, fornecedoresCadastrados])

  const handlePesquisar = () => {
    setAppliedFilters({
      produto: inputProdutoFilter,
      fornecedor: inputFornecedorFilter,
      categoria: inputCategoriaFilter,
      loja: inputLojaFilter,
      dataInicio: inputDataInicio,
      dataFim: inputDataFim
    })
  }

  const handleDataInicioChange = (value: string) => {
    setInputDataInicio(value)
    if (value && dataFimRef.current) {
      setTimeout(() => {
        dataFimRef.current?.focus()
        setAutoOpenDataFim(true)
        setTimeout(() => setAutoOpenDataFim(false), 100)
      }, 100)
    }
  }

  const handleDelete = (id: string, produto: string) => {
    setPendingDelete({ id, produto })
    setOpenMenuId(null)
  }

  const handleAddSupplier = () => {
    localStorage.removeItem('ceasaFornecedorEdicaoId')
    onNavigate?.('ceasa-cadastro-fornecedor')
  }

  const handleEditSupplier = (supplierId: string) => {
    localStorage.setItem('ceasaFornecedorEdicaoId', supplierId)
    setOpenSupplierMenuId(null)
    onNavigate?.('ceasa-cadastro-fornecedor')
  }

  const handleDeleteSupplier = (supplierId: string, supplierName: string) => {
    setPendingSupplierDelete({ id: supplierId, nome: supplierName })
    setOpenSupplierMenuId(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    setCompras((prev) => prev.filter((registro) => registro.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  const cancelDelete = () => {
    setPendingDelete(null)
  }

  const confirmDeleteSupplier = () => {
    if (!pendingSupplierDelete) return
    const updatedSuppliers = loadCeasaFornecedores().filter((supplier) => supplier.id !== pendingSupplierDelete.id)
    localStorage.setItem('ceasaFornecedores', JSON.stringify(updatedSuppliers))
    setFornecedoresCadastrados(updatedSuppliers)
    setPendingSupplierDelete(null)
  }

  const cancelDeleteSupplier = () => {
    setPendingSupplierDelete(null)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {pendingDelete && (
        <DeleteConfirmModal
          title="Excluir compra da Ceasa"
          description="Tem certeza que deseja excluir a compra do produto abaixo?"
          itemName={pendingDelete.produto}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {pendingSupplierDelete && (
        <DeleteConfirmModal
          title="Excluir fornecedor"
          description="Tem certeza que deseja excluir o fornecedor abaixo?"
          itemName={pendingSupplierDelete.nome}
          onConfirm={confirmDeleteSupplier}
          onCancel={cancelDeleteSupplier}
        />
      )}

      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Compras Ceasa</h1>
            <p className="text-sm text-gray-500">Controle de produtos, custos, quantidades e comparacao de preco</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate?.('ceasa-adicionar-compra')}
            className="w-fit bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 justify-center"
          >
            <Plus size={18} />
            Registrar compra
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Total gasto no periodo</p>
            <p className="mt-1 text-xl font-semibold text-indigo-900">{toCurrency(resumo.totalGasto)}</p>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Ticket medio por compra</p>
            <p className="mt-1 text-xl font-semibold text-amber-900">{toCurrency(resumo.ticketMedio)}</p>
          </div>

          <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Itens com alta de custo</p>
            <p className="mt-1 text-xl font-semibold text-rose-900">{resumo.itensComAlta}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-4 relative">
            <div>
              <label className="block text-gray-700 text-sm mb-2">Produto</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={produtoFilterRef}
                  type="text"
                  placeholder="Pesquisar produto"
                  value={inputProdutoFilter}
                  onChange={(event) => setInputProdutoFilter(event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, fornecedorFilterRef)}
                  className="w-full bg-gray-100 border border-gray-200 rounded-md pl-3 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">Fornecedor</label>
              <input
                ref={fornecedorFilterRef}
                type="text"
                placeholder="Pesquisar fornecedor"
                value={inputFornecedorFilter}
                onChange={(event) => setInputFornecedorFilter(event.target.value)}
                onKeyDown={(event) => handleKeyDown(event, categoriaRef)}
                className="w-full bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">Categoria</label>
              <Select
                value={inputCategoriaFilter}
                onChange={(value) => setInputCategoriaFilter(String(value))}
                options={categoryOptions}
                buttonClassName={standardFieldClass}
                buttonRef={categoriaRef}
                nextRef={lojaRef}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">Loja</label>
              <Select
                value={inputLojaFilter}
                onChange={(value) => setInputLojaFilter(String(value))}
                options={storeOptions}
                buttonClassName={standardFieldClass}
                buttonRef={lojaRef}
                nextRef={dataInicioRef}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">Data inicio</label>
              <DatePicker
                ref={dataInicioRef}
                value={inputDataInicio}
                onChange={handleDataInicioChange}
                placeholder="Selecionar data"
                className={standardFieldClass}
                nextRef={dataFimRef}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">Data fim</label>
              <DatePicker
                ref={dataFimRef}
                value={inputDataFim}
                onChange={setInputDataFim}
                placeholder="Selecionar data"
                autoOpen={autoOpenDataFim}
                className={standardFieldClass}
                nextRef={pesquisarRef}
              />
            </div>

            <div className="flex items-end">
              <button
                ref={pesquisarRef}
                onClick={handlePesquisar}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
              >
                Pesquisar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-4 bg-gray-50 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 w-fit">
              <button
                onClick={() => setListViewMode('diario')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  listViewMode === 'diario'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Compras
              </button>
              <button
                onClick={() => setListViewMode('fornecedores')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  listViewMode === 'fornecedores'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Fornecedores
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 text-right">
                {listViewMode === 'diario'
                  ? `Pagina 1/1 - Exibindo ${filteredCompras.length} de ${filteredCompras.length} registros`
                  : `Exibindo ${fornecedoresResumo.length} fornecedor(es)`}
              </div>

              {listViewMode === 'fornecedores' && (
                <button
                  type="button"
                  onClick={handleAddSupplier}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
                  title="Cadastrar novo fornecedor"
                >
                  Adicionar fornecedor
                </button>
              )}
            </div>
          </div>

          {listViewMode === 'fornecedores' ? (
            fornecedoresResumo.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg mb-2">Nenhum fornecedor cadastrado</p>
                <p className="text-sm text-gray-500">Cadastre fornecedores para visualizar esta lista.</p>
              </div>
            ) : (
            <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fornecedor</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Compras</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Produtos</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Ticket medio</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Total gasto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ultima compra</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {fornecedoresResumo.map((fornecedor) => {
                    const supplierRowId = fornecedor.cadastroId || fornecedor.fornecedor
                    const canManageSupplier = Boolean(fornecedor.cadastroId)

                    return (
                      <tr key={fornecedor.fornecedor} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fornecedor.fornecedor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{fornecedor.compras}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{fornecedor.totalProdutos}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{toCurrency(fornecedor.ticketMedio)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{toCurrency(fornecedor.totalGasto)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{fornecedor.ultimaCompra}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {canManageSupplier ? (
                            <div className="relative inline-block" ref={openSupplierMenuId === supplierRowId ? menuRef : null}>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null)
                                  setOpenSupplierMenuId(openSupplierMenuId === supplierRowId ? null : supplierRowId)
                                }}
                                className="p-2 hover:bg-gray-100 rounded"
                                aria-label="Ações do fornecedor"
                              >
                                <MoreVertical size={16} className="text-gray-400" />
                              </button>

                              {openSupplierMenuId === supplierRowId && (
                                <div
                                  className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-xl border border-gray-200 py-1"
                                  style={{ zIndex: 9999 }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => fornecedor.cadastroId && handleEditSupplier(fornecedor.cadastroId)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <Pencil size={16} />
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => fornecedor.cadastroId && handleDeleteSupplier(fornecedor.cadastroId, fornecedor.fornecedor)}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            )
          ) : filteredCompras.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg mb-2">Nenhuma compra da Ceasa encontrada</p>
              <p className="text-sm text-gray-500">
                A pagina inicial esta pronta para controle de custos. O cadastro de compra sera adicionado em seguida.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fornecedor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Loja</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Valor unitario</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Valor total</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Custo medio anterior</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Variacao</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acoes</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompras.map((compra) => {
                      const comparacao = comparacaoMap[compra.id]
                      const valorTotal = getValorTotal(compra)

                      return (
                        <tr key={compra.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{compra.dataCompra || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{compra.produto || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{compra.categoria || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{compra.fornecedor || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{compra.loja || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                            {safeNumber(compra.quantidade).toFixed(2)} {compra.unidadeMedida || 'un'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{toCurrency(compra.valorUnitario)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{toCurrency(valorTotal)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                            {comparacao?.mediaAnterior !== null && comparacao?.mediaAnterior !== undefined
                              ? toCurrency(comparacao.mediaAnterior)
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            {comparacao?.variacaoPercentual === null || comparacao?.variacaoPercentual === undefined ? (
                              <span className="text-gray-500">Sem historico</span>
                            ) : (
                              <span
                                className={`font-semibold ${
                                  comparacao.variacaoPercentual > 0
                                    ? 'text-red-600'
                                    : comparacao.variacaoPercentual < 0
                                      ? 'text-emerald-600'
                                      : 'text-gray-600'
                                }`}
                              >
                                {comparacao.variacaoPercentual > 0 ? '+' : ''}
                                {toPercent(comparacao.variacaoPercentual)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === compra.id ? null : compra.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openMenuId === compra.id && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                              >
                                <button
                                  onClick={() => handleDelete(compra.id, compra.produto)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 size={16} />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Ceasa
