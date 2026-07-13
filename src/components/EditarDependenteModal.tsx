import React from 'react';
import Select from './Select';
import DatePicker from './DatePicker';
import { formatCPF } from '../utils/formatters';
import { maskCelular } from '../utils/masks';
import GenericEditModal from './GenericEditModal';

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

  return (
    <GenericEditModal
      isOpen={open}
      title="Editar dados do dependente"
      onClose={onClose}
      onSubmit={onSubmit}
      submitButtonText="Salvar alterações"
    >
      <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75a4.25 4.25 0 110 8.5 4.25 4.25 0 010-8.5zM6.75 20.25a5.25 5.25 0 0110.5 0" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Edite os dados do dependente</h3>
            <p className="mt-1 text-sm text-slate-500">Atualize as informações do dependente para manter tudo alinhado.</p>
          </div>
        </div>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Dependente</div>
                <p className="text-xs text-slate-500">{`Dependente ${index !== undefined ? index + 1 : ''}`.trim()}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Nome</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={values.nome}
                  onChange={e => onChange('nome', e.target.value)}
                  placeholder="Digite"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Relação</label>
                <Select
                  value={values.relacao}
                  onChange={v => onChange('relacao', String(v))}
                  options={RELACOES}
                  buttonClassName="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Data de nascimento</label>
                <DatePicker
                  value={values.dataNascimento}
                  onChange={v => onChange('dataNascimento', v)}
                  placeholder="DD/MM/AAAA"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Nome da mãe</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={values.nomeMae}
                  onChange={e => onChange('nomeMae', e.target.value)}
                  placeholder="Digite"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">CPF</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={formatCPF(values.cpf)}
                  onChange={e => onChange('cpf', formatCPF(e.target.value))}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Telefone</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={maskCelular(values.telefone)}
                  onChange={e => onChange('telefone', maskCelular(e.target.value))}
                  placeholder="(99) 99999-9999"
                  maxLength={15}
                  inputMode="tel"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm mb-1 font-medium">E-mail</label>
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={values.email}
                onChange={e => onChange('email', e.target.value)}
                placeholder="Digite"
              />
            </div>
            <div className="md:col-span-2 mt-4">
              <label className="block text-gray-700 text-sm mb-1 font-medium">Observações</label>
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={values.observacoes}
                onChange={e => onChange('observacoes', e.target.value)}
                placeholder="Digite"
              />
            </div>
          </div>
        </div>
      </form>
    </GenericEditModal>
  )
}
