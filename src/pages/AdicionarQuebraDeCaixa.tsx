import React, { useState } from 'react'
import { Employee } from '../App'
import DatePicker from '../components/DatePicker'
import Select from '../components/Select'
import { buildEmployeeOptions } from '../utils/formatters'

interface AdicionarQuebraProps {
  onNavigate?: (route: string) => void
  onAddQuebra?: (quebra: any) => void
  onUpdateQuebra?: (quebra: any) => void
  employees: Employee[]
  editingQuebra?: any
}

const AdicionarQuebraDeCaixa: React.FC<AdicionarQuebraProps> = ({ onNavigate, onAddQuebra, onUpdateQuebra, employees, editingQuebra }) => {
  const standardFieldClass = 'rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100'

  const [formData, setFormData] = useState({
    funcionarioId: editingQuebra?.funcionarioId || '',
    data: editingQuebra?.data || '',
    formaPagamento: editingQuebra?.formaPagamento || '',
    valor: editingQuebra?.valor || '',
    tipo: editingQuebra?.tipo || '',
    comprovantes: editingQuebra?.comprovantes || '',
    desconto: editingQuebra?.desconto || 0,
    observacao: editingQuebra?.observacao || ''
  })

  const [errors, setErrors] = useState({
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

    if (editingQuebra) {
      const updated = {
        ...editingQuebra,
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
      onUpdateQuebra?.(updated)
    } else {
      const newQuebra = {
        id: Date.now().toString(),
        funcionarioId: formData.funcionarioId,
        funcionarioNome: selectedEmployee?.nomeCompleto || '',
        data: formData.data,
        formaPagamento: formData.formaPagamento,
        valor: formData.formaPagamento === 'Dinheiro' ? formData.valor : undefined,
        tipo: formData.formaPagamento === 'Dinheiro' ? formData.tipo : undefined,
        comprovantes: formData.formaPagamento !== 'Dinheiro' ? formData.comprovantes : undefined,
        desconto: formData.formaPagamento !== 'Dinheiro' ? formData.desconto : undefined,
        observacao: formData.formaPagamento !== 'Dinheiro' ? formData.observacao : '',
        criadoEm: new Date().toLocaleDateString('pt-BR')
      }
      onAddQuebra?.(newQuebra)
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
                  setFormData({ ...formData, funcionarioId: String(value) })
                  setErrors({ ...errors, funcionarioId: false })
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
                  setFormData({ ...formData, data: value })
                  setErrors({ ...errors, data: false })
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
              onChange={(value) =>
                setFormData({ ...formData, formaPagamento: String(value) })
              }
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
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
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
                    setFormData({
                      ...formData,
                      comprovantes: e.target.value,
                      desconto: 5
                    })
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
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
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
