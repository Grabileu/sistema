import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Edit2, Plus, Search, Trash2, X } from 'lucide-react'
import { Beneficio } from '../App'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'
import { parseDateString } from '../utils/formatters'

interface BeneficiosProps {
  beneficios: Beneficio[]
  onAddBeneficio: (b: Beneficio) => void
  onUpdateBeneficio: (b: Beneficio) => void
  onDeleteBeneficio: (id: string) => void
}

interface BeneficioFormState {
  nome: string
  categoria: Beneficio['categoria']
  tipo: Beneficio['tipo']
  percentual: string
  valor: string
  descricao: string
  incidencia: NonNullable<Beneficio['incidencia']>
  baseCalculo: NonNullable<Beneficio['baseCalculo']>
  natureza: NonNullable<Beneficio['natureza']>
  elegibilidadeTipo: NonNullable<Beneficio['elegibilidadeTipo']>
  elegibilidadeValores: string[]
  vigenciaInicio: string
  vigenciaFim: string
  tetoMensal: string
  carenciaDias: string
  coparticipacao: string
  codigoRubrica: string
  codigoInterno: string
  incideINSS: boolean
  incideFGTS: boolean
  incideIRRF: boolean
  enviaESocial: boolean
  ativo: boolean
}

const CATEGORIAS: { value: Beneficio['categoria']; label: string; color: string }[] = [
  { value: 'hora_extra', label: 'Horas Extras', color: 'bg-orange-100 text-orange-800' },
  { value: 'adicional', label: 'Adicional', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'vale', label: 'Vale', color: 'bg-blue-100 text-blue-800' },
  { value: 'beneficio', label: 'Benefício', color: 'bg-green-100 text-green-800' },
  { value: 'previdencia', label: 'Previdência / Seguro', color: 'bg-violet-100 text-violet-800' },
  { value: 'outros', label: 'Outros', color: 'bg-gray-100 text-gray-800' },
]

const TIPOS: { value: Beneficio['tipo']; label: string }[] = [
  { value: 'percentual', label: 'Percentual (%)' },
  { value: 'valor_fixo', label: 'Valor Fixo (R$)' },
  { value: 'variavel', label: 'Variável' },
]

const INCIDENCIAS: { value: NonNullable<Beneficio['incidencia']>; label: string; color: string }[] = [
  { value: 'provento', label: 'Provento', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'desconto', label: 'Desconto', color: 'bg-rose-100 text-rose-700' },
  { value: 'informativo', label: 'Informativo', color: 'bg-slate-100 text-slate-700' },
]

const BASES_CALCULO: { value: NonNullable<Beneficio['baseCalculo']>; label: string }[] = [
  { value: 'salario_base', label: 'Salário base' },
  { value: 'hora_normal', label: 'Hora normal' },
  { value: 'piso_categoria', label: 'Piso da categoria' },
  { value: 'valor_mensal', label: 'Valor mensal' },
  { value: 'valor_dia', label: 'Valor por dia' },
  { value: 'valor_evento', label: 'Valor por evento' },
  { value: 'nao_se_aplica', label: 'Não se aplica' },
]

const NATUREZAS: { value: NonNullable<Beneficio['natureza']>; label: string }[] = [
  { value: 'legal', label: 'Obrigação legal' },
  { value: 'convencao_coletiva', label: 'Convenção coletiva' },
  { value: 'politica_interna', label: 'Política interna' },
  { value: 'premiacao', label: 'Premiação / incentivo' },
]

const ELEGIBILIDADE_TIPOS: { value: NonNullable<Beneficio['elegibilidadeTipo']>; label: string }[] = [
  { value: 'todos', label: 'Todos os colaboradores' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'loja', label: 'Loja / unidade' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'cargo', label: 'Cargo' },
  { value: 'equipe', label: 'Equipe' },
  { value: 'contrato', label: 'Tipo de contrato' },
]

