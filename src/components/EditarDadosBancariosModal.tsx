import React, { useEffect, useState } from 'react';
import Select from './Select';
import GenericEditModal from './GenericEditModal';


import {
  FORMA_PAGAMENTO_OPTIONS,
  MODALIDADE_OPTIONS,
  TIPO_CONTA_OPTIONS,
  TIPO_CHAVE_OPTIONS
} from '../constants/selectOptions';

type EditarDadosBancariosModalValues = {
  formaPagamento: string;
  modalidade: string;
  tipoConta: string;
  banco: string;
  agencia: string;
  agenciaDigito: string;
  conta: string;
  contaDigito: string;
  chavePix: string;
  tipoChave: string;
};

interface EditarDadosBancariosModalProps {
  open: boolean;
  values: EditarDadosBancariosModalValues;
  onChange: (field: keyof EditarDadosBancariosModalValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const EditarDadosBancariosModal: React.FC<EditarDadosBancariosModalProps> = ({
  open,
  values,
  onChange,
  onClose,
  onSubmit,
}) => {
  const [bancos, setBancos] = useState<{label: string, value: string}[]>([]);
  const [loadingBancos, setLoadingBancos] = useState(false);
  const [erroBancos, setErroBancos] = useState('');

  useEffect(() => {
    setLoadingBancos(true);
    setErroBancos('');
    fetch('https://brasilapi.com.br/api/banks/v1')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBancos([
            { label: 'Selecione', value: '' },
            ...data
              .filter((b: any) => b && b.code && b.name && b.code !== null && b.name !== null)
              .map((b: any) => {
                // Substitui 'BCO' isolado ou no início por 'BANCO' (case-insensitive)
                let nomeBanco = b.name.replace(/^(BCO|Bco|bco)\b|\bBCO\b|\bBco\b|\bbco\b/g, 'BANCO');
                // Remove espaços duplos que podem surgir
                nomeBanco = nomeBanco.replace(/\s{2,}/g, ' ').trim();
                return { label: `${b.code} - ${nomeBanco}`, value: b.code };
              })
          ]);
        } else {
          setErroBancos('Erro ao carregar bancos');
        }
      })
      .catch(() => setErroBancos('Erro ao carregar bancos'))
      .finally(() => setLoadingBancos(false));
  }, []);

  return (
    <GenericEditModal
      isOpen={open}
      title="Editar dados do funcionário"
      onClose={onClose}
      onSubmit={onSubmit}
      submitButtonText="Salvar alterações"
    >
        <div className="mb-6">
          <span className="text-indigo-700 font-bold text-lg">Dados bancários</span>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Forma de pagamento</label>
              <Select value={values.formaPagamento} onChange={v => onChange('formaPagamento', String(v))} options={FORMA_PAGAMENTO_OPTIONS} placeholder="Selecione" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Modalidade</label>
              <Select value={values.modalidade} onChange={v => onChange('modalidade', String(v))} options={MODALIDADE_OPTIONS} placeholder="Selecione" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Tipo de conta</label>
              <Select value={values.tipoConta} onChange={v => onChange('tipoConta', String(v))} options={TIPO_CONTA_OPTIONS} placeholder="Selecione" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Banco</label>
              {loadingBancos ? (
                <div className="text-xs text-gray-500">Carregando bancos...</div>
              ) : erroBancos ? (
                <div className="text-xs text-red-500">{erroBancos}</div>
              ) : (
                <Select
                  value={values.banco}
                  onChange={v => {
                    onChange('banco', String(v));
                  }}
                  options={bancos}
                  placeholder="Selecione"
                  showSearchBar={bancos.length > 15}
                />
              )}
            </div>
            {/* Agência + Dígito */}
            <div className="flex gap-2 col-span-2">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm mb-1 font-medium">Agência</label>
                <input type="text" value={values.agencia} onChange={e => onChange('agencia', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" placeholder="Digite" />
              </div>
              <div className="w-24">
                <label className="block text-gray-700 text-sm mb-1 font-medium">Dígito</label>
                <input type="text" value={values.agenciaDigito} onChange={e => onChange('agenciaDigito', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" placeholder="0" />
              </div>
            </div>
            {/* Conta + Dígito */}
            <div className="flex gap-2 col-span-2">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm mb-1 font-medium">Conta</label>
                <input type="text" value={values.conta} onChange={e => onChange('conta', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" placeholder="Digite" />
              </div>
              <div className="w-24">
                <label className="block text-gray-700 text-sm mb-1 font-medium">Dígito</label>
                <input type="text" value={values.contaDigito} onChange={e => onChange('contaDigito', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" placeholder="0" />
              </div>
            </div>
            <div className="flex gap-2 col-span-2">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm mb-1 font-medium">Chave PIX</label>
                <input type="text" value={values.chavePix} onChange={e => onChange('chavePix', e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" placeholder="Digite" />
              </div>
              <div className="w-56">
                <label className="block text-gray-700 text-sm mb-1 font-medium">Tipo da chave</label>
                <Select value={values.tipoChave} onChange={v => onChange('tipoChave', String(v))} options={TIPO_CHAVE_OPTIONS} placeholder="Selecione" />
              </div>
            </div>
          </div>
        </form>
    </GenericEditModal>
  );
};

export default EditarDadosBancariosModal;
