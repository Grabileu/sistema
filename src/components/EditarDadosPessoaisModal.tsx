import React from 'react'
import Select from './Select'
import DatePicker from './DatePicker'
import { COR_RACA_OPTIONS, GENERO_OPTIONS, ESTADO_CIVIL_OPTIONS, CATEGORIA_CNH_OPTIONS } from '../constants/selectOptions'
import { formatCPF } from '../utils/formatters'
import GenericEditModal from './GenericEditModal'

type EditarDadosPessoaisModalValues = {
  nomeCompleto: string
  cpf: string
  rg: string
  corRaca: string
  genero: string
  estadoCivil: string
  categoria: string
  mae: string
  pai: string
  nacionalidade: string
  paisNascimento: string
  estadoNascimento: string
  cidadeNascimento: string
  cnh: string
  obsGerais: string
  dataNascimento: string
}

interface EditarDadosPessoaisModalProps {
  open: boolean
  onClose: () => void
  values: EditarDadosPessoaisModalValues
  onChange: (field: keyof EditarDadosPessoaisModalValues, value: string) => void
  onSubmit: () => void
}

const EditarDadosPessoaisModal: React.FC<EditarDadosPessoaisModalProps> = ({ open, onClose, values, onChange, onSubmit }) => {
  return (
    <GenericEditModal
      isOpen={open}
      title="Editar dados do funcionário"
      onClose={onClose}
      onSubmit={onSubmit}
      submitButtonText="Salvar alterações"
    >
      <div className="space-y-4">
        <div className="mb-1 border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900">Informações pessoais</h3>
          <p className="mt-1 text-xs text-slate-500">Revise e atualize os dados principais do colaborador.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Nome completo */}
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm mb-1 font-medium">Nome completo <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={values.nomeCompleto} 
              onChange={e => onChange('nomeCompleto', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" 
            />
          </div>

          {/* CPF */}
          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">CPF <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={values.cpf}
              onChange={e => onChange('cpf', formatCPF(e.target.value))}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              maxLength={14}
            />
          </div>

          {/* RG */}
          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">RG</label>
            <input 
              type="text" 
              value={values.rg} 
              onChange={e => onChange('rg', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" 
            />
          </div>

          {/* Cor/Raça */}
          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">Cor/Raça</label>
            <Select value={values.corRaca} onChange={v => onChange('corRaca', String(v))} options={COR_RACA_OPTIONS} />
          </div>

          {/* Gênero */}
          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">Gênero <span className="text-red-500">*</span></label>
            <Select value={values.genero} onChange={v => onChange('genero', String(v))} options={GENERO_OPTIONS} />
          </div>

          {/* Data de nascimento */}
          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">Data de nascimento <span className="text-red-500">*</span></label>
            <DatePicker value={values.dataNascimento} onChange={v => onChange('dataNascimento', v)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
          </div>

          {/* Estado civil */}
          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">Estado civil</label>
            <Select value={values.estadoCivil} onChange={v => onChange('estadoCivil', String(v))} options={ESTADO_CIVIL_OPTIONS} />
          </div>

          {/* CNH */}
          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">CNH</label>
            <input 
              type="text" 
              value={values.cnh} 
              onChange={e => onChange('cnh', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" 
            />
          </div>

          {/* Categoria CNH */}
          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">Categoria</label>
            <Select value={values.categoria} onChange={v => onChange('categoria', String(v))} options={CATEGORIA_CNH_OPTIONS} />
          </div>

          {/* Nacionalidade */}
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm mb-1 font-medium">Nacionalidade</label>
            <input 
              type="text" 
              value={values.nacionalidade} 
              onChange={e => onChange('nacionalidade', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" 
            />
          </div>

          {/* Mãe e Pai */}
          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">Nome da mãe</label>
            <input 
              type="text" 
              value={values.mae} 
              onChange={e => onChange('mae', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" 
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1 font-medium">Nome do pai</label>
            <input 
              type="text" 
              value={values.pai} 
              onChange={e => onChange('pai', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" 
            />
          </div>

          {/* Nascimento - País, Estado, Cidade */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">País que nasceu</label>
              <input 
                type="text" 
                value={values.paisNascimento} 
                onChange={e => onChange('paisNascimento', e.target.value)} 
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" 
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Estado que nasceu</label>
              <input 
                type="text" 
                value={values.estadoNascimento} 
                onChange={e => onChange('estadoNascimento', e.target.value)} 
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" 
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Cidade que nasceu</label>
              <input 
                type="text" 
                value={values.cidadeNascimento} 
                onChange={e => onChange('cidadeNascimento', e.target.value)} 
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" 
              />
            </div>
          </div>

          {/* Observações */}
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm mb-1 font-medium">Observações gerais</label>
            <textarea 
              value={values.obsGerais} 
              onChange={e => onChange('obsGerais', e.target.value)} 
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm min-h-[60px]" 
            />
          </div>
        </div>
      </div>
    </GenericEditModal>
  )
}

export default EditarDadosPessoaisModal
