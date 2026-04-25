import React from 'react';
import { ESCOLARIDADE_OPTIONS } from '../constants/selectOptions';
import DatePicker from './DatePicker';
import Select from './Select';

type EditarFormacaoModalValues = {
  escolaridade: string;
  conclusao: string;
  areasFormacao: string;
};

interface EditarFormacaoModalProps {
  open: boolean;
  values: EditarFormacaoModalValues;
  onChange: (field: keyof EditarFormacaoModalValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

import { useEffect } from 'react';

const EditarFormacaoModal: React.FC<EditarFormacaoModalProps> = ({ open, values, onChange, onClose, onSubmit }) => {
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
      <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-4 md:p-8 relative max-h-[90vh] overflow-visible">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Editar formação</h2>
          <hr className="my-4" />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="mb-6">
            <span className="text-indigo-700 font-bold text-lg">Formação</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Escolaridade</label>
              <Select
                value={values.escolaridade}
                onChange={v => onChange('escolaridade', String(v))}
                options={ESCOLARIDADE_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Data de conclusão</label>
              <DatePicker
                value={values.conclusao}
                onChange={v => onChange('conclusao', v)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm mb-1 font-medium">Área(s) de formação</label>
              <input
                type="text"
                value={values.areasFormacao}
                onChange={e => onChange('areasFormacao', e.target.value)}
                placeholder="Separe por vírgulas"
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              />
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

export default EditarFormacaoModal;
