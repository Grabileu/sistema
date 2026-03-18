import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'
import { toCurrency, buildStoreOptions, focusNext, handleKeyDown } from '../utils/formatters'

interface CeasaPurchaseCreateProps {
  onNavigate?: (route: string) => void
  businessUnits?: any[]
}

interface StoredSupplier {
  id: string
  nome: string
  produtos: SupplierProduct[]
}

interface SupplierProduct {
  id: string
  nome: string
  categoria: string
  unidadeMedida: string
  quantidadeFixaKg: number | null
  temCustoKgDefinido?: boolean
}

interface PurchaseProductItem {
  id: string
  produtoId: string
  produtoNome: string
  categoria: string
  unidadeMedida: string
  quantidadeFixaKg: number | null
  temCustoKgDefinido?: boolean
  quantidadeComprada: number
  valorCaixa: number
  valorCusto: number
  valorTotal: number
  totalKg: number
}

interface StoredPurchaseRecord {
  id: string
  dataCompra?: string
  produto?: string
  categoria?: string
  fornecedor?: string
  loja?: string
  unidadeMedida?: string
  quantidade?: number | string
  valorUnitario?: number | string
  valorTotal?: number | string
  valorCaixa?: number | string
  temCustoKgDefinido?: boolean
  observacao?: string
  quantidadeFixaKg?: number | string | null
}

const CEASA_EDIT_IDS_KEY = 'ceasaCompraEdicaoIds'

const getCurrentDateBR = () => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}

const loadSuppliers = (): StoredSupplier[] => {
  const raw = localStorage.getItem('ceasaFornecedores')
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as any[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => ({
        id: String(item?.id || ''),
        nome: String(item?.nome || '').trim(),
        produtos: Array.isArray(item?.produtos)
          ? item.produtos
            .map((product: any) => {
              const fixedQuantity = Number(product?.quantidadeFixaKg)
              const category = String(product?.categoria || 'Hortifruti')
              const normalizedCategory = category.trim().toLowerCase()
              const isOtherCategory = normalizedCategory === 'outros' || normalizedCategory === 'outro'

              return {
                id: String(product?.id || `produto-${Date.now()}-${Math.random()}`),
                nome: String(product?.nome || '').trim(),
                categoria: category,
                unidadeMedida: String(product?.unidadeMedida || 'cx').trim().toLowerCase(),
                quantidadeFixaKg: Number.isFinite(fixedQuantity) && fixedQuantity > 0 ? fixedQuantity : null,
                temCustoKgDefinido: isOtherCategory ? false : Boolean(product?.temCustoKgDefinido)
              }
            })
            .filter((product: SupplierProduct) => Boolean(product.nome))
          : []
      }))
      .filter((supplier) => supplier.id && supplier.nome)
  } catch {
    return []
  }
}

