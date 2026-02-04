import React, { useState } from 'react'

interface PositionCreateProps {
  onNavigate?: (route: string) => void
  onAddPosition?: (position: any) => void
  onUpdatePosition?: (position: any) => void
  editingPosition?: any
}

const PositionCreate: React.FC<PositionCreateProps> = ({ onNavigate, onAddPosition, onUpdatePosition, editingPosition }) => {
  const [formData, setFormData] = useState({
    codigo: editingPosition?.codigo || '',
    nome: editingPosition?.nome || '',
    descricao: editingPosition?.descricao || ''
  })

  const [errors, setErrors] = useState({
    codigo: false,
    nome: false
  })

  const handleSave = () => {
    const newErrors = {
      codigo: !formData.codigo,
      nome: !formData.nome
    }
    
    setErrors(newErrors)
    
    if (Object.values(newErrors).some(error => error)) {
      return
    }
    
    if (editingPosition) {
      // Atualizar cargo existente
      const updatedPosition = {
        ...editingPosition,
        codigo: formData.codigo,
        nome: formData.nome,
        descricao: formData.descricao
      }
      onUpdatePosition?.(updatedPosition)
    } else {
      // Criar novo cargo
      const newPosition = {
        id: Date.now().toString(),
        codigo: formData.codigo,
        nome: formData.nome,
        descricao: formData.descricao,
        totalFuncionarios: 0,
        criadoEm: new Date().toLocaleDateString('pt-BR')
      }
      onAddPosition?.(newPosition)
    }
    
    onNavigate?.('cargos')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">{editingPosition ? 'Editar cargo' : 'Cadastro de cargo'}</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Digite"
                value={formData.codigo}
                onChange={(e) => {
                  setFormData({ ...formData, codigo: e.target.value })
                  setErrors({ ...errors, codigo: false })
                }}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
              />
              {errors.codigo && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Digite"
                value={formData.nome}
                onChange={(e) => {
                  setFormData({ ...formData, nome: e.target.value })
                  setErrors({ ...errors, nome: false })
                }}
                className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 text-sm mb-2">Descrição</label>
            <textarea
              placeholder="Digite"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500 resize-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('cargos')}
              className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded font-medium hover:bg-gray-300"
            >
              Voltar
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded font-medium hover:bg-indigo-700"
            >
              {editingPosition ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PositionCreate
