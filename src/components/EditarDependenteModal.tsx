import React from 'react';
import Select from './Select';
import DatePicker from './DatePicker';
import { formatCPF } from '../utils/formatters';
import { maskCelular, maskTelefone } from '../utils/masks';

interface Dependente {
  nome: string;
  relacao: string;
  dataNascimento: string;
  nomeMae: string;
  cpf: string;
  telefone: string;
  email: string;
  observacoes: string;
}

interface EditarDependenteModalProps {
  open: boolean;
  values: Dependente;
  onChange: (field: keyof Dependente, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  onRemover?: () => void;
  RemoverBotao?: boolean;
  index?: number;
}

const RELACOES = [
  { label: 'Selecione', value: '' },
  { label: 'Pai', value: 'Pai' },
  { label: 'Mãe', value: 'Mãe' },
  { label: 'Avô/Avó', value: 'Avô/Avó' },
  { label: 'Esposo(a)', value: 'Esposo(a)' },
  { label: 'Filho(a)', value: 'Filho(a)' },
  { label: 'Irmão(ã)', value: 'Irmão(ã)' },
  { label: 'Outro', value: 'Outro' },
];

import { useEffect } from 'react';

export default function EditarDependenteModal({
  open,
  values,
  onChange,
  onClose,
  onSubmit,
  onRemover,
  RemoverBotao,
  index
}: EditarDependenteModalProps) {
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Fechar"
        >×</button>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Editar dados do funcionário</h2>
        <hr className="my-4" />
        <div className="text-indigo-700 font-bold text-lg mb-2">Dependentes</div>
        <div className="font-bold text-gray-700 mb-4">Dependente {index !== undefined ? index + 1 : ''}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              value={values.nome}
              onChange={e => onChange('nome', e.target.value)}
              placeholder="Digite"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Relação</label>
            <Select
              value={values.relacao}
              onChange={v => onChange('relacao', String(v))}
              options={RELACOES}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Data de nascimento</label>
            <DatePicker
              value={values.dataNascimento}
              onChange={v => onChange('dataNascimento', v)}
              placeholder="DD/MM/AAAA"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nome da mãe</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              value={values.nomeMae}
              onChange={e => onChange('nomeMae', e.target.value)}
              placeholder="Digite"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">CPF</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              value={formatCPF(values.cpf)}
              onChange={e => onChange('cpf', formatCPF(e.target.value))}
              maxLength={14}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              value={maskCelular(values.telefone)}
              onChange={e => onChange('telefone', maskCelular(e.target.value))}
              placeholder="(99) 99999-9999"
              maxLength={15}
              inputMode="tel"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              value={values.email}
              onChange={e => onChange('email', e.target.value)}
              placeholder="Digite"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              value={values.observacoes}
              onChange={e => onChange('observacoes', e.target.value)}
              placeholder="Digite"
            />
          </div>
        </div>
        <div className="flex flex-col mt-8 gap-2">
          <button className="w-full py-2 rounded bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition text-xs" onClick={onSubmit}>Salvar alterações</button>
          <button className="w-full py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-xs" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