const loadStoredPurchases = () => {
  const raw = localStorage.getItem('ceasaCompras')
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as any[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const parseNumber = (value: string) => {
  const normalized = value.replace(',', '.').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseUnknownNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()
    const parsed = Number(normalized)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

const parseEditIds = () => {
  const raw = localStorage.getItem(CEASA_EDIT_IDS_KEY)
  if (!raw) return [] as string[]

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => String(item)).filter(Boolean)
  } catch {
    localStorage.removeItem(CEASA_EDIT_IDS_KEY)
    return []
  }
}

const maskCurrencyInput = (value: string) => {
  const digitsOnly = String(value || '').replace(/\D/g, '')
  if (!digitsOnly) return ''

  const padded = digitsOnly.padStart(3, '0')
  const integerPart = padded.slice(0, -2).replace(/^0+(?=\d)/, '') || '0'
  const decimalPart = padded.slice(-2)

  return `${integerPart},${decimalPart}`
}

const normalizeCategory = (value: string) => String(value || '').trim().toLowerCase()

const isOtherCategory = (category: string) => {
  const normalized = normalizeCategory(category)
  return normalized === 'outro' || normalized === 'outros'
}

const isFixedKgCategory = (category: string) => {
  const normalized = normalizeCategory(category)
  return ['hortifruti', 'fruta', 'frutas', 'verdura', 'verduras', 'legume', 'legumes'].includes(normalized)
}

const getUnitMeta = (unit: string | null | undefined) => {
  const normalized = String(unit || '').trim().toLowerCase()

  if (normalized === 'fd') {
    return {
      shortLabel: 'FD',
      valueInputLabel: 'Valor do Fardo'
    }
  }

  if (normalized === 'unid') {
    return {
      shortLabel: 'Unid',
      valueInputLabel: 'Valor da Unidade'
    }
  }

  if (normalized === 'kg') {
    return {
      shortLabel: 'KG',
      valueInputLabel: 'Valor do KG'
    }
  }

  return {
    shortLabel: 'CX',
    valueInputLabel: 'Valor da Caixa'
  }
}

const formatQuantityDisplay = (quantity: number, category: string, unidadeMedida: string) => {
  const compact = quantity.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  })

  if (isOtherCategory(category)) {
    return `${compact}${getUnitMeta(unidadeMedida).shortLabel}`
  }

  if (isFixedKgCategory(category)) {
    return `${compact}CX`
  }

  return quantity.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatFixedKg = (value: number | null) => {
  if (value === null) return '-'
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KG`
}

const formatFixedKgInput = (value: number | null) => {
  if (value === null) return '-'
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const CeasaPurchaseCreate: React.FC<CeasaPurchaseCreateProps> = ({ onNavigate, businessUnits = [] }) => {
  const standardFieldClass = 'rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'
  const fornecedorRef = useRef<HTMLButtonElement>(null)
  const lojaRef = useRef<HTMLButtonElement>(null)
  const observacaoRef = useRef<HTMLTextAreaElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [suppliers, setSuppliers] = useState<StoredSupplier[]>(() => loadSuppliers())
  const [companyData, setCompanyData] = useState<any>(() => {
    const companyDataStr = localStorage.getItem('companyData')
    if (companyDataStr) {
      try {
        return JSON.parse(companyDataStr)
      } catch {
        return null
      }
    }
    return null
  })

  const [formData, setFormData] = useState({
    dataCompra: getCurrentDateBR(),
    fornecedorId: '',
    loja: '',
    observacao: ''
  })

  const [errors, setErrors] = useState({
    dataCompra: false,
    fornecedorId: false,
    loja: false
  })
  const [productForm, setProductForm] = useState({
    produtoId: '',
    quantidadeComprada: '',
    valorCaixa: '',
    valorCusto: ''
  })
  const [productFormError, setProductFormError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [purchaseItems, setPurchaseItems] = useState<PurchaseProductItem[]>([])
  const [editingPurchaseIds, setEditingPurchaseIds] = useState<string[]>(() => parseEditIds())
  const hasInitializedEditRef = useRef(false)

  const isEditingPurchase = editingPurchaseIds.length > 0

  const clearEditContext = () => {
    localStorage.removeItem(CEASA_EDIT_IDS_KEY)
    setEditingPurchaseIds([])
  }

  const canAccessStep2 = Boolean(formData.dataCompra.trim() && formData.fornecedorId && formData.loja)

  useEffect(() => {
    const handleStorageChange = () => {
      setSuppliers(loadSuppliers())

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
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const supplierOptions = useMemo(() => {
    return [
      { label: 'Selecione', value: '' },
      ...suppliers
        .slice()
        .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
        .map((supplier) => ({ label: supplier.nome, value: supplier.id }))
    ]
  }, [suppliers])

  const storeOptions = useMemo(() => buildStoreOptions(businessUnits, companyData, 'Selecione'), [businessUnits, companyData])

  const selectedSupplierName = useMemo(() => {
    const selected = suppliers.find((supplier) => supplier.id === formData.fornecedorId)
    return selected?.nome || '-'
  }, [formData.fornecedorId, suppliers])

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === formData.fornecedorId) || null,
    [formData.fornecedorId, suppliers]
  )

  useEffect(() => {
    if (!isEditingPurchase || hasInitializedEditRef.current || suppliers.length === 0) return

    const existingPurchases = loadStoredPurchases() as StoredPurchaseRecord[]
    const idsSet = new Set(editingPurchaseIds)
    const purchasesToEdit = existingPurchases.filter((item) => idsSet.has(String(item?.id || '')))

    if (purchasesToEdit.length === 0) {
      clearEditContext()
      return
    }

    const firstPurchase = purchasesToEdit[0]
    const supplierName = String(firstPurchase.fornecedor || '').trim()
    const matchedSupplier = suppliers.find(
      (supplier) => supplier.nome.trim().toLowerCase() === supplierName.toLowerCase()
    ) || null

    const supplierId = matchedSupplier?.id || ''

    const mappedItems: PurchaseProductItem[] = purchasesToEdit.map((item, index) => {
      const produtoNome = String(item.produto || 'Item sem produto').trim()
      const supplierProduct = matchedSupplier?.produtos.find(
        (product) => product.nome.trim().toLowerCase() === produtoNome.toLowerCase()
      )

      const unidadeMedida = String(item.unidadeMedida || supplierProduct?.unidadeMedida || 'cx').trim().toLowerCase()
      const categoria = String(item.categoria || supplierProduct?.categoria || 'Hortifruti')
      const quantidadeFixaRaw = item.quantidadeFixaKg ?? supplierProduct?.quantidadeFixaKg ?? null
      const quantidadeFixaValue = parseUnknownNumber(quantidadeFixaRaw, 0)
      const quantidadeFixaKg = quantidadeFixaValue > 0 ? quantidadeFixaValue : null
      const quantidadeComprada = parseUnknownNumber(item.quantidade, 1)
      const valorCaixa = parseUnknownNumber(item.valorCaixa, 0)
      const valorCusto = parseUnknownNumber(item.valorUnitario, 0)
      const valorBaseTotal = valorCaixa > 0 ? valorCaixa : valorCusto
      const valorTotalStored = parseUnknownNumber(item.valorTotal, 0)
      const temCustoKgDefinido = Boolean(item.temCustoKgDefinido ?? supplierProduct?.temCustoKgDefinido)

      return {
        id: `edit-item-${item.id || index}`,
        produtoId: supplierProduct?.id || `edit-produto-${index}`,
        produtoNome,
        categoria,
        unidadeMedida,
        quantidadeFixaKg,
        temCustoKgDefinido,
        quantidadeComprada,
        valorCaixa,
        valorCusto,
        valorTotal: valorTotalStored > 0 ? valorTotalStored : quantidadeComprada * valorBaseTotal,
        totalKg: temCustoKgDefinido
          ? quantidadeComprada
          : (quantidadeFixaKg && quantidadeFixaKg > 0 ? quantidadeComprada * quantidadeFixaKg : 0)
      }
    })

    setFormData({
      dataCompra: String(firstPurchase.dataCompra || getCurrentDateBR()),
      fornecedorId: supplierId,
      loja: String(firstPurchase.loja || ''),
      observacao: String(firstPurchase.observacao || '')
    })
    setPurchaseItems(mappedItems)
    setCurrentStep(2)
    setProductForm({ produtoId: '', quantidadeComprada: '', valorCaixa: '', valorCusto: '' })
    setProductFormError('')
    setSaveError('')
    hasInitializedEditRef.current = true
  }, [isEditingPurchase, editingPurchaseIds, suppliers])

  const productOptions = useMemo(() => {
    if (!selectedSupplier) return [{ label: 'Selecione', value: '' }]

    return [
      { label: 'Selecione', value: '' },
      ...selectedSupplier.produtos
        .slice()
        .sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'))
        .map((product) => ({
          label: product.nome,
          value: product.id
        }))
    ]
  }, [selectedSupplier])

  const selectedProduct = useMemo(() => {
    if (!selectedSupplier || !productForm.produtoId) return null
    return selectedSupplier.produtos.find((product) => product.id === productForm.produtoId) || null
  }, [selectedSupplier, productForm.produtoId])

  const selectedProductHasFixedKg = useMemo(() => {
    if (!selectedProduct || selectedProduct.temCustoKgDefinido) return false
    return isFixedKgCategory(selectedProduct.categoria)
  }, [selectedProduct])

  const shouldAutoCalculateCost = selectedProductHasFixedKg

  const selectedUnitMeta = useMemo(
    () => getUnitMeta(selectedProduct?.unidadeMedida),
    [selectedProduct?.unidadeMedida]
  )

  const quantityInputUnitLabel = selectedProductHasFixedKg ? 'CX' : selectedUnitMeta.shortLabel

  const valueInputLabel = selectedProduct?.temCustoKgDefinido
    ? 'Valor do custo'
    : selectedProductHasFixedKg
      ? 'Valor da CX'
      : selectedUnitMeta.valueInputLabel

  const calculatedProductTotal = useMemo(() => {
    const quantidadeComprada = parseNumber(productForm.quantidadeComprada)
    const isCostDefined = Boolean(selectedProduct?.temCustoKgDefinido)
    const valorUnidade = parseNumber(productForm.valorCaixa)
    const valorFallback = parseNumber(productForm.valorCusto)
    const valorBase = isCostDefined
      ? (valorFallback > 0 ? valorFallback : valorUnidade)
      : valorUnidade

    if (quantidadeComprada <= 0 || valorBase <= 0) return 0
    return quantidadeComprada * valorBase
  }, [productForm.quantidadeComprada, productForm.valorCaixa, productForm.valorCusto, selectedProduct?.temCustoKgDefinido])

  const calculatedProductCost = useMemo(() => {
    if (shouldAutoCalculateCost) {
      const valorInformado = parseNumber(productForm.valorCaixa)
      const quantidadeFixa = selectedProduct?.quantidadeFixaKg ?? null
      if (valorInformado <= 0 || !quantidadeFixa || quantidadeFixa <= 0) return 0
      return valorInformado / quantidadeFixa
    }

    const valorCustoDigitado = parseNumber(productForm.valorCusto)
    if (valorCustoDigitado > 0) return valorCustoDigitado

    const valorInformado = parseNumber(productForm.valorCaixa)
    if (valorInformado <= 0) return 0

    if (selectedProduct?.temCustoKgDefinido) {
      return valorInformado
    }

    const quantidadeFixa = selectedProduct?.quantidadeFixaKg ?? null
    if (quantidadeFixa && quantidadeFixa > 0) {
      return valorInformado / quantidadeFixa
    }

    return valorInformado
  }, [productForm.valorCaixa, productForm.valorCusto, selectedProduct, shouldAutoCalculateCost])

  const handleValorCustoChange = (rawValue: string) => {
    setProductFormError('')
    setProductForm((prev) => ({ ...prev, valorCusto: maskCurrencyInput(rawValue) }))
  }

  const handleValorUnidadeChange = (rawValue: string) => {
    setProductFormError('')
    setProductForm((prev) => ({ ...prev, valorCaixa: maskCurrencyInput(rawValue) }))
  }

  const calculatedProductTotalKg = useMemo(() => {
    const quantidadeComprada = parseNumber(productForm.quantidadeComprada)
    if (quantidadeComprada <= 0) return 0

    if (selectedProduct?.temCustoKgDefinido) {
      return quantidadeComprada
    }

    const quantidadeFixa = selectedProduct?.quantidadeFixaKg ?? null
    if (!quantidadeFixa || quantidadeFixa <= 0) return 0
    return quantidadeComprada * quantidadeFixa
  }, [productForm.quantidadeComprada, selectedProduct])

  const handleNext = () => {
    const nextErrors = {
      dataCompra: !formData.dataCompra.trim(),
      fornecedorId: !formData.fornecedorId,
      loja: !formData.loja
    }

    setErrors(nextErrors)

    if (nextErrors.dataCompra || nextErrors.fornecedorId || nextErrors.loja) {
      return
    }

    setCurrentStep(2)
  }

  const handleAddProduct = () => {
    if (!selectedProduct) {
      setProductFormError('Selecione um produto.')
      return
    }

    const quantidadeComprada = parseNumber(productForm.quantidadeComprada)
    if (quantidadeComprada <= 0) {
      setProductFormError('Informe a quantidade comprada.')
      return
    }

    const isCostDefined = Boolean(selectedProduct.temCustoKgDefinido)
    const valorUnidadeInformado = parseNumber(productForm.valorCaixa)
    const valorCustoDigitado = parseNumber(productForm.valorCusto)
    const valorBaseTotal = isCostDefined
      ? (valorCustoDigitado > 0 ? valorCustoDigitado : valorUnidadeInformado)
      : valorUnidadeInformado

    if (!isCostDefined && valorUnidadeInformado <= 0) {
      setProductFormError(
        selectedProduct.temCustoKgDefinido
          ? 'Informe o valor do custo.'
          : `Informe ${valueInputLabel.toLowerCase()}.`
      )
      return
    }

    if (isCostDefined && valorBaseTotal <= 0) {
      setProductFormError('Informe o valor do custo.')
      return
    }

    if (!shouldAutoCalculateCost && !parseNumber(productForm.valorCusto)) {
      setProductFormError('Informe o valor do custo.')
      return
    }

    if (purchaseItems.some((item) => item.produtoId === selectedProduct.id)) {
      setProductFormError('Este produto já foi adicionado.')
      return
    }

    const totalKg = isCostDefined
      ? quantidadeComprada
      : (selectedProduct.quantidadeFixaKg && selectedProduct.quantidadeFixaKg > 0)
        ? quantidadeComprada * selectedProduct.quantidadeFixaKg
        : 0

    const valorCusto = shouldAutoCalculateCost
      ? calculatedProductCost
      : isCostDefined
        ? valorBaseTotal
        : valorCustoDigitado > 0
          ? valorCustoDigitado
          : (selectedProduct.quantidadeFixaKg && selectedProduct.quantidadeFixaKg > 0)
            ? valorBaseTotal / selectedProduct.quantidadeFixaKg
            : valorBaseTotal

    const nextItem: PurchaseProductItem = {
      id: `compra-item-${Date.now()}-${Math.random()}`,
      produtoId: selectedProduct.id,
      produtoNome: selectedProduct.nome,
      categoria: selectedProduct.categoria || 'Hortifruti',
      unidadeMedida: selectedProduct.unidadeMedida || 'cx',
      quantidadeFixaKg: selectedProduct.quantidadeFixaKg,
      temCustoKgDefinido: isCostDefined,
      quantidadeComprada,
      valorCaixa: isCostDefined ? (valorUnidadeInformado > 0 ? valorUnidadeInformado : valorBaseTotal) : valorUnidadeInformado,
      valorCusto,
      valorTotal: quantidadeComprada * valorBaseTotal,
      totalKg
    }

    setPurchaseItems((prev) => [...prev, nextItem])
    setProductForm({ produtoId: '', quantidadeComprada: '', valorCaixa: '', valorCusto: '' })
    setProductFormError('')
    setSaveError('')
  }

  const handleRemoveProduct = (itemId: string) => {
    setPurchaseItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleSavePurchase = () => {
    if (!selectedSupplier) {
      setCurrentStep(1)
      setErrors((prev) => ({ ...prev, fornecedorId: true }))
      return
    }

    if (purchaseItems.length === 0) {
      setSaveError('Adicione pelo menos um produto para salvar a compra.')
      return
    }

    const existingPurchases = loadStoredPurchases()
    const editedIdsSet = new Set(editingPurchaseIds)
    const basePurchases = isEditingPurchase
      ? existingPurchases.filter((item: any) => !editedIdsSet.has(String(item?.id || '')))
      : existingPurchases
    const createdAt = getCurrentDateBR()

    const mappedItems = purchaseItems.map((item) => ({
      id: `ceasa-${Date.now()}-${Math.random()}`,
      dataCompra: formData.dataCompra,
      produto: item.produtoNome,
      categoria: item.categoria,
      fornecedor: selectedSupplier.nome,
      loja: formData.loja,
      unidadeMedida: item.unidadeMedida,
      quantidade: item.quantidadeComprada,
      valorUnitario: item.valorCusto,
      valorTotal: item.valorTotal,
      valorCaixa: item.valorCaixa,
      temCustoKgDefinido: Boolean(item.temCustoKgDefinido),
      observacao: formData.observacao,
      quantidadeFixaKg: item.quantidadeFixaKg,
      criadoEm: createdAt
    }))

    localStorage.setItem('ceasaCompras', JSON.stringify([...basePurchases, ...mappedItems]))
    if (isEditingPurchase) clearEditContext()
    onNavigate?.('ceasa')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditingPurchase ? 'Edição de compra Ceasa' : 'Cadastro de compra Ceasa'}
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
                <span className="text-sm font-medium text-gray-800">Compra</span>
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
                <h2 className="text-lg font-semibold text-gray-900">1. Dados da compra</h2>
                <p className="text-sm text-gray-500 mt-1">Informe os dados iniciais para seguir para os produtos.</p>

                <div className="border-t mt-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Data da compra <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        value={formData.dataCompra}
                        onChange={(value) => {
                          setFormData((prev) => ({ ...prev, dataCompra: value }))
                          if (errors.dataCompra) setErrors((prev) => ({ ...prev, dataCompra: false }))
                        }}
                        className={standardFieldClass}
                      />
                      {errors.dataCompra && <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Fornecedor <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.fornecedorId}
                        onChange={(value) => {
                          setFormData((prev) => ({ ...prev, fornecedorId: String(value) }))
                          setProductForm({ produtoId: '', quantidadeComprada: '', valorCaixa: '', valorCusto: '' })
                          setPurchaseItems([])
                          setProductFormError('')
                          setSaveError('')
                          if (errors.fornecedorId) setErrors((prev) => ({ ...prev, fornecedorId: false }))
                        }}
                        options={supplierOptions}
                        buttonClassName={standardFieldClass}
                        buttonRef={fornecedorRef}
                        nextRef={lojaRef}
                      />
                      {errors.fornecedorId && <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>}
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Loja <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.loja}
                        onChange={(value) => {
                          setFormData((prev) => ({ ...prev, loja: String(value) }))
                          if (errors.loja) setErrors((prev) => ({ ...prev, loja: false }))
                        }}
                        options={storeOptions}
                        buttonClassName={standardFieldClass}
                        buttonRef={lojaRef}
                        nextRef={observacaoRef}
                      />
                      {errors.loja && <p className="text-xs text-red-500 mt-1">Este campo é obrigatório</p>}
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
                    onClick={() => {
                      if (isEditingPurchase) clearEditContext()
                      onNavigate?.('ceasa')
                    }}
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
                <h2 className="text-lg font-semibold text-gray-900">2. Produtos da compra</h2>
                <p className="text-sm text-gray-500 mt-1">Fornecedor: {selectedSupplierName}</p>

                <div className="border-t mt-4 pt-6">
                  {selectedSupplier && selectedSupplier.produtos.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                      <p className="text-sm text-gray-700 font-medium">Este fornecedor não possui produtos cadastrados</p>
                      <p className="text-sm text-gray-500 mt-1">Cadastre os produtos do fornecedor para continuar.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-gray-700 text-sm mb-2">Produto</label>
                          <Select
                            value={productForm.produtoId}
                            onChange={(value) => {
                              setProductForm((prev) => ({
                                ...prev,
                                produtoId: String(value),
                                valorCaixa: '',
                                valorCusto: ''
                              }))
                              setProductFormError('')
                            }}
                            options={productOptions}
                            buttonClassName={standardFieldClass}
                          />
                        </div>

                        {selectedProductHasFixedKg && (
                          <div className="w-24">
                            <label className="block text-gray-700 text-sm mb-2">Qtd fixa (KG)</label>
                            <input
                              type="text"
                              disabled
                              value={formatFixedKgInput(selectedProduct?.quantidadeFixaKg ?? null)}
                              className="w-full px-2 py-2 bg-gray-200 border border-gray-200 rounded-md text-sm text-gray-700 text-center cursor-not-allowed opacity-70"
                            />
                          </div>
                        )}

                        <div className="w-32">
                          <label className="block text-gray-700 text-sm mb-2">Quantidade comprada</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={productForm.quantidadeComprada}
                              onChange={(event) => {
                                setProductForm((prev) => ({ ...prev, quantidadeComprada: event.target.value }))
                                setProductFormError('')
                              }}
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500"
                            />
                            {selectedProduct && (
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 pointer-events-none font-medium">
                                {quantityInputUnitLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {!shouldAutoCalculateCost && (
                          <div className="w-32">
                            <label className="block text-gray-700 text-sm mb-2">Valor do custo</label>
                            <input
                              type="text"
                              value={productForm.valorCusto}
                              onChange={(event) => handleValorCustoChange(event.target.value)}
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500"
                            />
                          </div>
                        )}

                        {!selectedProduct?.temCustoKgDefinido && (
                          <div className="w-32">
                            <label className="block text-gray-700 text-sm mb-2">{valueInputLabel}</label>
                            <input
                              type="text"
                              value={productForm.valorCaixa}
                              onChange={(event) => handleValorUnidadeChange(event.target.value)}
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500"
                            />
                          </div>
                        )}

                        {shouldAutoCalculateCost && (
                          <div className="w-32">
                            <label className="block text-gray-700 text-sm mb-2">Valor do custo</label>
                            <input
                              type="text"
                              disabled
                              value={toCurrency(calculatedProductCost)}
                              className="w-full px-3 py-2 bg-gray-200 border border-gray-200 rounded-md text-sm text-gray-700 cursor-not-allowed opacity-70"
                            />
                          </div>
                        )}

                        <div className="w-32">
                          <label className="block text-gray-700 text-sm mb-2">Valor total</label>
                          <input
                            type="text"
                            disabled
                            value={toCurrency(calculatedProductTotal)}
                            className="w-full px-3 py-2 bg-gray-200 border border-gray-200 rounded-md text-sm text-gray-700 cursor-not-allowed opacity-70"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleAddProduct}
                          className="h-[38px] px-4 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2 whitespace-nowrap"
                        >
                          <Plus size={16} />
                          Adicionar
                        </button>
                      </div>

                      {productFormError && <p className="mt-2 text-xs text-red-500">{productFormError}</p>}

                      <div className="mt-5 rounded-lg border border-gray-200 overflow-hidden bg-white">
                        {purchaseItems.length === 0 ? (
                          <div className="p-12 text-center">
                            <p className="text-gray-500 text-lg mb-2">Nenhum produto adicionado</p>
                            <p className="text-sm text-gray-500">Adicione os produtos desta compra para continuar.</p>
                          </div>
                        ) : (
                          <>
                            <div className="p-4 bg-gray-50 border-b text-right text-sm text-gray-600">
                              Página 1/1 - Exibindo {purchaseItems.length} de {purchaseItems.length} registros
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[1200px]">
                                <thead className="bg-gray-50 border-b">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Produto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Unidade
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Qtd fixa (KG)
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Qtd comprada
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Total KG
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Valor Caixa/Fardo
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Valor do custo
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Valor total
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                      Ações
                                    </th>
                                  </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                  {purchaseItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {item.produtoNome}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {getUnitMeta(item.unidadeMedida).shortLabel}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {formatFixedKg(item.quantidadeFixaKg)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                        {formatQuantityDisplay(item.quantidadeComprada, item.categoria, item.unidadeMedida)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                        {item.totalKg > 0
                                          ? `${item.totalKg.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                          })} KG`
                                          : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                        {item.valorCaixa > 0
                                          ? `${toCurrency(item.valorCaixa)} (${getUnitMeta(item.unidadeMedida).shortLabel})`
                                          : '-'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                        {toCurrency(item.valorCusto)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                        {toCurrency(item.valorTotal)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveProduct(item.id)}
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
                    </>
                  )}
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
                    onClick={handleSavePurchase}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded font-medium"
                  >
                    {isEditingPurchase ? 'Salvar alterações' : 'Salvar compra'}
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

export default CeasaPurchaseCreate
