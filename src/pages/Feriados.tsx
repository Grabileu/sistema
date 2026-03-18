import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Edit2, Plus, Search, Trash2, X } from 'lucide-react'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'

interface Feriado {
  id: string
  nome: string
  data: string
  tipo: 'nacional' | 'estadual' | 'municipal' | 'empresa'
  uf?: string
  cidade?: string
  recorrente: boolean
  ativo: boolean
  criadoEm: string
}

interface FeriadoFormState {
  nome: string
  data: string
  tipo: Feriado['tipo']
  uf: string
  cidade: string
  recorrente: boolean
  ativo: boolean
}

const TIPO_OPTIONS: Array<{ value: Feriado['tipo']; label: string }> = [
  { value: 'nacional', label: 'Nacional' },
  { value: 'estadual', label: 'Estadual' },
  { value: 'municipal', label: 'Municipal' },
  { value: 'empresa', label: 'Empresa' },
]

const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

const emptyForm: FeriadoFormState = {
  nome: '',
  data: '',
  tipo: 'nacional',
  uf: '',
  cidade: '',
  recorrente: true,
  ativo: true,
}

const standardFieldClass =
  'h-10 w-full rounded-md border border-gray-200 bg-gray-100 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'

const parseDateString = (value: string): Date | null => {
  if (!value) return null

  const trimmed = value.trim()
  let day = 0
  let month = 0
  let year = 2000

  if (/^\d{2}\/\d{2}$/.test(trimmed)) {
    const parts = trimmed.split('/')
    day = Number(parts[0])
    month = Number(parts[1])
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const parts = trimmed.split('/')
    day = Number(parts[0])
    month = Number(parts[1])
    year = Number(parts[2])
  } else {
    return null
  }

  const date = new Date(year, month - 1, day)
  if (isNaN(date.getTime())) return null
  if (date.getDate() !== day || date.getMonth() !== month - 1) return null
  return date
}

const normalizeDayMonth = (value: string) => {
  const parsed = parseDateString(value)
  if (!parsed) return ''
  const day = String(parsed.getDate()).padStart(2, '0')
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

const normalizeDayMonthInput = (value: string) => {
  const trimmed = value.trim()

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return trimmed.slice(0, 5)
  }

  if (/^\d{0,2}(\/\d{0,2})?$/.test(trimmed)) {
    return trimmed
  }

  return normalizeDayMonth(trimmed)
}

const getDayMonthSortValue = (value: string) => {
  const parsed = parseDateString(value)
  if (!parsed) return Number.MAX_SAFE_INTEGER
  return (parsed.getMonth() + 1) * 100 + parsed.getDate()
}

