import React, { useState } from 'react';
import { maskCelular, maskTelefone } from '../utils/masks';
import Select from './Select';
import GenericEditModal from './GenericEditModal';

interface ContatoEmergencia {
  nome: string;
  relacao: string;
  celular: string;
  telefone: string;
  email: string;
}

interface EditarContatoEmergenciaModalProps {
  open: boolean;
  values: ContatoEmergencia;
  onChange: (field: keyof ContatoEmergencia, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  RemoverBotao?: boolean;
  onRemover?: () => void;
}

const RELACAO_OPTIONS = [
  { label: 'Selecione', value: '' },
  { label: 'Pai', value: 'Pai' },
  { label: 'Mãe', value: 'Mãe' },
  { label: 'Avô/Avó', value: 'Avô/Avó' },
  { label: 'Esposo(a)', value: 'Esposo(a)' },
  { label: 'Filho(a)', value: 'Filho(a)' },
  { label: 'Irmão(ã)', value: 'Irmão(ã)' },
  { label: 'Outro', value: 'Outro' },
];

const EditarContatoEmergenciaModal: React.FC<EditarContatoEmergenciaModalProps> = ({ open, values, onChange, onClose, onSubmit, RemoverBotao, onRemover }) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const celularInvalido = hasSubmitted && values.celular.replace(/\D/g, '').length < 11;

  const handleSubmit = () => {
    setHasSubmitted(true);
    if (values.celular.replace(/\D/g, '').length < 11) {
      return;
    }
    onSubmit();
  };

  return (
    <GenericEditModal
      isOpen={open}
      title="Contato de emergência"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitButtonText="Salvar contato"
      cancelButtonText="Cancelar"
    >
      <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75a4.25 4.25 0 110 8.5 4.25 4.25 0 010-8.5zM6.75 20.25a5.25 5.25 0 0110.5 0" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Organize contatos de emergência</h3>
            <p className="mt-1 text-sm text-slate-500">Preencha os dados para permitir acionamento rápido em caso de urgência.</p>
          </div>
        </div>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Contato de emergência</div>
                <p className="text-xs text-slate-500">Insira dados completos para contato prioritário.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Nome</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={values.nome}
                  onChange={e => onChange('nome', e.target.value)}
                  placeholder="Digite o nome"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Relação</label>
                <Select
                  value={values.relacao}
                  onChange={v => onChange('relacao', String(v))}
                  options={RELACAO_OPTIONS}
                  buttonClassName="h-12"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">
                  Celular <span className="text-red-600">*</span>
                </label>
                <input
                  className={`w-full rounded-2xl border bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${celularInvalido ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-300 focus:ring-indigo-100'}`}
                  value={maskCelular(values.celular)}
                  onChange={e => onChange('celular', maskCelular(e.target.value))}
                  placeholder="(99) 99999-9999"
                  maxLength={15}
                  inputMode="tel"
                />
                {celularInvalido && (
                  <p className="mt-1 text-sm text-red-600">O celular é obrigatório e deve ter 11 dígitos.</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Telefone</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  value={maskTelefone(values.telefone)}
                  onChange={e => onChange('telefone', maskTelefone(e.target.value))}
                  placeholder="(99) 9999-9999"
                  maxLength={14}
                  inputMode="tel"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm mb-1 font-medium">E-mail</label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                value={values.email}
                onChange={e => onChange('email', e.target.value)}
                placeholder="Digite o e-mail"
              />
            </div>
          </div>
        </div>
      </form>
    </GenericEditModal>
  );
};

export default EditarContatoEmergenciaModal;
