import React, { useEffect, useState } from 'react';
import Select from './Select';


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


  // Impede rolagem do body quando o modal de edição bancária está aberto
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

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-4 md:p-8 relative max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Editar dados do funcionário</h2>
          <hr className="my-4" />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>
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
                    const bancoSelecionado = bancos.find(b => b.value === String(v));
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

export default EditarDadosBancariosModal;
