import React from 'react';
import {
  VINCULO_OPTIONS,
  PRIMEIRO_EMPREGO_OPTIONS,
  CARGO_CONFIANCA_OPTIONS,
  FREQUENCIA_PAGAMENTO_OPTIONS,
  ESTABILIDADE_OPTIONS,
  SEGURO_DESEMPREGO_OPTIONS,
  APOSENTADO_OPTIONS
} from '../constants/selectOptions';
import DatePicker from './DatePicker';
import Select from './Select';
import { formatCurrency } from '../utils/formatters';
import { maskPISPasep, maskCarteiraTrabalho } from '../utils/masks';

type EditarProfissionalModalValues = {
  vinculo: string;
  cargo: string;
  equipe: string;
  turno: string;
  departamento: string;
  unidadeNegocio: string;
  primeiroEmprego: string;
  cargoConfianca: string;
  remuneracao: string;
  frequenciaPagamento: string;
  mesmoSalarioDesde: string;
  estabilidade: string;
  seguroDesemprego: string;
  aposentado: string;
  dataAdmissao: string;
  pisPasep: string;
  carteiraTrabalho: string;
  registroProfissional: string;
  loja: string;
  dataExameAdmissional: string;
};

interface EditarProfissionalModalProps {
  open: boolean;
  values: EditarProfissionalModalValues;
  onChange: (field: keyof EditarProfissionalModalValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  funcionarioView: any;
}

import { useEffect } from 'react';

const EditarProfissionalModal: React.FC<EditarProfissionalModalProps> = ({ open, values, onChange, onClose, onSubmit, funcionarioView }) => {
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
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-4 md:p-8 relative max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Editar dados do funcionário</h2>
          <hr className="my-4" />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="mb-6">
            <span className="text-indigo-700 font-bold text-lg">Informações profissionais</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Código/Matrícula *</label>
              <input type="text" value={funcionarioView?.matricula || ''} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Data de admissão *</label>
              <DatePicker
                value={values.dataAdmissao}
                onChange={v => onChange('dataAdmissao', v)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Data de início</label>
              <DatePicker
                value={funcionarioView?.dataInicio || funcionarioView?.dataAdmissao || ''}
                onChange={() => {}}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed opacity-70"
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Data do exame admissional</label>
              <DatePicker
                value={values.dataExameAdmissional || funcionarioView?.dataExameAdmissional || ''}
                onChange={v => onChange('dataExameAdmissional', v)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">PIS/PASEP</label>
              <input type="text" value={values.pisPasep} onChange={e => onChange('pisPasep', maskPISPasep(e.target.value))} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Nº Carteira de Trabalho</label>
              <input type="text" value={values.carteiraTrabalho} onChange={e => onChange('carteiraTrabalho', maskCarteiraTrabalho(e.target.value))} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Registro profissional</label>
              <input type="text" value={values.registroProfissional} onChange={e => onChange('registroProfissional', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
            </div>
          </div>
          <div className="mb-6">
            <span className="text-indigo-700 font-bold text-lg">Dados da ocupação</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Vínculo</label>
              <Select
                value={values.vinculo}
                onChange={v => onChange('vinculo', String(v))}
                options={VINCULO_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Cargo *</label>
              <input
                type="text"
                value={funcionarioView?.cargo || ''}
                readOnly
                disabled
                tabIndex={-1}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed opacity-70"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Equipe *</label>
              <input
                type="text"
                value={funcionarioView?.equipe || ''}
                readOnly
                disabled
                tabIndex={-1}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed opacity-70"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Turno *</label>
              <input
                type="text"
                value={funcionarioView?.turno || ''}
                readOnly
                disabled
                tabIndex={-1}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed opacity-70"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Departamento *</label>
              <input
                type="text"
                value={funcionarioView?.departamento || ''}
                readOnly
                disabled
                tabIndex={-1}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed opacity-70"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Loja</label>
              <input
                type="text"
                value={funcionarioView?.loja || ''}
                readOnly
                disabled
                tabIndex={-1}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed opacity-70"
              />
            </div>
            <div className="col-span-full">
              <span className="text-xs text-gray-500 italic">Esses campos só podem ser editados na tela de cadastro do funcionário.</span>
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Primeiro emprego</label>
              <Select value={values.primeiroEmprego} onChange={v => onChange('primeiroEmprego', String(v))} options={PRIMEIRO_EMPREGO_OPTIONS} />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Cargo de confiança</label>
              <Select value={values.cargoConfianca} onChange={v => onChange('cargoConfianca', String(v))} options={CARGO_CONFIANCA_OPTIONS} />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Remuneração</label>
              <input
                type="text"
                value={values.remuneracao ? formatCurrency(Number(values.remuneracao.replace(/\D/g, '')) / 100) : ''}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '');
                  onChange('remuneracao', raw);
                }}
                inputMode="numeric"
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Frequência de pagamento</label>
              <Select
                value={values.frequenciaPagamento}
                onChange={v => onChange('frequenciaPagamento', String(v))}
                options={FREQUENCIA_PAGAMENTO_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Mesmo salário desde</label>
              <DatePicker
                value={values.mesmoSalarioDesde}
                onChange={v => onChange('mesmoSalarioDesde', v)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Estabilidade</label>
              <Select
                value={values.estabilidade}
                onChange={v => onChange('estabilidade', String(v))}
                options={ESTABILIDADE_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Tem seguro desemprego?</label>
              <Select value={values.seguroDesemprego} onChange={v => onChange('seguroDesemprego', String(v))} options={SEGURO_DESEMPREGO_OPTIONS} />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Aposentado?</label>
              <Select value={values.aposentado} onChange={v => onChange('aposentado', String(v))} options={APOSENTADO_OPTIONS} />
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

export default EditarProfissionalModal;
