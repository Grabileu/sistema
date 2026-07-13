import React, { useState } from 'react'
import { formatCNPJ, formatCEP, formatPhone } from '../utils/formatters'

interface BusinessUnitCreateProps {
  onNavigate?: (route: string) => void
  onAddBusinessUnit?: (unit: any) => void
  onUpdateBusinessUnit?: (unit: any) => void
  editingBusinessUnit?: any
}

const BusinessUnitCreate: React.FC<BusinessUnitCreateProps> = ({ 
  onNavigate, 
  onAddBusinessUnit, 
  onUpdateBusinessUnit, 
  editingBusinessUnit 
}) => {
  const [formData, setFormData] = useState({
    nomeUnidade: editingBusinessUnit?.nomeUnidade || '',
    telefone: editingBusinessUnit?.telefone || '',
    razaoSocial: editingBusinessUnit?.razaoSocial || '',
    cnpj: editingBusinessUnit?.cnpj || '',
    inscricaoEstadual: editingBusinessUnit?.inscricaoEstadual || '',
    inscricaoMunicipal: editingBusinessUnit?.inscricaoMunicipal || '',
    ramoAtividade: editingBusinessUnit?.ramoAtividade || '',
    cep: editingBusinessUnit?.cep || '',
    endereco: editingBusinessUnit?.endereco || '',
    numero: editingBusinessUnit?.numero || '',
    complemento: editingBusinessUnit?.complemento || '',
    bairro: editingBusinessUnit?.bairro || '',
    estado: editingBusinessUnit?.estado || '',
    cidade: editingBusinessUnit?.cidade || '',
    observacao: editingBusinessUnit?.observacao || ''
  })

  const [errors, setErrors] = useState({
    nomeUnidade: false,
    telefone: false,
    razaoSocial: false,
    cnpj: false,
    cep: false,
    endereco: false,
    numero: false,
    bairro: false,
    estado: false,
    cidade: false
  })

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setFormData({ ...formData, cnpj: formatted })
    setErrors({ ...errors, cnpj: false })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData({ ...formData, telefone: formatted })
    setErrors({ ...errors, telefone: false })
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setFormData({ ...formData, cep: formatted })
    setErrors({ ...errors, cep: false })

    if (formatted.length === 9) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formatted.replace('-', '')}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }))
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  const handleSave = () => {
    const newErrors = {
      nomeUnidade: !formData.nomeUnidade,
      telefone: !formData.telefone,
      razaoSocial: !formData.razaoSocial,
      cnpj: !formData.cnpj,
      cep: !formData.cep,
      endereco: !formData.endereco,
      numero: !formData.numero,
      bairro: !formData.bairro,
      estado: !formData.estado,
      cidade: !formData.cidade
    }
    
    setErrors(newErrors)
    
    if (Object.values(newErrors).some(error => error)) {
      return
    }
    
    if (editingBusinessUnit) {
      const updatedUnit = {
        ...editingBusinessUnit,
        ...formData
      }
      onUpdateBusinessUnit?.(updatedUnit)
    } else {
      const newUnit = {
        id: Date.now().toString(),
        ...formData,
        unidadePrincipal: false,
        criadoEm: new Date().toLocaleDateString('pt-BR')
      }
      onAddBusinessUnit?.(newUnit)
    }
    
    onNavigate?.('unidades-negocio')
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {editingBusinessUnit ? 'Editar loja' : 'Cadastro de loja'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Empresa</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Razão social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.razaoSocial}
                    onChange={(e) => {
                      setFormData({ ...formData, razaoSocial: e.target.value })
                      setErrors({ ...errors, razaoSocial: false })
                    }}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.razaoSocial && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Nome da loja <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.nomeUnidade}
                    onChange={(e) => {
                      setFormData({ ...formData, nomeUnidade: e.target.value })
                      setErrors({ ...errors, nomeUnidade: false })
                    }}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.nomeUnidade && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    CNPJ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.cnpj}
                    onChange={handleCnpjChange}
                    maxLength={18}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.cnpj && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">Inscrição estadual</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.inscricaoEstadual}
                    onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">Inscrição municipal</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.inscricaoMunicipal}
                    onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">Ramo de atividade</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.ramoAtividade}
                    onChange={(e) => setFormData({ ...formData, ramoAtividade: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contato</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.telefone && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    CEP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.cep}
                    onChange={handleCepChange}
                    maxLength={9}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.cep && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Endereço <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.endereco}
                    onChange={(e) => {
                      setFormData({ ...formData, endereco: e.target.value })
                      setErrors({ ...errors, endereco: false })
                    }}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.endereco && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Número <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Digite"
                      value={formData.numero}
                      onChange={(e) => {
                        setFormData({ ...formData, numero: e.target.value })
                        setErrors({ ...errors, numero: false })
                      }}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                    />
                    {errors.numero && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Complemento</label>
                    <input
                      type="text"
                      placeholder="Digite"
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Bairro <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Digite"
                      value={formData.bairro}
                      onChange={(e) => {
                        setFormData({ ...formData, bairro: e.target.value })
                        setErrors({ ...errors, bairro: false })
                      }}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                    />
                    {errors.bairro && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Digite"
                      value={formData.estado}
                      onChange={(e) => {
                        setFormData({ ...formData, estado: e.target.value })
                        setErrors({ ...errors, estado: false })
                      }}
                      maxLength={2}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                    />
                    {errors.estado && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Cidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Digite"
                      value={formData.cidade}
                      onChange={(e) => {
                        setFormData({ ...formData, cidade: e.target.value })
                        setErrors({ ...errors, cidade: false })
                      }}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500"
                    />
                    {errors.cidade && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observação */}
          <div className="mt-8 mb-6">
            <label className="block text-gray-700 text-sm mb-2">Observação</label>
            <textarea
              placeholder="Digite"
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-gray-900 placeholder-gray-500 resize-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('unidades-negocio')}
              className="bg-gray-200 text-gray-700 px-8 py-2.5 rounded font-medium hover:bg-gray-300"
            >
              Voltar
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded font-medium hover:bg-indigo-700"
            >
              {editingBusinessUnit ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessUnitCreate
