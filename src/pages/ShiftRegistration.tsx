import React, { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";


interface ShiftRegistrationProps {
  onNavigate?: (route: string) => void;
}

const ShiftRegistration: React.FC<ShiftRegistrationProps> = ({ onNavigate }) => {
  const [followCompanyRules, setFollowCompanyRules] = useState(true);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [preSigned, setPreSigned] = useState("Não");
  const [ignoreHolidays, setIgnoreHolidays] = useState("Não");
  const [flexible, setFlexible] = useState("Não");
  const [observation, setObservation] = useState("");
  const [fixedSchedule, setFixedSchedule] = useState("Não");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Se for Livre/Folguista, apenas finaliza
    if (type === 'Livre/Folguista') {
      alert('Turno cadastrado com sucesso!');
      return;
    }
    // Se não for horário fixo, pular para Resumo
    if (fixedSchedule === 'Não' && onNavigate) {
      onNavigate('resumo-turno');
      return;
    }
    // Caso contrário, segue fluxo normal (exemplo: alert)
    alert('Turno cadastrado com sucesso!');
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 max-w-6xl mx-auto mt-8">
      <div className="flex items-center mb-8">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-700 text-white font-bold mr-2">1</div>
          <span className="font-semibold text-indigo-700">Turno</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-2" />
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-400 font-bold mr-2">2</div>
          <span className="font-semibold text-gray-400">Horários</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-2" />
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-400 font-bold mr-2">3</div>
          <span className="font-semibold text-gray-400">Resumo</span>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-1">1. Turno</h2>
      <p className="text-gray-500 mb-6">Defina um código, nome e as configurações do turno.</p>
      <div className="flex items-center mb-6">
        <label className="flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={followCompanyRules}
            onChange={() => setFollowCompanyRules((v) => !v)}
            className="form-checkbox h-5 w-5 text-indigo-600"
          />
          <span className="ml-2 text-sm font-medium">Seguir as regras de ponto da empresa</span>
          <InformationCircleIcon
            className="w-4 h-4 text-gray-400 ml-1"
            title="Ao ativar essa opção, as configurações como tolerância, adicional noturno e percentuais de horas extras seguirão a configuração salva em Regras do Ponto."
          />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo do turno <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="Semanal">Semanal</option>
            <option value="Livre/Folguista">Livre/Folguista</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Nome do turno <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
            placeholder="Ex: Turno geral - 08:00 - 12:00 - 13:00 - 18:00"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Código do turno <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
            placeholder="Digite um código para o turno"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            Intervalo pré-assinalado? <span className="text-red-500">*</span>
            <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" title="O sistema irá registrar a entrada e saída do intervalo automaticamente." />
          </label>
          <select
            className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
            value={preSigned}
            onChange={(e) => setPreSigned(e.target.value)}
          >
            <option>Não</option>
            <option>Sim</option>
          </select>
        </div>
        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            Ignorar feriados? <span className="text-red-500">*</span>
            <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" title="O sistema irá ignorar os feriados e irá tratar os feriados como dia de trabalho normal." />
          </label>
          <select
            className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
            value={ignoreHolidays}
            onChange={(e) => setIgnoreHolidays(e.target.value)}
          >
            <option>Não</option>
            <option>Sim</option>
          </select>
        </div>
        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            Horário flexível? <span className="text-red-500">*</span>
            <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" title="Permite flexibilidade de entrada e saída para o funcionário, não gerando atrasos." />
          </label>
          <select
            className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
            value={flexible}
            onChange={(e) => setFlexible(e.target.value)}
          >
            <option>Não</option>
            <option>Sim</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Horário fixo? <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
            value={fixedSchedule}
            onChange={(e) => setFixedSchedule(e.target.value)}
          >
            <option>Não</option>
            <option>Sim</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Observação</label>
        <textarea
          className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
          placeholder="Digite"
          rows={3}
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-semibold mr-2">ATENÇÃO:</span>
        <span className="text-xs text-gray-700">A tolerância por registro <span className="font-bold">não</span> é aplicada para horários flexíveis.</span>
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-6 py-2 font-semibold"
          onClick={() => onNavigate && onNavigate('turnos')}
        >
          Voltar
        </button>
        <button type="submit" className="bg-indigo-700 hover:bg-indigo-800 text-white rounded px-6 py-2 font-semibold">Cadastrar turno</button>
      </div>
    </form>
  );
};

export default ShiftRegistration;
