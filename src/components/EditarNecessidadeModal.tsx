import React from 'react';
import { NECESSIDADE_ESPECIAL_OPTIONS, TIPO_NECESSIDADE_OPTIONS } from '../constants/selectOptions';
import Select from './Select';
import GenericEditModal from './GenericEditModal';

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

const EditarNecessidadeModal: React.FC<EditarNecessidadeModalProps> = ({ open, values, onChange, onClose, onSubmit }) => {
  return (
    <GenericEditModal
      isOpen={open}
      title="Editar necessidades especiais"
      onClose={onClose}
      onSubmit={onSubmit}
      submitButtonText="Salvar alterações"
    >
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
        </form>
    </GenericEditModal>
  );
};

export default EditarNecessidadeModal;
