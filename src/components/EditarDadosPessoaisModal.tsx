import React from 'react';
import Select from './Select';
import DatePicker from './DatePicker';
import { COR_RACA_OPTIONS, GENERO_OPTIONS, ESTADO_CIVIL_OPTIONS, CATEGORIA_CNH_OPTIONS } from '../constants/selectOptions';
import { formatCPF } from '../utils/formatters';

type EditarDadosPessoaisModalValues = {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  corRaca: string;
  genero: string;
  estadoCivil: string;
  categoria: string;
  mae: string;
  pai: string;
  nacionalidade: string;
  paisNascimento: string;
  estadoNascimento: string;
  cidadeNascimento: string;
  cnh: string;
  obsGerais: string;
  dataNascimento: string;
};

interface EditarDadosPessoaisModalProps {
  open: boolean;
  onClose: () => void;
  values: EditarDadosPessoaisModalValues;
  onChange: (field: keyof EditarDadosPessoaisModalValues, value: string) => void;
  onSubmit: () => void;
}

import { useEffect } from 'react';

const EditarDadosPessoaisModal: React.FC<EditarDadosPessoaisModalProps> = ({ open, onClose, values, onChange, onSubmit }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-4 md:p-8 relative max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Editar dados do funcionário</h2>
          <hr className="my-4" />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>
        <div className="mb-6">
          <span className="text-indigo-700 font-bold text-lg">Informações pessoais</span>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm mb-1 font-medium">Nome completo <span className="text-red-500">*</span></label>
              <input type="text" value={values.nomeCompleto} onChange={e => onChange('nomeCompleto', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
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
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">RG</label>
              <input type="text" value={values.rg} onChange={e => onChange('rg', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Cor/Raça</label>
              <Select value={values.corRaca} onChange={v => onChange('corRaca', String(v))} options={COR_RACA_OPTIONS} />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Gênero <span className="text-red-500">*</span></label>
              <Select value={values.genero} onChange={v => onChange('genero', String(v))} options={GENERO_OPTIONS} />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Data de nascimento <span className="text-red-500">*</span></label>
              <DatePicker value={values.dataNascimento} onChange={v => onChange('dataNascimento', v)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Estado civil</label>
              <Select value={values.estadoCivil} onChange={v => onChange('estadoCivil', String(v))} options={ESTADO_CIVIL_OPTIONS} />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">CNH</label>
              <input type="text" value={values.cnh} onChange={e => onChange('cnh', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Categoria</label>
              <Select value={values.categoria} onChange={v => onChange('categoria', String(v))} options={CATEGORIA_CNH_OPTIONS} />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm mb-1 font-medium">Nacionalidade</label>
              <input type="text" value={values.nacionalidade} onChange={e => onChange('nacionalidade', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Nome da mãe</label>
              <input type="text" value={values.mae} onChange={e => onChange('mae', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Nome do pai</label>
              <input type="text" value={values.pai} onChange={e => onChange('pai', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">País que nasceu</label>
                <input type="text" value={values.paisNascimento} onChange={e => onChange('paisNascimento', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Estado que nasceu</label>
                <input type="text" value={values.estadoNascimento} onChange={e => onChange('estadoNascimento', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Cidade que nasceu</label>
                <input type="text" value={values.cidadeNascimento} onChange={e => onChange('cidadeNascimento', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm mb-1 font-medium">Observações gerais</label>
              <textarea value={values.obsGerais} onChange={e => onChange('obsGerais', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm min-h-[60px]" />
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex flex-col gap-2 mt-8">
              <button type="submit" className="w-full py-2 rounded bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition text-xs">Salvar alterações</button>
              <button type="button" className="w-full py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-xs" onClick={onClose}>Cancelar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarDadosPessoaisModal;
