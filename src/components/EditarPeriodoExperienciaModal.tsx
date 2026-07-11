import React from 'react';
import DatePicker from './DatePicker';
import Select from './Select';
import GenericEditModal from './GenericEditModal';

const PERIODO_EXPERIENCIA_OPTIONS = [
  { label: 'Nenhum', value: '' },
  { label: '1 a 30 dias', value: '30' },
  { label: '1 a 45 dias', value: '45' },
  { label: '1 a 60 dias', value: '60' },
  { label: '1 a 90 dias', value: '90' },
];

type EditarPeriodoExperienciaModalValues = {
  periodo: string;
  dataInicio: string;
  dataTermino: string;
};

interface EditarPeriodoExperienciaModalProps {
  open: boolean;
  values: EditarPeriodoExperienciaModalValues;
  onChange: (field: keyof EditarPeriodoExperienciaModalValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const EditarPeriodoExperienciaModal: React.FC<EditarPeriodoExperienciaModalProps> = ({
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
          <h3 className="text-base font-semibold text-slate-900">Período de experiência</h3>
          <p className="mt-1 text-xs text-slate-500">Defina o período e as datas de vigência.</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1 font-medium">Período</label>
            <Select value={values.periodo} onChange={v => onChange('periodo', String(v))} options={PERIODO_EXPERIENCIA_OPTIONS} placeholder="Selecione" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Data de início</label>
              <DatePicker value={values.dataInicio} onChange={v => onChange('dataInicio', v)} />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Data de término</label>
              <DatePicker value={values.dataTermino} onChange={v => onChange('dataTermino', v)} />
            </div>
          </div>
        </form>
    </GenericEditModal>
  );
};

export default EditarPeriodoExperienciaModal;
