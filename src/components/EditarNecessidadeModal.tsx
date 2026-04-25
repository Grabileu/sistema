import React from 'react';
import { NECESSIDADE_ESPECIAL_OPTIONS, TIPO_NECESSIDADE_OPTIONS } from '../constants/selectOptions';
import Select from './Select';

type EditarNecessidadeModalValues = {
  necessidadeEspecial: string;
  tipoNecessidade: string;
  obsNecessidade: string;
};

interface EditarNecessidadeModalProps {
  open: boolean;
  values: EditarNecessidadeModalValues;
  onChange: (field: keyof EditarNecessidadeModalValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

import { useEffect } from 'react';

const EditarNecessidadeModal: React.FC<EditarNecessidadeModalProps> = ({ open, values, onChange, onClose, onSubmit }) => {
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
          <h2 className="text-2xl font-semibold text-gray-900">Editar necessidades especiais</h2>
          <hr className="my-4" />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="mb-6">
            <span className="text-indigo-700 font-bold text-lg">Necessidades especiais</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Portador de necessidades especiais?</label>
              <Select
                value={values.necessidadeEspecial || 'não'}
                onChange={v => onChange('necessidadeEspecial', String(v))}
                options={NECESSIDADE_ESPECIAL_OPTIONS}
              />
            </div>
            {values.necessidadeEspecial === 'sim' && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Tipo</label>
                  <Select
                    value={values.tipoNecessidade || ''}
                    onChange={v => onChange('tipoNecessidade', String(v))}
                    options={TIPO_NECESSIDADE_OPTIONS}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Observações sobre necessidades especiais</label>
                  <textarea
                    value={values.obsNecessidade || ''}
                    onChange={e => onChange('obsNecessidade', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm min-h-[60px]"
                    placeholder="Digite"
                  />
                </div>
              </>
            )}
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

export default EditarNecessidadeModal;