const formatDayMonth = (value: string) => {
  const parsed = parseDateString(value)
  if (!parsed) return value
  const day = String(parsed.getDate()).padStart(2, '0')
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

const Feriados: React.FC = () => {
  const [feriados, setFeriados] = useState<Feriado[]>(() => {
    const stored = localStorage.getItem('feriados')
    if (stored) {
      try {
        return JSON.parse(stored) as Feriado[]
      } catch {
        localStorage.removeItem('feriados')
      }
    }
    return []
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nome: string } | null>(null)
  const [form, setForm] = useState<FeriadoFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const nomeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('feriados', JSON.stringify(feriados))
  }, [feriados])

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
    if (modalOpen) {
      setTimeout(() => nomeRef.current?.focus(), 100)
    }
  }, [modalOpen])

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (item: Feriado) => {
    setEditingId(item.id)
    setForm({
      nome: item.nome,
      data: normalizeDayMonth(item.data),
      tipo: item.tipo,
      uf: item.uf || '',
      cidade: item.cidade || '',
      recorrente: item.recorrente,
      ativo: item.ativo,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!form.nome.trim()) {
      nextErrors.nome = 'Nome é obrigatório'
    }

    if (!normalizeDayMonth(form.data)) {
      nextErrors.data = 'Data inválida'
    }

    if (form.tipo === 'estadual' && !form.uf.trim()) {
      nextErrors.uf = 'Selecione o estado'
    }

    if (form.tipo === 'municipal') {
      if (!form.uf.trim()) {
        nextErrors.uf = 'Selecione o estado'
      }
      if (!form.cidade.trim()) {
        nextErrors.cidade = 'Informe a cidade'
      }
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
    const normalizedData = normalizeDayMonth(form.data)
    const nextItem: Feriado = {
      id: editingId ?? crypto.randomUUID(),
      nome: form.nome.trim(),
      data: normalizedData,
      tipo: form.tipo,
      uf: form.tipo === 'estadual' || form.tipo === 'municipal' ? form.uf : undefined,
      cidade: form.tipo === 'municipal' ? form.cidade.trim() : undefined,
      recorrente: form.recorrente,
      ativo: form.ativo,
      criadoEm: editingId
        ? feriados.find((item) => item.id === editingId)?.criadoEm || now
        : now,
    }

    setFeriados((prev) => {
      const index = prev.findIndex((item) => item.id === nextItem.id)
      if (index === -1) return [...prev, nextItem]
      const copy = [...prev]
      copy[index] = nextItem
      return copy
    })

    setModalOpen(false)
  }

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return feriados
      .filter((item) => {
        if (!query) return true
        return (
          item.nome.toLowerCase().includes(query) ||
          item.tipo.toLowerCase().includes(query) ||
          String(item.uf || '').toLowerCase().includes(query) ||
          String(item.cidade || '').toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        const dateDiff = getDayMonthSortValue(a.data) - getDayMonthSortValue(b.data)
        if (dateDiff !== 0) return dateDiff
        return a.nome.localeCompare(b.nome, 'pt-BR')
      })
  }, [feriados, searchQuery])

  const totalAtivos = feriados.filter((item) => item.ativo).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Feriados</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Cadastre os feriados oficiais e internos da empresa.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={16} />
            Adicionar feriado
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {feriados.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="mb-1 text-xs text-gray-500">Total cadastrado</p>
              <p className="text-2xl font-bold text-gray-900">{feriados.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="mb-1 text-xs text-gray-500">Ativos</p>
              <p className="text-2xl font-bold text-emerald-600">{totalAtivos}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="mb-1 text-xs text-gray-500">Recorrentes</p>
              <p className="text-2xl font-bold text-indigo-600">{feriados.filter((item) => item.recorrente).length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="mb-1 text-xs text-gray-500">Não recorrentes</p>
              <p className="text-2xl font-bold text-amber-600">{feriados.filter((item) => !item.recorrente).length}</p>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por nome, tipo, UF ou cidade"
              className={`${standardFieldClass} pl-9`}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
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
              {feriados.length === 0 ? (
                <>
                  <p className="mb-1 font-medium text-gray-600">Nenhum feriado cadastrado</p>
                  <p className="mb-5 text-sm text-gray-400">
                    Cadastre feriados nacionais, estaduais, municipais e internos.
                  </p>
                  <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    <Plus size={16} />
                    Adicionar primeiro feriado
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-500">Nenhum feriado encontrado para a busca informada.</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Feriado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Abrangência</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Recorrência</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatDayMonth(item.data)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.tipo === 'nacional' && 'Nacional'}
                      {item.tipo === 'empresa' && 'Empresa'}
                      {item.tipo === 'estadual' && `Estadual (${item.uf})`}
                      {item.tipo === 'municipal' && `Municipal (${item.cidade}/${item.uf})`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.recorrente ? 'Todo ano' : 'Ano específico'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          setFeriados((prev) =>
                            prev.map((current) =>
                              current.id === item.id ? { ...current, ativo: !current.ativo } : current
                            )
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          item.ativo
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.ativo ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setPendingDelete({ id: item.id, nome: item.nome })}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-visible rounded-2xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Editar feriado' : 'Adicionar feriado'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
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
                    placeholder="Ex: Confraternização Universal"
                    className={standardFieldClass}
                  />
                  {errors.nome && <p className="mt-1 text-xs text-red-500">{errors.nome}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    value={form.data}
                    onChange={(value) => {
                      setForm((prev) => ({ ...prev, data: normalizeDayMonthInput(value) }))
                      setErrors((prev) => ({ ...prev, data: '' }))
                    }}
                    className="h-10"
                    placeholder="DD/MM"
                  />
                  {errors.data && <p className="mt-1 text-xs text-red-500">{errors.data}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Abrangência</label>
                  <Select
                    value={form.tipo}
                    onChange={(value) => {
                      const nextTipo = value as Feriado['tipo']
                      setForm((prev) => ({
                        ...prev,
                        tipo: nextTipo,
                        uf: nextTipo === 'nacional' || nextTipo === 'empresa' ? '' : prev.uf,
                        cidade: nextTipo === 'municipal' ? prev.cidade : '',
                      }))
                    }}
                    options={TIPO_OPTIONS.map((item) => ({ label: item.label, value: item.value }))}
                    buttonClassName="h-10"
                    menuClassName="z-[120]"
                  />
                </div>

                {(form.tipo === 'estadual' || form.tipo === 'municipal') && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      UF <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.uf}
                      onChange={(value) => {
                        setForm((prev) => ({ ...prev, uf: String(value) }))
                        setErrors((prev) => ({ ...prev, uf: '' }))
                      }}
                      options={UF_OPTIONS.map((uf) => ({ label: uf, value: uf }))}
                      placeholder="Selecione a UF"
                      buttonClassName="h-10"
                      menuClassName="z-[120]"
                    />
                    {errors.uf && <p className="mt-1 text-xs text-red-500">{errors.uf}</p>}
                  </div>
                )}

                {form.tipo === 'municipal' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Cidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.cidade}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, cidade: event.target.value }))
                        setErrors((prev) => ({ ...prev, cidade: '' }))
                      }}
                      className={standardFieldClass}
                      placeholder="Ex: São Paulo"
                    />
                    {errors.cidade && <p className="mt-1 text-xs text-red-500">{errors.cidade}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.recorrente}
                    onChange={(event) => setForm((prev) => ({ ...prev, recorrente: event.target.checked }))}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                  />
                  Repetir todo ano
                </label>

                <label className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(event) => setForm((prev) => ({ ...prev, ativo: event.target.checked }))}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                  />
                  Feriado ativo
                </label>
              </div>
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
                {editingId ? 'Salvar alterações' : 'Adicionar feriado'}
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
                <h3 className="text-base font-semibold text-gray-900">Excluir feriado</h3>
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
                  setFeriados((prev) => prev.filter((item) => item.id !== pendingDelete.id))
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

export default Feriados