const CONTRATOS_PADRAO = ['CLT', 'PJ', 'Temporário', 'Aprendiz', 'Estágio', 'Autônomo']

const SUGESTOES_BENEFICIOS: Array<{
  nome: string
  categoria: Beneficio['categoria']
  tipo: Beneficio['tipo']
  percentual?: number
  descricao?: string
  incidencia?: NonNullable<Beneficio['incidencia']>
  baseCalculo?: NonNullable<Beneficio['baseCalculo']>
  natureza?: NonNullable<Beneficio['natureza']>
}> = [
  { nome: 'Horas Extras 50%', categoria: 'hora_extra', tipo: 'percentual', percentual: 50, incidencia: 'provento', baseCalculo: 'hora_normal', natureza: 'legal', descricao: 'Adicional em dias úteis - CLT art. 59' },
  { nome: 'Horas Extras 100%', categoria: 'hora_extra', tipo: 'percentual', percentual: 100, incidencia: 'provento', baseCalculo: 'hora_normal', natureza: 'legal', descricao: 'Adicional em domingos e feriados' },
  { nome: 'Adicional Noturno', categoria: 'adicional', tipo: 'percentual', percentual: 20, incidencia: 'provento', baseCalculo: 'hora_normal', natureza: 'legal', descricao: 'Horas trabalhadas entre 22h e 5h - CLT art. 73' },
  { nome: 'Vale Alimentação', categoria: 'vale', tipo: 'variavel', incidencia: 'provento', baseCalculo: 'nao_se_aplica', natureza: 'politica_interna', descricao: 'Valor conforme política da empresa' },
  { nome: 'Vale Transporte', categoria: 'vale', tipo: 'variavel', incidencia: 'desconto', baseCalculo: 'nao_se_aplica', natureza: 'legal', descricao: 'Com desconto em folha conforme lei' },
  { nome: 'Plano de Saúde', categoria: 'beneficio', tipo: 'variavel', incidencia: 'desconto', baseCalculo: 'nao_se_aplica', natureza: 'politica_interna', descricao: 'Possível coparticipação do colaborador' },
  { nome: 'Seguro de Vida', categoria: 'previdencia', tipo: 'variavel', incidencia: 'informativo', baseCalculo: 'nao_se_aplica', natureza: 'politica_interna' },
  { nome: 'Participação nos Lucros (PLR)', categoria: 'outros', tipo: 'variavel', incidencia: 'provento', baseCalculo: 'valor_evento', natureza: 'premiacao' },
]

const emptyForm: BeneficioFormState = {
  nome: '',
  categoria: 'hora_extra',
  tipo: 'percentual',
  percentual: '',
  valor: '',
  descricao: '',
  incidencia: 'provento',
  baseCalculo: 'salario_base',
  natureza: 'politica_interna',
  elegibilidadeTipo: 'todos',
  elegibilidadeValores: [],
  vigenciaInicio: '',
  vigenciaFim: '',
  tetoMensal: '',
  carenciaDias: '',
  coparticipacao: '',
  codigoRubrica: '',
  codigoInterno: '',
  incideINSS: false,
  incideFGTS: false,
  incideIRRF: false,
  enviaESocial: true,
  ativo: true,
}

const standardFieldClass =
  'w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'
const standardFieldWithErrorClass = (hasError: boolean) =>
  `${standardFieldClass} ${hasError ? 'border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100' : ''}`

const toOptionalNumber = (value: string) => {
  const normalized = String(value || '').replace(',', '.').trim()
  if (!normalized) return undefined
  const parsed = Number(normalized)
  if (isNaN(parsed)) return undefined
  return parsed
}

