import React from 'react';
import { ESCOLARIDADE_OPTIONS } from '../constants/selectOptions';
import DatePicker from './DatePicker';
import Select from './Select';
import GenericEditModal from './GenericEditModal';

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

const EditarFormacaoModal: React.FC<EditarFormacaoModalProps> = ({ open, values, onChange, onClose, onSubmit }) => {
  return (
    <GenericEditModal
      isOpen={open}
      title="Editar formação"
      onClose={onClose}
      onSubmit={onSubmit}
      submitButtonText="Salvar alterações"
    >
      <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="mb-6 border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900">Formação</h3>
            <p className="mt-1 text-xs text-slate-500">Dados acadêmicos e de capacitação do colaborador.</p>
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
        </form>
    </GenericEditModal>
  );
};

export default EditarFormacaoModal;
