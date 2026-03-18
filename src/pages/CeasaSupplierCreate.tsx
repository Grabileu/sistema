import React, { useEffect, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { formatPhone, focusNext, handleKeyDown } from '../utils/formatters'
import Select from '../components/Select'

interface CeasaSupplierCreateProps {
  onNavigate?: (route: string) => void
}

type SupplierProductCategory = 'fruta' | 'verdura' | 'legume' | 'outros'
type SupplierProductUnit = 'cx' | 'fd' | 'unid' | 'kg'

interface SupplierProduct {
  id: string
  nome: string
  categoria: SupplierProductCategory
  unidadeMedida: SupplierProductUnit
  quantidadeFixaKg: number | null
  temCustoKgDefinido: boolean
}

interface StoredSupplier {
  id: string
  codigo: string
  nome: string
  telefone: string
  observacao: string
  produtos: SupplierProduct[]
  criadoEm: string
}

const categoryLabels: Record<SupplierProductCategory, string> = {
  fruta: 'Fruta',
  verdura: 'Verdura',
  legume: 'Legume',
  outros: 'Outros'
}

const supplierProductCategoryOptions = [
  { label: 'Fruta', value: 'fruta' },
  { label: 'Verdura', value: 'verdura' },
  { label: 'Legume', value: 'legume' },
  { label: 'Outros', value: 'outros' }
]

const unitLabels: Record<SupplierProductUnit, string> = {
  cx: 'CX',
  fd: 'FD',
  unid: 'Unid',
  kg: 'KG'
}

const supplierProductUnitOptions = [
  { label: 'Caixa (CX)', value: 'cx' },
  { label: 'Fardo (FD)', value: 'fd' },
  { label: 'Unidade (Unid)', value: 'unid' },
  { label: 'Quilo (KG)', value: 'kg' }
]

const parseStoredSuppliers = (): StoredSupplier[] => {
  const raw = localStorage.getItem('ceasaFornecedores')
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as any[]
    if (!Array.isArray(parsed)) return []

    return parsed.map((item) => {
      const rawProducts = Array.isArray(item.produtos) ? item.produtos : []
      const products: SupplierProduct[] = rawProducts
        .map((product: any) => {
          const categoryValue = String(product?.categoria || '').toLowerCase()
          const unitValue = String(product?.unidadeMedida || '').toLowerCase()
          const normalizedCategory: SupplierProductCategory =
            categoryValue === 'fruta' || categoryValue === 'verdura' || categoryValue === 'legume' || categoryValue === 'outros'
              ? (categoryValue as SupplierProductCategory)
              : 'outros'
          const normalizedUnit: SupplierProductUnit =
            unitValue === 'cx' || unitValue === 'fd' || unitValue === 'unid' || unitValue === 'kg'
              ? (unitValue as SupplierProductUnit)
              : 'unid'
          const fixedValue = Number(product?.quantidadeFixaKg)

          return {
            id: String(product?.id || `produto-${Date.now()}-${Math.random()}`),
            nome: String(product?.nome || '').trim(),
            categoria: normalizedCategory,
            unidadeMedida: normalizedUnit,
            quantidadeFixaKg: Number.isFinite(fixedValue) && fixedValue > 0 ? fixedValue : null,
            temCustoKgDefinido: Boolean(product?.temCustoKgDefinido)
          }
        })
        .filter((product) => product.nome)

      return {
        id: String(item?.id || `fornecedor-${Date.now()}-${Math.random()}`),
        codigo: String(item?.codigo || ''),
        nome: String(item?.nome || '').trim(),
        telefone: String(item?.telefone || ''),
        observacao: String(item?.observacao || ''),
        produtos: products,
        criadoEm: String(item?.criadoEm || new Date().toLocaleDateString('pt-BR'))
      }
    }).filter((supplier) => supplier.nome)
  } catch {
    localStorage.removeItem('ceasaFornecedores')
  }

  return []
}

const getNextSupplierCode = (suppliers: StoredSupplier[]) => {
  const highest = suppliers.reduce((maxValue, supplier) => {
    const numericCode = Number.parseInt(String(supplier.codigo || '').trim(), 10)
    if (Number.isNaN(numericCode)) return maxValue
    return Math.max(maxValue, numericCode)
  }, 0)

  return String(highest + 1).padStart(2, '0')
}

