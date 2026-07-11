import React, { useState } from 'react'
import { Employee, QuebraDeCaixa } from '../App'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'
import { buildEmployeeOptions } from '../utils/formatters'

type QuebraPayload = QuebraDeCaixa & {
  valor?: string
  tipo?: string
  comprovantes?: string
  desconto?: number
  observacao?: string
}

type QuebraFormData = {
  funcionarioId: string
  data: string
  formaPagamento: string
  valor: string
  tipo: string
  comprovantes: string
  desconto: number
  observacao: string
}

type QuebraFormErrors = {
  funcionarioId: boolean
  data: boolean
}

interface AdicionarQuebraProps {
  onNavigate?: (route: string) => void
  onAddQuebra?: (quebra: QuebraPayload) => void
  onUpdateQuebra?: (quebra: QuebraPayload) => void
  employees: Employee[]
  editingQuebra?: QuebraPayload | null
}

const AdicionarQuebraDeCaixa: React.FC<AdicionarQuebraProps> = ({ onNavigate, onAddQuebra, onUpdateQuebra, employees, editingQuebra }) => {
  const standardFieldClass = 'rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'

  const [formData, setFormData] = useState<QuebraFormData>({
    funcionarioId: editingQuebra?.funcionarioId || '',
    data: editingQuebra?.data || '',
    formaPagamento: editingQuebra?.formaPagamento || '',
    valor: editingQuebra?.valor || '',
    tipo: editingQuebra?.tipo || '',
    comprovantes: editingQuebra?.comprovantes || '',
    desconto: editingQuebra?.desconto || 0,
    observacao: editingQuebra?.observacao || ''
  })

  const [errors, setErrors] = useState<QuebraFormErrors>({
    funcionarioId: false,
    data: false
  })

  const pagamentos = [
    { label: 'Selecionar', value: '' },
    { label: 'Dinheiro', value: 'Dinheiro' },
    { label: 'Débito', value: 'Débito' },
    { label: 'Crédito', value: 'Crédito' },
    { label: 'Pix', value: 'Pix' },
    { label: 'Alimentação', value: 'Alimentação' },
    { label: 'Cliente a Prazo', value: 'Cliente a Prazo' },
    { label: 'POS', value: 'POS' },
    { label: 'Outros', value: 'Outros' }
  ]

  const employeeOptions = buildEmployeeOptions(employees)

  const handleSave = () => {
    const newErrors = {
      funcionarioId: !formData.funcionarioId,
      data: !formData.data
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some((error) => error)) {
      return
    }

    const selectedEmployee = employees.find((e) => e.id === formData.funcionarioId)

    const basePayload: Omit<QuebraPayload, 'id' | 'criadoEm'> = {
      funcionarioId: formData.funcionarioId,
      funcionarioNome: selectedEmployee?.nomeCompleto || '',
      data: formData.data,
      formaPagamento: formData.formaPagamento,
      valor: formData.formaPagamento === 'Dinheiro' ? formData.valor : undefined,
      tipo: formData.formaPagamento === 'Dinheiro' ? formData.tipo : undefined,
      comprovantes: formData.formaPagamento !== 'Dinheiro' ? formData.comprovantes : undefined,
      desconto: formData.formaPagamento !== 'Dinheiro' ? formData.desconto : undefined,
      observacao: formData.formaPagamento !== 'Dinheiro' ? formData.observacao : ''
    }

    if (editingQuebra) {
      onUpdateQuebra?.({
        ...editingQuebra,
        ...basePayload
      })
    } else {
      onAddQuebra?.({
        id: Date.now().toString(),
        criadoEm: new Date().toLocaleDateString('pt-BR'),
        ...basePayload
      })
    }
    onNavigate?.('quebra-de-caixa')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">{editingQuebra ? 'Editar quebra de caixa' : 'Adicionar quebra de caixa'}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-lg font-semibold mb-6">Registre a quebra de caixa</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Funcionário <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.funcionarioId}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, funcionarioId: String(value) }))
                  setErrors((prev) => ({ ...prev, funcionarioId: false }))
                }}
                options={employeeOptions}
                buttonClassName={standardFieldClass}
              />
              {errors.funcionarioId && (
                <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Data da quebra <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.data}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, data: value }))
                  setErrors((prev) => ({ ...prev, data: false }))
                }}
                className={standardFieldClass}
              />
              {errors.data && (
                <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 text-sm mb-2">Forma de pagamento</label>
            <Select
              value={formData.formaPagamento}
              onChange={(value) => {
                const formaPagamento = String(value)
                setFormData((prev) => ({
                  ...prev,
                  formaPagamento,
                  valor: formaPagamento === 'Dinheiro' ? prev.valor : '',
                  tipo: formaPagamento === 'Dinheiro' ? prev.tipo : '',
                  comprovantes: formaPagamento !== 'Dinheiro' ? prev.comprovantes : '',
                  desconto: formaPagamento !== 'Dinheiro' ? prev.desconto : 0,
                  observacao: formaPagamento !== 'Dinheiro' ? prev.observacao : ''
                }))
              }}
              options={pagamentos}
              buttonClassName={standardFieldClass}
            />
          </div>

          {formData.formaPagamento === 'Dinheiro' && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm mb-2">Valor da quebra</label>
                <input
                  type="text"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={`w-full bg-gray-100 border border-gray-200 px-3 py-2 ${standardFieldClass}`}
                />
              </div>
              <div className="mb-8">
                <label className="block text-gray-700 text-sm mb-2">Situação</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="tipo"
                      value="sobrou"
                      checked={formData.tipo === 'sobrou'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
                      className="form-radio text-indigo-600"
                    />
                    Sobrou
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="tipo"
                      value="faltou"
                      checked={formData.tipo === 'faltou'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
                      className="form-radio text-indigo-600"
                    />
                    Faltou
                  </label>
                </div>
              </div>
            </>
          )}

          {formData.formaPagamento && formData.formaPagamento !== 'Dinheiro' && (
            <>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm mb-2">Valor do comprovante perdido</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.comprovantes}
                  onChange={(e) => {
                    // valor do comprovante não altera desconto fixo
                    setFormData((prev) => ({
                      ...prev,
                      comprovantes: e.target.value,
                      desconto: 5
                    }))
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  className={`w-full bg-gray-100 border border-gray-200 px-3 py-2 ${standardFieldClass}`}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm mb-2">Valor descontado</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`R$ ${formData.desconto.toFixed(2)}`}
                  className="w-full bg-gray-200 border border-gray-200 rounded-md px-3 py-2 text-sm cursor-not-allowed"
                />
              </div>
              <div className="mb-8">
                <label className="block text-gray-700 text-sm mb-2">Observação</label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, observacao: e.target.value }))}
                  className={`w-full bg-gray-100 border border-gray-200 px-3 py-2 resize-none ${standardFieldClass}`}
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('quebra-de-caixa')}
              className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded font-medium hover:bg-gray-300"
            >
              Voltar
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded font-medium hover:bg-indigo-700"
            >
              {editingQuebra ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdicionarQuebraDeCaixa
