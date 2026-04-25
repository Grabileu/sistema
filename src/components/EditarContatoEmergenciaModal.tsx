import React from 'react';
import { maskCelular, maskTelefone } from '../utils/masks';
import Select from './Select';

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

import { useEffect } from 'react';

const EditarContatoEmergenciaModal: React.FC<EditarContatoEmergenciaModalProps> = ({ open, values, onChange, onClose, onSubmit, RemoverBotao, onRemover }) => {
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
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Editar dados do funcionário</h2>
        <hr className="my-4" />
        <div className="text-indigo-700 font-bold text-base mb-2 cursor-pointer">Contatos de emergência</div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="mb-4 border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-gray-800">Contato 1</div>
              {RemoverBotao && onRemover && (
                <button type="button" className="text-red-500 text-sm flex items-center gap-1" onClick={onRemover}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remover
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Nome</label>
                <input
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
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
                  options={RELACAO_OPTIONS}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Celular</label>
                <input
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                  value={maskCelular(values.celular)}
                  onChange={e => onChange('celular', maskCelular(e.target.value))}
                  placeholder="(99) 99999-9999"
                  maxLength={15}
                  inputMode="tel"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1 font-medium">Telefone</label>
                <input
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                  value={maskTelefone(values.telefone)}
                  onChange={e => onChange('telefone', maskTelefone(e.target.value))}
                  placeholder="(99) 9999-9999"
                  maxLength={14}
                  inputMode="tel"
                />
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-sm mb-1 font-medium">E-mail</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={values.email}
                onChange={e => onChange('email', e.target.value)}
                placeholder="Digite"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-8">
            <button type="submit" className="w-full py-2 rounded bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition text-xs">Salvar alterações</button>
            <button type="button" className="w-full py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-xs" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarContatoEmergenciaModal;