const CeasaSupplierCreate: React.FC<CeasaSupplierCreateProps> = ({ onNavigate }) => {
  const standardFieldClass = 'rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const nomeRef = useRef<HTMLInputElement>(null)
  const telefoneRef = useRef<HTMLInputElement>(null)
  const observacaoRef = useRef<HTMLTextAreaElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const produtoRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    codigo: '01',
    nome: '',
    telefone: '',
    observacao: ''
  })
  const [errors, setErrors] = useState({
    nome: false
  })

  const [produtoInput, setProdutoInput] = useState('')
  const [produtoCategoriaInput, setProdutoCategoriaInput] = useState<SupplierProductCategory>('fruta')
  const [produtoUnidadeInput, setProdutoUnidadeInput] = useState<SupplierProductUnit>('cx')
  const [produtoQuantidadeFixaInput, setProdutoQuantidadeFixaInput] = useState('')
  const [produtoTemCustoKgDefinido, setProdutoTemCustoKgDefinido] = useState(false)
  const [productFormError, setProductFormError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [produtos, setProdutos] = useState<SupplierProduct[]>([])
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null)

  const isEditingSupplier = Boolean(editingSupplierId)

  const isHortifrutiCategory =
    produtoCategoriaInput === 'fruta' ||
    produtoCategoriaInput === 'verdura' ||
    produtoCategoriaInput === 'legume'

  const showCostDefinedQuestion = produtoCategoriaInput !== 'outros'

  useEffect(() => {
    const storedSuppliers = parseStoredSuppliers()
    const editingSupplierStoredId = localStorage.getItem('ceasaFornecedorEdicaoId')

    if (editingSupplierStoredId) {
      const supplierToEdit = storedSuppliers.find((supplier) => supplier.id === editingSupplierStoredId)

      if (supplierToEdit) {
        setEditingSupplierId(supplierToEdit.id)
        setFormData({
          codigo: supplierToEdit.codigo,
          nome: supplierToEdit.nome,
          telefone: supplierToEdit.telefone,
          observacao: supplierToEdit.observacao
        })
        setProdutos(supplierToEdit.produtos)
        return
      }

      localStorage.removeItem('ceasaFornecedorEdicaoId')
    }

    setFormData((prev) => ({ ...prev, codigo: getNextSupplierCode(storedSuppliers) }))
  }, [])

  useEffect(() => {
    return () => {
      localStorage.removeItem('ceasaFornecedorEdicaoId')
    }
  }, [])

  const canAccessStep2 = Boolean(formData.nome.trim())

  const handleNext = () => {
    if (!formData.nome.trim()) {
      setErrors({ nome: true })
      return
    }

    setErrors({ nome: false })
    setSaveError('')
    setCurrentStep(2)
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(event.target.value)
    setFormData((prev) => ({ ...prev, telefone: formatted }))
  }

  const handleAddProduct = () => {
    const normalized = produtoInput.trim()
    if (!normalized) {
      setProductFormError('Informe o nome do produto.')
      return
    }

    let quantidadeFixaKg: number | null = null
    let unidadeMedida: SupplierProductUnit = produtoUnidadeInput

    if (isHortifrutiCategory && !produtoTemCustoKgDefinido) {
      const numericText = produtoQuantidadeFixaInput.replace(',', '.').trim()
      const parsedValue = Number(numericText)

      if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        setProductFormError('Informe a quantidade fixa em KG para este produto.')
        return
      }

      quantidadeFixaKg = parsedValue
      unidadeMedida = 'kg'
    } else if (isHortifrutiCategory) {
      quantidadeFixaKg = null
      unidadeMedida = 'kg'
    }

    const custoKgDefinidoValue = produtoCategoriaInput === 'outros'
      ? false
      : produtoTemCustoKgDefinido

    if (
      produtos.some(
        (product) =>
          product.nome.toLowerCase() === normalized.toLowerCase() &&
          product.categoria === produtoCategoriaInput &&
          product.unidadeMedida === unidadeMedida &&
          product.quantidadeFixaKg === quantidadeFixaKg &&
          product.temCustoKgDefinido === custoKgDefinidoValue
      )
    ) {
      setProdutoInput('')
      setProductFormError('Este produto já foi adicionado com os mesmos dados.')
      return
    }

    const nextProduct: SupplierProduct = {
      id: `produto-${Date.now()}-${Math.random()}`,
      nome: normalized,
      categoria: produtoCategoriaInput,
      unidadeMedida,
      quantidadeFixaKg,
      temCustoKgDefinido: custoKgDefinidoValue
    }

    setProdutos((prev) => [...prev, nextProduct])
    setProdutoInput('')
    setProdutoQuantidadeFixaInput('')
    setProductFormError('')
    setSaveError('')
    focusNext(produtoRef.current)
  }

  const handleRemoveProduct = (productId: string) => {
    setProdutos((prev) => prev.filter((product) => product.id !== productId))
  }

  const handleCancelSupplierForm = () => {
    localStorage.removeItem('ceasaFornecedorEdicaoId')
    onNavigate?.('ceasa')
  }

  const handleSaveSupplier = () => {
    const supplierName = formData.nome.trim()
    if (!supplierName) {
      setErrors({ nome: true })
      setCurrentStep(1)
      return
    }

    if (produtos.length === 0) {
      setSaveError('Adicione pelo menos um produto para salvar o fornecedor.')
      return
    }

    const storedSuppliers = parseStoredSuppliers()
    const existingByCodeIndex = storedSuppliers.findIndex((supplier) => {
      if (editingSupplierId) return supplier.id === editingSupplierId
      return supplier.codigo === formData.codigo
    })
    const nextSupplier: StoredSupplier = {
      id: existingByCodeIndex >= 0
        ? storedSuppliers[existingByCodeIndex].id
        : `fornecedor-${Date.now()}-${Math.random()}`,
      codigo: formData.codigo,
      nome: supplierName,
      telefone: formData.telefone,
      observacao: formData.observacao,
      produtos,
      criadoEm: existingByCodeIndex >= 0
        ? storedSuppliers[existingByCodeIndex].criadoEm
        : new Date().toLocaleDateString('pt-BR')
    }

    const updatedSuppliers = [...storedSuppliers]
    if (existingByCodeIndex >= 0) {
      updatedSuppliers[existingByCodeIndex] = nextSupplier
    } else {
      updatedSuppliers.push(nextSupplier)
    }

    localStorage.setItem('ceasaFornecedores', JSON.stringify(updatedSuppliers))
    localStorage.removeItem('ceasaFornecedorEdicaoId')
    onNavigate?.('ceasa')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditingSupplier ? 'Edição de fornecedor Ceasa' : 'Cadastro de fornecedor Ceasa'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg">
          <div className="border-b px-6">
            <div className="flex items-center gap-3 py-4">
              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg focus:outline-none transition ${
                  currentStep === 1
                    ? 'bg-white border border-gray-200 cursor-default'
                    : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
                }`}
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(1)}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep === 1 ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-700'
                }`}>1</span>
                <span className="text-sm font-medium text-gray-800">Fornecedor</span>
              </button>

              <button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg focus:outline-none transition ${
                  currentStep === 2
                    ? 'bg-white border border-gray-200 cursor-default'
                    : canAccessStep2
                      ? 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
                      : 'bg-gray-100 cursor-not-allowed opacity-60'
                }`}
                disabled={currentStep === 2 || !canAccessStep2}
                onClick={() => {
                  if (canAccessStep2) setCurrentStep(2)
                }}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep === 2 ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-700'
                }`}>2</span>
                <span className="text-sm font-medium text-gray-800">Produtos</span>
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {currentStep === 1 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900">1. Dados do fornecedor</h2>
                <p className="text-sm text-gray-500 mt-1">Preencha os dados básicos para liberar a etapa de produtos.</p>

                <div className="border-t mt-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Código do fornecedor</label>
                      <input
                        type="text"
                        value={formData.codigo}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 bg-gray-200 border border-gray-200 rounded-md text-sm text-gray-700 cursor-not-allowed opacity-70"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Nome do fornecedor <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={nomeRef}
                        type="text"
                        placeholder="Digite"
                        value={formData.nome}
                        onChange={(event) => {
                          setFormData((prev) => ({ ...prev, nome: event.target.value }))
                          if (errors.nome) setErrors({ nome: false })
                        }}
                        onKeyDown={(event) => handleKeyDown(event, telefoneRef)}
                        className={`w-full px-3 py-2 bg-gray-100 border rounded-md text-sm text-gray-900 placeholder-gray-500 ${
                          errors.nome ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200'
                        }`}
                      />
                      {errors.nome && <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Telefone</label>
                      <input
                        ref={telefoneRef}
                        type="text"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={handlePhoneChange}
                        onKeyDown={(event) => handleKeyDown(event, observacaoRef)}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-gray-700 text-sm mb-2">Observação</label>
                      <textarea
                        ref={observacaoRef}
                        placeholder="Digite"
                        value={formData.observacao}
                        onChange={(event) => setFormData((prev) => ({ ...prev, observacao: event.target.value }))}
                        onKeyDown={(event) => handleKeyDown(event, nextButtonRef)}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancelSupplierForm}
                    className="bg-white border border-gray-300 text-gray-700 px-8 py-2 rounded font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    ref={nextButtonRef}
                    type="button"
                    onClick={handleNext}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded font-medium"
                  >
                    Próximo
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-lg font-semibold text-gray-900">2. Produtos do fornecedor</h2>
                <p className="text-sm text-gray-500 mt-1">Fornecedor: {formData.nome || '-'}</p>

                <div className="border-t mt-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px_auto] gap-3 items-end">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Produto</label>
                      <input
                        ref={produtoRef}
                        type="text"
                        placeholder="Digite o nome do produto"
                        value={produtoInput}
                        onChange={(event) => setProdutoInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            handleAddProduct()
                          }
                        }}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">Categoria</label>
                      <Select
                        value={produtoCategoriaInput}
                        onChange={(value) => {
                          const nextCategory = String(value) as SupplierProductCategory
                          setProdutoCategoriaInput(nextCategory)
                          if (nextCategory === 'outros') {
                            setProdutoTemCustoKgDefinido(false)
                          }
                          setProductFormError('')
                        }}
                        options={supplierProductCategoryOptions}
                        buttonClassName={standardFieldClass}
                      />
                    </div>

                    {isHortifrutiCategory && !produtoTemCustoKgDefinido ? (
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Quantidade fixa (KG)</label>
                        <input
                          type="text"
                          placeholder="Ex: 25"
                          value={produtoQuantidadeFixaInput}
                          onChange={(event) => {
                            setProdutoQuantidadeFixaInput(event.target.value)
                            setProductFormError('')
                          }}
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    ) : isHortifrutiCategory ? (
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Unidade de medida</label>
                        <input
                          type="text"
                          value="KG"
                          disabled
                          className="w-full px-3 py-2 bg-gray-200 border border-gray-200 rounded-md text-sm text-gray-700 cursor-not-allowed opacity-70"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Unidade de medida</label>
                        <Select
                          value={produtoUnidadeInput}
                          onChange={(value) => setProdutoUnidadeInput(String(value) as SupplierProductUnit)}
                          options={supplierProductUnitOptions}
                          buttonClassName={standardFieldClass}
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="h-[38px] px-4 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 inline-flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Adicionar
                    </button>
                  </div>

                  {showCostDefinedQuestion && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <label className="block text-gray-700 text-sm mb-2 font-medium">
                        Este produto ja vem com o custo definido?
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="custoDefinido"
                            checked={!produtoTemCustoKgDefinido}
                            onChange={() => setProdutoTemCustoKgDefinido(false)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Nao</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="custoDefinido"
                            checked={produtoTemCustoKgDefinido}
                            onChange={() => {
                              setProdutoTemCustoKgDefinido(true)
                              setProdutoQuantidadeFixaInput('')
                              setProductFormError('')
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Sim</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {productFormError && (
                    <p className="mt-2 text-xs text-red-500">{productFormError}</p>
                  )}

                  <div className="mt-5 rounded-lg border border-gray-200 overflow-hidden bg-white">
                    {produtos.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-gray-500 text-lg mb-2">Nenhum produto adicionado</p>
                        <p className="text-sm text-gray-500">Cadastre os produtos deste fornecedor para continuar.</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-gray-50 border-b text-right text-sm text-gray-600">
                          Página 1/1 - Exibindo {produtos.length} de {produtos.length} registros
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[760px]">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Produto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Categoria
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Qtd fixa (KG)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Unidade de medida
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                  Ações
                                </th>
                              </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                              {produtos.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    {product.nome}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {categoryLabels[product.categoria]}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {product.quantidadeFixaKg !== null
                                      ? product.quantidadeFixaKg.toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                      })
                                      : '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {unitLabels[product.unidadeMedida]}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProduct(product.id)}
                                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 size={14} />
                                      Remover
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="bg-white border border-gray-300 text-gray-700 px-8 py-2 rounded font-medium hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSupplier}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded font-medium"
                  >
                    {isEditingSupplier ? 'Salvar alterações' : 'Salvar fornecedor'}
                  </button>
                </div>

                {saveError && (
                  <p className="mt-3 text-right text-xs text-red-500">{saveError}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CeasaSupplierCreate
