import React, { useRef, useState, useEffect } from 'react';
import { buscarEnderecoPorCep } from '../utils/cep';

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

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Editar dados do funcionário</h2>
        <hr className="my-4" />
        <h3 className="text-lg font-bold text-indigo-700 mb-4">Endereço</h3>
        <form
          onSubmit={e => {
            e.preventDefault();
            setTouched(true);
            if (!values.cep || values.cep.replace(/\D/g, '').length !== 8) {
              // Apenas mostrar mensagem abaixo do campo, não alert
              return;
            }
            onSubmit();
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
          <div className="flex flex-col gap-2 mt-8">
            <button type="submit" className="w-full py-2 rounded bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition text-xs">Salvar alterações</button>
            <button type="button" className="w-full py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition text-xs" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarEnderecoModal;
