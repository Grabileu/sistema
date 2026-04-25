import React from 'react';
import DatePicker from './DatePicker';
import Select from './Select';

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

import { useEffect } from 'react';

const EditarPeriodoExperienciaModal: React.FC<EditarPeriodoExperienciaModalProps> = ({
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
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-4 md:p-10 relative max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Editar dados do funcionário</h2>
          <hr className="my-4" />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>
        <div className="mb-6">
          <span className="text-indigo-700 font-bold text-lg">Período de experiência</span>
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
          <div className="flex flex-col gap-2 mt-8">
            <button type="submit" className="w-full py-2 rounded bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition text-xs">Salvar alterações</button>
            <button type="button" className="w-full py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-xs" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPeriodoExperienciaModal;
