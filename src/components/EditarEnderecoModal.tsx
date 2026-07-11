import React, { useRef, useState } from 'react';
import { buscarEnderecoPorCep } from '../utils/cep';
import GenericEditModal from './GenericEditModal';

type EditarEnderecoModalValues = {
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
};

interface EditarEnderecoModalProps {
  open: boolean;
  values: EditarEnderecoModalValues;
  onChange: (field: keyof EditarEnderecoModalValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const EditarEnderecoModal: React.FC<EditarEnderecoModalProps> = ({ open, values, onChange, onClose, onSubmit }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [touched, setTouched] = useState(false);

  // Função para formatar e buscar endereço ao digitar o CEP
  const handleCepChange = (cep: string) => {
    // Formatar para #####-###
    let digits = cep.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 5) {
      formatted = digits.slice(0, 5) + '-' + digits.slice(5);
    }
    onChange('cep', formatted);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (digits.length === 8) {
      timeoutRef.current = setTimeout(async () => {
        const data = await buscarEnderecoPorCep(formatted);
        if (data) {
          onChange('endereco', data.endereco);
          onChange('bairro', data.bairro);
          onChange('cidade', data.cidade);
          onChange('estado', data.estado);
          onChange('pais', data.pais);
        }
      }, 300);
    }
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!values.cep || values.cep.replace(/\D/g, '').length !== 8) {
      return;
    }
    onSubmit();
  };

  return (
    <GenericEditModal
      isOpen={open}
      title="Editar dados do funcionário"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitButtonText="Salvar alterações"
    >
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-base font-semibold text-slate-900">Endereço</h3>
        <p className="mt-1 text-xs text-slate-500">Atualize os dados de localização e residência.</p>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
          <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm mb-1 font-medium">CEP<span className="text-red-500">*</span></label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={values.cep}
                onChange={e => {
                  handleCepChange(e.target.value);
                  if (!touched) setTouched(true);
                }}
                placeholder="Digite o CEP"
                // required removido para evitar mensagem nativa
                minLength={8}
                maxLength={9}
                pattern="\d{5}-?\d{3}"
              />
              {touched && !values.cep && (
                <span className="text-xs text-red-500 mt-1 block">Campo obrigatório</span>
              )}
              {touched && values.cep && values.cep.replace(/\D/g, '').length !== 8 && (
                <span className="text-xs text-red-500 mt-1 block">Digite um CEP válido</span>
              )}
            </div>
            <div className="md:col-span-5">
              <label className="block text-gray-700 text-sm mb-1 font-medium">Endereço</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={values.endereco}
                onChange={e => onChange('endereco', e.target.value)}
                placeholder="Digite"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-gray-700 text-sm mb-1 font-medium">Número</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={values.numero}
                onChange={e => onChange('numero', e.target.value)}
                placeholder="Digite"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Complemento</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={values.complemento}
                onChange={e => onChange('complemento', e.target.value)}
                placeholder="Digite"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Bairro</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={values.bairro}
                onChange={e => onChange('bairro', e.target.value)}
                placeholder="Digite"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Cidade</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={values.cidade}
                onChange={e => onChange('cidade', e.target.value)}
                placeholder="Digite"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">Estado</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={values.estado}
                onChange={e => onChange('estado', e.target.value)}
                placeholder="Digite"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-1 font-medium">País</label>
              <input
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                value={values.pais}
                onChange={e => onChange('pais', e.target.value)}
                placeholder="Digite"
              />
            </div>
          </div>
        </form>
    </GenericEditModal>
  );
};

export default EditarEnderecoModal;