const Beneficios: React.FC<BeneficiosProps> = ({
  beneficios,
  onAddBeneficio,
  onUpdateBeneficio,
  onDeleteBeneficio,
  onToggleBeneficio,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nome: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<BeneficioFormState>(emptyForm)
  const [showSugestoes, setShowSugestoes] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('')
  const [filtroIncidencia, setFiltroIncidencia] = useState<string>('')
  const [catalogosRefreshKey, setCatalogosRefreshKey] = useState(0)
  const nomeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (modalOpen && nomeRef.current) {
      setTimeout(() => nomeRef.current?.focus(), 100)
    }
  }, [modalOpen])

  useEffect(() => {
    if (modalOpen || pendingDelete) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [modalOpen, pendingDelete])

  useEffect(() => {
    const handleStorage = () => setCatalogosRefreshKey((prev) => prev + 1)
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const getCategoriaInfo = (cat: Beneficio['categoria']) =>
    CATEGORIAS.find((c) => c.value === cat) ?? CATEGORIAS[CATEGORIAS.length - 1]

  const getIncidenciaInfo = (inc: Beneficio['incidencia']) =>
    INCIDENCIAS.find((option) => option.value === inc) ?? INCIDENCIAS[0]

  const elegibilidadeCatalogo = useMemo(() => {
    const parseStoredArray = (key: string) => {
      const raw = localStorage.getItem(key)
      if (!raw) return [] as any[]
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    const uniqueSorted = (values: string[]) =>
      Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      )

    const companyDataRaw = localStorage.getItem('companyData')
    let companyNames: string[] = []
    if (companyDataRaw) {
      try {
        const companyData = JSON.parse(companyDataRaw)
        companyNames = uniqueSorted([
          String(companyData?.razaoSocial || ''),
          String(companyData?.nomeFantasia || ''),
          String(companyData?.nome || ''),
        ])
      } catch {
        companyNames = []
      }
    }

    const stores = uniqueSorted(parseStoredArray('businessUnits').map((item) => item?.nomeUnidade))
    const departments = uniqueSorted(parseStoredArray('departments').map((item) => item?.nome))
    const positions = uniqueSorted(parseStoredArray('positions').map((item) => item?.nome))
    const teams = uniqueSorted(parseStoredArray('teams').map((item) => item?.nome))

    return {
      empresa: companyNames,
      loja: stores,
      departamento: departments,
      cargo: positions,
      equipe: teams,
      contrato: CONTRATOS_PADRAO,
      todos: [] as string[],
    }
  }, [catalogosRefreshKey])

  const elegibilidadeOpcoesAtuais = useMemo(() => {
    return elegibilidadeCatalogo[form.elegibilidadeTipo] || []
  }, [elegibilidadeCatalogo, form.elegibilidadeTipo])

  const openAdd = () => {
    setForm(emptyForm)
    setEditingId(null)
    setErrors({})
    setShowSugestoes(false)
    setModalOpen(true)
  }

  const openEdit = (beneficio: Beneficio) => {
    setForm({
      nome: beneficio.nome,
      categoria: beneficio.categoria,
      tipo: beneficio.tipo,
      percentual: beneficio.percentual != null ? String(beneficio.percentual) : '',
      valor: beneficio.valor != null ? String(beneficio.valor) : '',
      descricao: beneficio.descricao ?? '',
      incidencia: beneficio.incidencia || 'provento',
      baseCalculo: beneficio.baseCalculo || 'salario_base',
      natureza: beneficio.natureza || 'politica_interna',
      elegibilidadeTipo: beneficio.elegibilidadeTipo || 'todos',
      elegibilidadeValores: beneficio.elegibilidadeValores || [],
      vigenciaInicio: beneficio.vigenciaInicio || '',
      vigenciaFim: beneficio.vigenciaFim || '',
      tetoMensal: beneficio.tetoMensal != null ? String(beneficio.tetoMensal) : '',
      carenciaDias: beneficio.carenciaDias != null ? String(beneficio.carenciaDias) : '',
      coparticipacao: beneficio.coparticipacao != null ? String(beneficio.coparticipacao) : '',
      codigoRubrica: beneficio.codigoRubrica || '',
      codigoInterno: beneficio.codigoInterno || '',
      incideINSS: Boolean(beneficio.incideINSS),
      incideFGTS: Boolean(beneficio.incideFGTS),
      incideIRRF: Boolean(beneficio.incideIRRF),
      enviaESocial: beneficio.enviaESocial !== false,
      ativo: beneficio.ativo,
    })
    setEditingId(beneficio.id)
    setErrors({})
    setShowSugestoes(false)
    setModalOpen(true)
  }

  const toggleElegibilidadeValor = (value: string) => {
    setForm((prev) => ({
      ...prev,
      elegibilidadeValores: prev.elegibilidadeValores.includes(value)
        ? prev.elegibilidadeValores.filter((current) => current !== value)
        : [...prev.elegibilidadeValores, value],
    }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!form.nome.trim()) {
      nextErrors.nome = 'Nome é obrigatório'
    }

    if (form.tipo === 'percentual') {
      const percentual = toOptionalNumber(form.percentual)
      if (percentual == null || percentual <= 0) {
        nextErrors.percentual = 'Informe um percentual válido'
      }
    }

    if (form.tipo === 'valor_fixo') {
      const valor = toOptionalNumber(form.valor)
      if (valor == null || valor <= 0) {
        nextErrors.valor = 'Informe um valor válido'
      }
    }

    if (form.elegibilidadeTipo !== 'todos' && form.elegibilidadeValores.length === 0) {
      nextErrors.elegibilidadeValores = 'Selecione ao menos um item de elegibilidade'
    }

    const inicio = parseDateString(form.vigenciaInicio)
    const fim = parseDateString(form.vigenciaFim)
    if (inicio && fim && inicio > fim) {
      nextErrors.vigenciaFim = 'A vigência final deve ser maior que a inicial'
    }

    const coparticipacao = toOptionalNumber(form.coparticipacao)
    if (coparticipacao != null && (coparticipacao < 0 || coparticipacao > 100)) {
      nextErrors.coparticipacao = 'A coparticipação deve estar entre 0 e 100'
    }

    const carencia = toOptionalNumber(form.carenciaDias)
    if (carencia != null && carencia < 0) {
      nextErrors.carenciaDias = 'A carência não pode ser negativa'
    }

    const teto = toOptionalNumber(form.tetoMensal)
    if (teto != null && teto < 0) {
      nextErrors.tetoMensal = 'O teto mensal não pode ser negativo'
    }

    return nextErrors
  }

  const handleSave = () => {
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const now = new Date().toLocaleDateString('pt-BR')
    const id = editingId ?? crypto.randomUUID()
    const beneficio: Beneficio = {
      id,
      nome: form.nome.trim(),
      categoria: form.categoria,
      tipo: form.tipo,
      percentual: form.tipo === 'percentual' ? toOptionalNumber(form.percentual) : undefined,
      valor: form.tipo === 'valor_fixo' ? toOptionalNumber(form.valor) : undefined,
      descricao: form.descricao.trim() || undefined,
      incidencia: form.incidencia,
      baseCalculo: form.baseCalculo,
      natureza: form.natureza,
      elegibilidadeTipo: form.elegibilidadeTipo,
      elegibilidadeValores:
        form.elegibilidadeTipo === 'todos' ? undefined : form.elegibilidadeValores,
      vigenciaInicio: form.vigenciaInicio || undefined,
      vigenciaFim: form.vigenciaFim || undefined,
      tetoMensal: toOptionalNumber(form.tetoMensal),
      carenciaDias: toOptionalNumber(form.carenciaDias),
      coparticipacao: toOptionalNumber(form.coparticipacao),
      codigoRubrica: form.codigoRubrica.trim() || undefined,
      codigoInterno: form.codigoInterno.trim() || undefined,
      incideINSS: form.incideINSS,
      incideFGTS: form.incideFGTS,
      incideIRRF: form.incideIRRF,
      enviaESocial: form.enviaESocial,
      ativo: form.ativo,
      criadoEm: editingId ? beneficios.find((item) => item.id === editingId)?.criadoEm || now : now,
    }

    if (editingId) {
      onUpdateBeneficio(beneficio)
    } else {
      onAddBeneficio(beneficio)
    }

    setModalOpen(false)
  }

  const aplicarSugestao = (sugestao: (typeof SUGESTOES_BENEFICIOS)[number]) => {
    setForm((prev) => ({
      ...prev,
      nome: sugestao.nome,
      categoria: sugestao.categoria,
      tipo: sugestao.tipo,
      percentual: sugestao.percentual != null ? String(sugestao.percentual) : '',
      valor: '',
      descricao: sugestao.descricao || '',
      incidencia: sugestao.incidencia || prev.incidencia,
      baseCalculo: sugestao.baseCalculo || prev.baseCalculo,
      natureza: sugestao.natureza || prev.natureza,
    }))
    setErrors({})
    setShowSugestoes(false)
  }

  const formatValor = (beneficio: Beneficio) => {
    if (beneficio.tipo === 'percentual' && beneficio.percentual != null) {
      return `${beneficio.percentual}%`
    }

    if (beneficio.tipo === 'valor_fixo' && beneficio.valor != null) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(beneficio.valor)
    }

    return 'Variável'
  }

  const formatVigencia = (beneficio: Beneficio) => {
    if (beneficio.vigenciaInicio && beneficio.vigenciaFim) {
      return `${beneficio.vigenciaInicio} a ${beneficio.vigenciaFim}`
    }
    if (beneficio.vigenciaInicio) {
      return `A partir de ${beneficio.vigenciaInicio}`
    }
    if (beneficio.vigenciaFim) {
      return `Até ${beneficio.vigenciaFim}`
    }
    return 'Sem vigência definida'
  }

  const isVigenteHoje = (beneficio: Beneficio) => {
    const hoje = new Date()
    const startOfToday = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const inicio = beneficio.vigenciaInicio ? parseDateString(beneficio.vigenciaInicio) : null
    const fim = beneficio.vigenciaFim ? parseDateString(beneficio.vigenciaFim) : null

    if (!beneficio.ativo) return false
    if (inicio && startOfToday < inicio) return false
    if (fim && startOfToday > fim) return false
    return true
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return beneficios
      .filter((beneficio) => {
        if (filtroCategoria && beneficio.categoria !== filtroCategoria) return false
        if (filtroIncidencia && beneficio.incidencia !== filtroIncidencia) return false

        if (!q) return true
        const categoriaLabel = getCategoriaInfo(beneficio.categoria).label.toLowerCase()
        const incidenciaLabel = getIncidenciaInfo(beneficio.incidencia || 'provento').label.toLowerCase()

        return (
          beneficio.nome.toLowerCase().includes(q) ||
          categoriaLabel.includes(q) ||
          incidenciaLabel.includes(q) ||
          String(beneficio.codigoRubrica || '').toLowerCase().includes(q) ||
          String(beneficio.codigoInterno || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [beneficios, filtroCategoria, filtroIncidencia, searchQuery])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Benefícios</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Cadastro completo de benefícios com regra de cálculo, elegibilidade, vigência e integração com folha.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Plus size={16} />
            Adicionar benefício
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-white px-4 py-3 shadow">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por nome, incidência, rubrica..."
              className={`${standardFieldClass} pl-9`}
            />
          </div>

          <div className="w-full sm:w-[220px]">
            <Select
              value={filtroCategoria}
              onChange={(value) => setFiltroCategoria(String(value))}
              options={[
                { label: 'Todas as categorias', value: '' },
                ...CATEGORIAS.map((c) => ({ label: c.label, value: c.value })),
              ]}
            />
          </div>

          <div className="w-full sm:w-[220px]">
            <Select
              value={filtroIncidencia}
              onChange={(value) => setFiltroIncidencia(String(value))}
              options={[
                { label: 'Todas as incidências', value: '' },
                ...INCIDENCIAS.map((item) => ({ label: item.label, value: item.value })),
              ]}
            />
          </div>

          {(searchQuery || filtroCategoria || filtroIncidencia) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFiltroCategoria('')
                setFiltroIncidencia('')
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
              Limpar
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              {beneficios.length === 0 ? (
                <>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                    <Plus size={28} className="text-indigo-400" />
                  </div>
                  <p className="mb-1 font-medium text-gray-600">Nenhum benefício cadastrado</p>
                  <p className="mb-5 text-sm text-gray-400">
                    Cadastre horas extras, vales, adicionais, planos e benefícios com regras completas para folha.
                  </p>
                  <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    <Plus size={16} />
                    Adicionar primeiro benefício
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-500">Nenhum benefício encontrado para os filtros aplicados.</p>
              )}
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Regra</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Vigência</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Elegibilidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((beneficio) => {
                    const categoria = getCategoriaInfo(beneficio.categoria)
                    const incidencia = getIncidenciaInfo(beneficio.incidencia || 'provento')
                    const elegibilidadeLabel = ELEGIBILIDADE_TIPOS.find(
                      (item) => item.value === (beneficio.elegibilidadeTipo || 'todos')
                    )?.label

                    return (
                      <tr key={beneficio.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{beneficio.nome}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${categoria.color}`}>
                              {categoria.label}
                            </span>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${incidencia.color}`}>
                              {incidencia.label}
                            </span>
                          </div>
                          {beneficio.descricao && (
                            <p className="mt-1 max-w-[320px] truncate text-xs text-gray-400">{beneficio.descricao}</p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">{formatValor(beneficio)}</p>
                          <p className="text-xs text-gray-500">
                            {BASES_CALCULO.find((item) => item.value === beneficio.baseCalculo)?.label || 'Sem base definida'}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">{formatVigencia(beneficio)}</td>

                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{elegibilidadeLabel || 'Todos os colaboradores'}</p>
                          {beneficio.elegibilidadeValores && beneficio.elegibilidadeValores.length > 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                              {beneficio.elegibilidadeValores.slice(0, 2).join(', ')}
                              {beneficio.elegibilidadeValores.length > 2 ? ` +${beneficio.elegibilidadeValores.length - 2}` : ''}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(beneficio)}
                              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                              title="Editar"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setPendingDelete({ id: beneficio.id, nome: beneficio.nome })}
                              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Editar benefício' : 'Adicionar benefício'}
                </h2>
                <p className="text-xs text-gray-500">Defina regras de cálculo, elegibilidade, vigência e integração com folha.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-4 overflow-y-auto px-6 py-5">
              {!editingId && (
                <section className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <button
                    type="button"
                    onClick={() => setShowSugestoes((prev) => !prev)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {showSugestoes ? 'Ocultar sugestões' : 'Ver sugestões de benefícios comuns'}
                  </button>

                  {showSugestoes && (
                    <div className="mt-2 max-h-44 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200 bg-white">
                      {SUGESTOES_BENEFICIOS.map((suggestion) => (
                        <button
                          key={suggestion.nome}
                          type="button"
                          onClick={() => aplicarSugestao(suggestion)}
                          className="flex w-full items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-indigo-50"
                        >
                          <span className="text-sm font-medium text-gray-800">{suggestion.nome}</span>
                          {suggestion.percentual != null && (
                            <span className="ml-auto text-xs font-semibold text-gray-600">{suggestion.percentual}%</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <section className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">1. Dados básicos</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={nomeRef}
                      value={form.nome}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, nome: event.target.value }))
                        setErrors((prev) => ({ ...prev, nome: '' }))
                      }}
                      placeholder="Ex: Horas Extras 50%, Vale Alimentação, Plano de Saúde"
                      className={standardFieldWithErrorClass(Boolean(errors.nome))}
                    />
                    {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Categoria</label>
                    <Select
                      value={form.categoria}
                      onChange={(value) => setForm((prev) => ({ ...prev, categoria: value as Beneficio['categoria'] }))}
                      options={CATEGORIAS.map((item) => ({ label: item.label, value: item.value }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Tipo</label>
                    <Select
                      value={form.tipo}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          tipo: value as Beneficio['tipo'],
                          percentual: '',
                          valor: '',
                        }))
                      }
                      options={TIPOS.map((item) => ({ label: item.label, value: item.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                      rows={2}
                      value={form.descricao}
                      onChange={(event) => setForm((prev) => ({ ...prev, descricao: event.target.value }))}
                      placeholder="Regra resumida, base legal, observações operacionais..."
                      className={`${standardFieldClass} resize-none`}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">2. Regra de cálculo</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Incidência</label>
                    <Select
                      value={form.incidencia}
                      onChange={(value) => setForm((prev) => ({ ...prev, incidencia: value as NonNullable<Beneficio['incidencia']> }))}
                      options={INCIDENCIAS.map((item) => ({ label: item.label, value: item.value }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Base de cálculo</label>
                    <Select
                      value={form.baseCalculo}
                      onChange={(value) => setForm((prev) => ({ ...prev, baseCalculo: value as NonNullable<Beneficio['baseCalculo']> }))}
                      options={BASES_CALCULO.map((item) => ({ label: item.label, value: item.value }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Natureza</label>
                    <Select
                      value={form.natureza}
                      onChange={(value) => setForm((prev) => ({ ...prev, natureza: value as NonNullable<Beneficio['natureza']> }))}
                      options={NATUREZAS.map((item) => ({ label: item.label, value: item.value }))}
                    />
                  </div>

                  {form.tipo === 'percentual' && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Percentual (%) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.percentual}
                          onChange={(event) => {
                            setForm((prev) => ({ ...prev, percentual: event.target.value }))
                            setErrors((prev) => ({ ...prev, percentual: '' }))
                          }}
                          className={`${standardFieldWithErrorClass(Boolean(errors.percentual))} pr-8`}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                      </div>
                      {errors.percentual && <p className="mt-1 text-xs text-red-500">{errors.percentual}</p>}
                    </div>
                  )}

                  {form.tipo === 'valor_fixo' && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Valor (R$) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                        <input
                          type="text"
                          value={form.valor}
                          onChange={(event) => {
                            setForm((prev) => ({ ...prev, valor: event.target.value }))
                            setErrors((prev) => ({ ...prev, valor: '' }))
                          }}
                          className={`${standardFieldWithErrorClass(Boolean(errors.valor))} pl-9`}
                        />
                      </div>
                      {errors.valor && <p className="mt-1 text-xs text-red-500">{errors.valor}</p>}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Teto mensal (R$)</label>
                    <input
                      value={form.tetoMensal}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, tetoMensal: event.target.value }))
                        setErrors((prev) => ({ ...prev, tetoMensal: '' }))
                      }}
                      className={standardFieldWithErrorClass(Boolean(errors.tetoMensal))}
                      placeholder="Opcional"
                    />
                    {errors.tetoMensal && <p className="mt-1 text-xs text-red-500">{errors.tetoMensal}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Carência (dias)</label>
                    <input
                      value={form.carenciaDias}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, carenciaDias: event.target.value }))
                        setErrors((prev) => ({ ...prev, carenciaDias: '' }))
                      }}
                      className={standardFieldWithErrorClass(Boolean(errors.carenciaDias))}
                      placeholder="Opcional"
                    />
                    {errors.carenciaDias && <p className="mt-1 text-xs text-red-500">{errors.carenciaDias}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Coparticipação (%)</label>
                    <input
                      value={form.coparticipacao}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, coparticipacao: event.target.value }))
                        setErrors((prev) => ({ ...prev, coparticipacao: '' }))
                      }}
                      className={standardFieldWithErrorClass(Boolean(errors.coparticipacao))}
                      placeholder="0 a 100"
                    />
                    {errors.coparticipacao && <p className="mt-1 text-xs text-red-500">{errors.coparticipacao}</p>}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">3. Quem tem direito</p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de elegibilidade</label>
                    <Select
                      value={form.elegibilidadeTipo}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          elegibilidadeTipo: value as NonNullable<Beneficio['elegibilidadeTipo']>,
                          elegibilidadeValores: [],
                        }))
                      }
                      options={ELEGIBILIDADE_TIPOS.map((item) => ({ label: item.label, value: item.value }))}
                    />
                  </div>
                </div>

                {form.elegibilidadeTipo !== 'todos' && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      Selecione os itens permitidos
                    </p>

                    {elegibilidadeOpcoesAtuais.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {elegibilidadeOpcoesAtuais.map((option) => {
                          const checked = form.elegibilidadeValores.includes(option)
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleElegibilidadeValor(option)}
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                checked
                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Nenhum item encontrado no cadastro correspondente. Cadastre esses itens primeiro.
                      </p>
                    )}

                    {errors.elegibilidadeValores && (
                      <p className="mt-2 text-xs text-red-500">{errors.elegibilidadeValores}</p>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">4. Vigência e status</p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Vigência inicial</label>
                    <DatePicker
                      value={form.vigenciaInicio}
                      onChange={(value) => setForm((prev) => ({ ...prev, vigenciaInicio: value }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Vigência final</label>
                    <DatePicker
                      value={form.vigenciaFim}
                      onChange={(value) => {
                        setForm((prev) => ({ ...prev, vigenciaFim: value }))
                        setErrors((prev) => ({ ...prev, vigenciaFim: '' }))
                      }}
                      className="text-sm"
                      calendarAlign="right"
                    />
                    {errors.vigenciaFim && <p className="mt-1 text-xs text-red-500">{errors.vigenciaFim}</p>}
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, ativo: !prev.ativo }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          form.ativo ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            form.ativo ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm ${form.ativo ? 'font-medium text-indigo-600' : 'text-gray-400'}`}>
                        {form.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">5. Integração com folha</p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Código de rubrica</label>
                    <input
                      value={form.codigoRubrica}
                      onChange={(event) => setForm((prev) => ({ ...prev, codigoRubrica: event.target.value }))}
                      placeholder="Ex: 1001"
                      className={standardFieldClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Código interno</label>
                    <input
                      value={form.codigoInterno}
                      onChange={(event) => setForm((prev) => ({ ...prev, codigoInterno: event.target.value }))}
                      placeholder="Ex: BEN-VA-001"
                      className={standardFieldClass}
                    />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                  <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.incideINSS}
                      onChange={(event) => setForm((prev) => ({ ...prev, incideINSS: event.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-gray-300"
                    />
                    Incide INSS
                  </label>

                  <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.incideFGTS}
                      onChange={(event) => setForm((prev) => ({ ...prev, incideFGTS: event.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-gray-300"
                    />
                    Incide FGTS
                  </label>

                  <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.incideIRRF}
                      onChange={(event) => setForm((prev) => ({ ...prev, incideIRRF: event.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-gray-300"
                    />
                    Incide IRRF
                  </label>

                  <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.enviaESocial}
                      onChange={(event) => setForm((prev) => ({ ...prev, enviaESocial: event.target.checked }))}
                      className="h-3.5 w-3.5 rounded border-gray-300"
                    />
                    Envia eSocial
                  </label>
                </div>
              </section>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {editingId ? 'Salvar alterações' : 'Adicionar benefício'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-start gap-4 px-6 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Excluir benefício</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tem certeza que deseja excluir <strong>"{pendingDelete.nome}"</strong>? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button
                onClick={() => setPendingDelete(null)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteBeneficio(pendingDelete.id)
                  setPendingDelete(null)
                }}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Beneficios
