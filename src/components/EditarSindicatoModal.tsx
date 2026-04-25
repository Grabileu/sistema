import React from 'react';
import { formatCurrency } from '../utils/formatters';
import Select from './Select';

type EditarSindicatoModalValues = {
  contribui: string;
  valor: string;
  nome: string;
  anexo: File | null;
};

interface EditarSindicatoModalProps {
  open: boolean;
  values: EditarSindicatoModalValues;
  onChange: (field: keyof EditarSindicatoModalValues, value: string | File | null) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const CONTRIBUI_OPTIONS = [
  { label: 'Sim', value: 'sim' },
  { label: 'Não', value: 'não' },
];

import { useEffect } from 'react';

const EditarSindicatoModal: React.FC<EditarSindicatoModalProps> = ({
  open,
  values,
  onChange,
  onClose,
  onSubmit,
}) => {
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
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-4 md:p-12 relative max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Editar dados do funcionário</h2>
          <hr className="my-4" />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>
        <div className="mb-6">
          <span className="text-indigo-700 font-bold text-lg">Sindicato</span>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Funcionário contribui?</label>
              <Select
                value={values.contribui}
                onChange={v => onChange('contribui', String(v))}
                options={CONTRIBUI_OPTIONS}
                placeholder="Selecione"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Valor em reais</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                placeholder="Digite"
                value={values.valor ? formatCurrency(Number(values.valor.replace(/\D/g, '')) / 100) : ''}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '');
                  onChange('valor', raw);
                }}
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1 font-medium">Nome do sindicato</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              placeholder="Digite"
              value={values.nome}
              onChange={e => onChange('nome', e.target.value)}
            />
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

export default EditarSindicatoModal;
