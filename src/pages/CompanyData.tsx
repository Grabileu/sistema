import React, { useState, useEffect } from 'react'
import { formatCEP, formatCNPJ, formatPhone } from '../utils/formatters'
import { CheckCircle } from 'lucide-react'

interface CompanyDataProps {
  onNavigate?: (route: string) => void
}

const CompanyData: React.FC<CompanyDataProps> = () => {
  const [formData, setFormData] = useState(() => {
    const storedData = localStorage.getItem('companyData')
    if (storedData) {
      try {
        return JSON.parse(storedData)
      } catch {
        localStorage.removeItem('companyData')
      }
    }
    return {
      email: '',
      nomeEmpresa: '',
      razaoSocial: '',
      cnpj: '',
      inscricaoEstadual: '',
      inscricaoMunicipal: '',
      ramoAtividade: '',
      telefone: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      estado: '',
      cidade: ''
    }
  })

  const [errors, setErrors] = useState({
    email: false,
    nomeEmpresa: false,
    razaoSocial: false,
    cnpj: false,
    telefone: false,
    cep: false,
    endereco: false,
    numero: false,
    bairro: false,
    estado: false,
    cidade: false
  })

  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    localStorage.setItem('companyData', JSON.stringify(formData))
  }, [formData])

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCEP(e.target.value)
    setFormData({ ...formData, cep: value })
    setErrors({ ...errors, cep: false })

    const numericCep = value.replace(/\D/g, '')
    if (numericCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setFormData({
            ...formData,
            cep: value,
            endereco: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          })
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

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

  const handleSave = () => {
    const newErrors = {
      email: !formData.email,
      nomeEmpresa: !formData.nomeEmpresa,
      razaoSocial: !formData.razaoSocial,
      cnpj: !formData.cnpj,
      telefone: !formData.telefone,
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
    
    // Mostrar animação de sucesso
    setShowSuccess(true)
    
    // Desaparecer após 3 segundos
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Notificação de Sucesso com Animação */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-right-96 duration-500">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg p-6 flex items-center gap-4">
            <div className="animate-bounce">
              <CheckCircle className="text-green-500" size={28} />
            </div>
            <div>
              <h3 className="text-green-800 font-semibold">Sucesso!</h3>
              <p className="text-green-700 text-sm">Dados da empresa salvos com sucesso</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Editar dados da empresa</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Empresa */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Empresa</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.razaoSocial && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Nome da empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.nomeEmpresa}
                    onChange={(e) => {
                      setFormData({ ...formData, nomeEmpresa: e.target.value })
                      setErrors({ ...errors, nomeEmpresa: false })
                    }}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.nomeEmpresa && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Digite"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      setErrors({ ...errors, email: false })
                    }}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    CNPJ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.cnpj}
                    onChange={handleCnpjChange}
                    maxLength={18}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.cnpj && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Inscrição estadual</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.inscricaoEstadual}
                    onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Inscrição municipal</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.inscricaoMunicipal}
                    onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Ramo de atividade</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.ramoAtividade}
                    onChange={(e) => setFormData({ ...formData, ramoAtividade: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contato</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.telefone && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    CEP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.cep}
                    onChange={handleCepChange}
                    maxLength={9}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.endereco && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                  {errors.numero && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Complemento</label>
                  <input
                    type="text"
                    placeholder="Digite"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                    />
                    {errors.bairro && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                    />
                    {errors.estado && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded text-gray-900 placeholder-gray-500"
                    />
                    {errors.cidade && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded font-medium hover:bg-indigo-700"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyData
