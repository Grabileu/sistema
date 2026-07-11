import React from 'react';
import { formatCurrency } from '../utils/formatters';
import Select from './Select';
import GenericEditModal from './GenericEditModal';

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

const EditarSindicatoModal: React.FC<EditarSindicatoModalProps> = ({
  open,
  values,
  onChange,
  onClose,
  onSubmit,
}) => {
  return (
    <GenericEditModal
      isOpen={open}
      title="Editar dados do funcionário"
      onClose={onClose}
      onSubmit={onSubmit}
      submitButtonText="Salvar alterações"
    >
        <div className="mb-6 border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900">Sindicato</h3>
          <p className="mt-1 text-xs text-slate-500">Informações de contribuição e entidade sindical.</p>
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
        </form>
    </GenericEditModal>
  );
};

export default EditarSindicatoModal;
