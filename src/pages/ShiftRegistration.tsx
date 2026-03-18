import React, { useState } from "react";
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import '../pages/shiftRegistrationAnimations.css';
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import '../select-pointer.css';
import Select from '../components/Select';


interface ShiftRegistrationProps {
  onNavigate?: (route: string) => void;
  editingShift?: any;
}

const ShiftRegistration: React.FC<ShiftRegistrationProps> = ({ onNavigate, editingShift }) => {
  const [followCompanyRules, setFollowCompanyRules] = useState(true);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [preSigned, setPreSigned] = useState("Não");
  const [ignoreHolidays, setIgnoreHolidays] = useState("Não");
  const [flexible, setFlexible] = useState("Não");
  const [observation, setObservation] = useState("");
  const [fixedSchedule, setFixedSchedule] = useState("Não");
  const [step, setStep] = useState(1);
  const [startWork, setStartWork] = useState("");
  const [endWork, setEndWork] = useState("");
  const [startBreak, setStartBreak] = useState("");
  const [endBreak, setEndBreak] = useState("");
  const [daysPreset, setDaysPreset] = useState("Dias úteis");
  const [step2Errors, setStep2Errors] = useState({
    startWork: false,
    endWork: false,
    startBreak: false,
    endBreak: false,
  });
  const [weekData, setWeekData] = useState([
    { day: "Dom", start: "00:00", end: "00:00", breakStart: "", breakEnd: "", mark: false },
    { day: "Seg", start: startWork, end: endWork, breakStart: startBreak, breakEnd: endBreak, mark: true },
    { day: "Ter", start: startWork, end: endWork, breakStart: startBreak, breakEnd: endBreak, mark: true },
    { day: "Qua", start: startWork, end: endWork, breakStart: startBreak, breakEnd: endBreak, mark: true },
    { day: "Qui", start: startWork, end: endWork, breakStart: startBreak, breakEnd: endBreak, mark: true },
    { day: "Sex", start: startWork, end: endWork, breakStart: startBreak, breakEnd: endBreak, mark: true },
    { day: "Sab", start: startWork, end: endWork, breakStart: startBreak, breakEnd: endBreak, mark: true },
  ]);

  // Preenche campos ao editar
  React.useEffect(() => {
    if (editingShift) {
      setCode(editingShift.codigo || "");
      setName(editingShift.nome || "");
      setType(editingShift.tipo || "");
      setFollowCompanyRules(editingShift.regras === 'Segue');
      setObservation(editingShift.observacao || "");
      setIgnoreHolidays(editingShift.ignoreHolidays || "Não");
      if (editingShift.semana && Array.isArray(editingShift.semana)) {
        setWeekData(editingShift.semana);
        // Preenche campos principais com valores da semana (Segunda)
        const seg = editingShift.semana[1];
        setStartWork(seg?.start || "");
        setEndWork(seg?.end || "");
        setStartBreak(seg?.breakStart || "");
        setEndBreak(seg?.breakEnd || "");
      }
      // Vai direto para etapa 1
      setStep(1);
    } else {
      // Gera código automático ao abrir tela
      const turnos = JSON.parse(localStorage.getItem('turnos') || '[]');
      const codes = turnos.map((t: any) => parseInt(t.codigo) || 0);
      const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
      setCode((maxCode + 1).toString().padStart(2, '0'));
    }
  }, [editingShift]);

  // Função para aplicar máscara de horário
  function handleTimeInput(value, setter) {
    // Remove tudo que não é número
    let digits = value.replace(/\D/g, "");
    if (digits.length > 4) digits = digits.slice(0, 4);
    let masked = digits;
    if (digits.length > 2) {
      masked = digits.slice(0, 2) + ":" + digits.slice(2);
    }
    setter(masked);
  }

  function isValidTime(value: string) {
    return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  }

  function validateStep2Schedule() {
    const nextErrors = {
      startWork: !isValidTime(startWork),
      endWork: !isValidTime(endWork),
      startBreak: !isValidTime(startBreak),
      endBreak: !isValidTime(endBreak),
    };

    setStep2Errors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  function saveShift(updates: Record<string, any>) {
    const turnos = JSON.parse(localStorage.getItem('turnos') || '[]');
    const originalCode = editingShift?.codigo || code;
    const existingIndex = turnos.findIndex((t: any) => t.codigo === originalCode);
    const today = new Date().toLocaleDateString('pt-BR');
    const updatedAt = new Date().toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const baseShift = existingIndex >= 0 ? turnos[existingIndex] : {};

    const nextShift = {
      ...baseShift,
      codigo: code,
      nome: name,
      tipo: type,
      regras: followCompanyRules ? 'Segue' : 'Não segue',
      observacao: observation,
      ignoreHolidays,
      criadoEm: baseShift.criadoEm || today,
      atualizadoEm: updatedAt,
      ...updates,
    };

    if (existingIndex >= 0) {
      turnos[existingIndex] = nextShift;
    } else {
      turnos.push(nextShift);
    }

    localStorage.setItem('turnos', JSON.stringify(turnos));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validação dos campos obrigatórios
    if (!type || !name || !code || !ignoreHolidays) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    // Se for Sem HR Fixa ou Livre/Folguista, salva e navega
    if ((type === 'Sem HR Fixa' || type === 'Livre/Folguista') && onNavigate) {
      saveShift({});
      onNavigate('turnos');
      return;
    }
    // Se for Semanal, vai para etapa 2
    if (type === 'Semanal') {
      setStep(2);
      return;
    }
    // Caso contrário, segue fluxo normal (exemplo: alert)
    alert('Turno cadastrado com sucesso!');
  }

  function isDayIncludedByPreset(preset: string, dayIndex: number) {
    // weekData indexes: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
    if (preset === 'Todos os dias') return true;
    if (preset === 'Dias úteis') return dayIndex >= 1 && dayIndex <= 5;
    if (preset === 'Seg - Sab') return dayIndex >= 1 && dayIndex <= 6;
    if (preset === 'Fim de semana') return dayIndex === 0 || dayIndex === 6;
    return false;
  }

  function buildWeekDataFromStepTwo() {
    return weekData.map((item, idx) => {
      const included = isDayIncludedByPreset(daysPreset, idx);

      if (included) {
        return {
          ...item,
          start: startWork || '00:00',
          end: endWork || '00:00',
          breakStart: startBreak || '00:00',
          breakEnd: endBreak || '00:00',
          mark: true,
        };
      }

      return {
        ...item,
        start: '00:00',
        end: '00:00',
        breakStart: '00:00',
        breakEnd: '00:00',
        mark: false,
      };
    });
  }

  return (
    <>
      <div className="max-w-6xl mx-auto mt-8">
        {type !== '' ? (
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={type + step}
              classNames="etapas"
              timeout={300}
            >
              {type === 'Semanal' ? (
                <div className="flex items-center mb-8">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold mr-2 ${step === 1 ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400'}`}>1</div>
                    <span className={`font-semibold ${step === 1 ? 'text-indigo-700' : 'text-gray-400'}`}>Turno</span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-2" />
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold mr-2 ${step === 2 ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
                    <span className={`font-semibold ${step === 2 ? 'text-indigo-700' : 'text-gray-400'}`}>Horários</span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-2" />
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold mr-2 ${step === 3 ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400'}`}>3</div>
                    <span className={`font-semibold ${step === 3 ? 'text-indigo-700' : 'text-gray-400'}`}>Resumo</span>
                  </div>
                </div>
              ) : (type === 'Sem HR Fixa' || type === 'Livre/Folguista') ? (
                <div className="flex items-center mb-8 justify-center">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-700 text-white font-bold mr-2">1</div>
                    <span className="font-semibold text-indigo-700">Turno</span>
                  </div>
                </div>
              ) : null}
            </CSSTransition>
          </SwitchTransition>
        ) : (
          <div className="flex items-center mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold mr-2 ${step === 1 ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400'}`}>1</div>
              <span className={`font-semibold ${step === 1 ? 'text-indigo-700' : 'text-gray-400'}`}>Turno</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2" />
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold mr-2 ${step === 2 ? 'bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
              <span className={`font-semibold ${step === 2 ? 'text-indigo-700' : 'text-gray-400'}`}>Horários</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2" />
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-400 font-bold mr-2">3</div>
              <span className="font-semibold text-gray-400">Resumo</span>
            </div>
          </div>
        )}
      </div>
      {step === 1 && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 max-w-6xl mx-auto mt-8">
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
                Código do turno <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-200 text-sm cursor-not-allowed disabled:cursor-not-allowed opacity-70"
                placeholder="Código gerado automaticamente"
                value={code}
                readOnly
                disabled
              />
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
                Tipo do turno <span className="text-red-500">*</span>
              </label>
              <Select
                value={type}
                onChange={(value) => setType(String(value))}
                options={[
                  { label: 'Selecione', value: '' },
                  { label: 'Semanal (Mais usado)', value: 'Semanal' },
                  { label: 'Sem HR Fixa', value: 'Sem HR Fixa' },
                  { label: 'Livre/Folguista', value: 'Livre/Folguista' }
                ]}
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                Ignorar feriados? <span className="text-red-500">*</span>
                <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" title="O sistema irá ignorar os feriados e irá tratar os feriados como dia de trabalho normal." />
              </label>
              <Select
                value={ignoreHolidays}
                onChange={(value) => setIgnoreHolidays(String(value))}
                options={[
                  { label: 'Não', value: 'Não' },
                  { label: 'Sim', value: 'Sim' }
                ]}
              />
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
          <div className="flex justify-between">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-6 py-2 font-semibold"
              onClick={() => onNavigate && onNavigate('turnos')}
            >
              Voltar
            </button>
            <button
              type="submit"
              className="bg-indigo-700 hover:bg-indigo-800 text-white rounded px-6 py-2 font-semibold"
            >
              {(type === 'Sem HR Fixa' || type === 'Livre/Folguista') ? 'Cadastrar turno' : 'Continuar'}
            </button>
          </div>
        </form>
      )}
      {step === 2 && type === 'Semanal' && (
        <div className="bg-white rounded-lg shadow p-8 max-w-6xl mx-auto mt-8">
          <h2 className="text-2xl font-semibold mb-1">2. Horários</h2>
          <p className="text-gray-500 mb-6">Registre a jornada de trabalho diária do colaborador, se tiver dias que o horário seja diferente, você poderá alterar no próximo passo.</p>
          <hr className="mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Início do expediente</label>
              <input
                className={`w-full px-4 py-2 rounded text-gray-700 ${step2Errors.startWork ? 'bg-red-50 border border-red-300' : 'bg-gray-100 border border-transparent'}`}
                value={startWork}
                onChange={e => {
                  handleTimeInput(e.target.value, setStartWork);
                  setStep2Errors((prev) => ({ ...prev, startWork: false }));
                  if (e.target.value.length === 5) {
                    document.getElementById('endWorkInput')?.focus();
                  }
                }}
                inputMode="numeric"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                placeholder="00:00"
                maxLength={5}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    document.getElementById('endWorkInput')?.focus();
                  }
                }}
              />
              {step2Errors.startWork && <p className="mt-1 text-xs text-red-600">Informe um horário válido (HH:MM).</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fim do expediente</label>
              <input
                id="endWorkInput"
                className={`w-full px-4 py-2 rounded text-gray-700 ${step2Errors.endWork ? 'bg-red-50 border border-red-300' : 'bg-gray-100 border border-transparent'}`}
                value={endWork}
                onChange={e => {
                  handleTimeInput(e.target.value, setEndWork);
                  setStep2Errors((prev) => ({ ...prev, endWork: false }));
                  if (e.target.value.length === 5) {
                    document.getElementById('startBreakInput')?.focus();
                  }
                }}
                inputMode="numeric"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                placeholder="00:00"
                maxLength={5}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    document.getElementById('startBreakInput')?.focus();
                  }
                }}
              />
              {step2Errors.endWork && <p className="mt-1 text-xs text-red-600">Informe um horário válido (HH:MM).</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dias</label>
              <Select
                value={daysPreset}
                onChange={(value) => setDaysPreset(String(value))}
                options={[
                  { label: 'Dias úteis', value: 'Dias úteis' },
                  { label: 'Seg - Sab', value: 'Seg - Sab' },
                  { label: 'Fim de semana', value: 'Fim de semana' },
                  { label: 'Todos os dias', value: 'Todos os dias' }
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Início intervalo 1</label>
              <input
                id="startBreakInput"
                className={`w-full px-4 py-2 rounded text-gray-700 ${step2Errors.startBreak ? 'bg-red-50 border border-red-300' : 'bg-gray-100 border border-transparent'}`}
                value={startBreak}
                onChange={e => {
                  handleTimeInput(e.target.value, setStartBreak);
                  setStep2Errors((prev) => ({ ...prev, startBreak: false }));
                  if (e.target.value.length === 5) {
                    document.getElementById('endBreakInput')?.focus();
                  }
                }}
                inputMode="numeric"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                placeholder="00:00"
                maxLength={5}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    document.getElementById('endBreakInput')?.focus();
                  }
                }}
              />
              {step2Errors.startBreak && <p className="mt-1 text-xs text-red-600">Informe um horário válido (HH:MM).</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fim intervalo 1</label>
              <input
                id="endBreakInput"
                className={`w-full px-4 py-2 rounded text-gray-700 ${step2Errors.endBreak ? 'bg-red-50 border border-red-300' : 'bg-gray-100 border border-transparent'}`}
                value={endBreak}
                onChange={e => {
                  handleTimeInput(e.target.value, setEndBreak);
                  setStep2Errors((prev) => ({ ...prev, endBreak: false }));
                  if (e.target.value.length === 5) {
                    document.getElementById('diasSelect')?.focus();
                  }
                }}
                inputMode="numeric"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                placeholder="00:00"
                maxLength={5}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    document.getElementById('diasSelect')?.focus();
                  }
                }}
              />
              {step2Errors.endBreak && <p className="mt-1 text-xs text-red-600">Informe um horário válido (HH:MM).</p>}
            </div>
          </div>
          <div className="flex justify-between">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-6 py-2 font-semibold" onClick={() => setStep(1)}>Voltar</button>
            <button className="bg-indigo-700 hover:bg-indigo-800 text-white rounded px-6 py-2 font-semibold"
              onClick={() => {
                if (!validateStep2Schedule()) {
                  return;
                }
                setWeekData(buildWeekDataFromStepTwo());
                setStep(3);
              }}
            >Continuar</button>
          </div>
        </div>
      )}

      {step === 3 && type === 'Semanal' && (
        <div className="bg-white rounded-lg shadow p-8 max-w-6xl mx-auto mt-8">
          <h2 className="text-2xl font-semibold mb-1">3. Resumo</h2>
          <p className="text-gray-500 mb-6">Confira os horários e altere caso tenham horários diferentes nos dias da semana.</p>
          <hr className="mb-6" />
          {/* Cálculo de horas semanais */}
          {(() => {
            function parseTime(t) {
              if (!t || !/^\d{2}:\d{2}$/.test(t)) return null;
              const [h, m] = t.split(":").map(Number);
              return h * 60 + m;
            }
            let total = 0;
            weekData.forEach((item, idx) => {
              // Só conta dias marcados
              if (item.mark) {
                const start = parseTime(item.start);
                const end = parseTime(item.end);
                const breakStart = parseTime(item.breakStart);
                const breakEnd = parseTime(item.breakEnd);
                if (start !== null && end !== null) {
                  let worked = end - start;
                  if (breakStart !== null && breakEnd !== null) {
                    worked -= (breakEnd - breakStart);
                  }
                  total += worked > 0 ? worked : 0;
                }
              }
            });
            const horas = Math.floor(total / 60);
            const minutos = total % 60;
            return (
              <div className="mb-4 text-lg font-bold text-indigo-700">
                Total por semana: {horas}h{minutos > 0 ? ` ${minutos}min` : ""}
              </div>
            );
          })()}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-2 py-2">Dia Sem.</th>
                  <th className="text-left px-2 py-2">Início do expediente</th>
                  <th className="text-left px-2 py-2">Início intervalo 1</th>
                  <th className="text-left px-2 py-2">Fim intervalo 1</th>
                  <th className="text-left px-2 py-2">Fim do expediente</th>
                  <th className="text-left px-2 py-2">Deve marcar ponto?</th>
                </tr>
              </thead>
              <tbody>
                {weekData.map((item, idx) => (
                  <tr key={item.day}>
                    <td className="px-2 py-2">
                      <span className="bg-gray-100 rounded px-3 py-1 text-xs font-semibold">{item.day}</span>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1 rounded bg-gray-300 text-gray-700 font-semibold"
                        value={item.start}
                        onChange={e => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 4) value = value.slice(0, 4);
                          let masked = value;
                          if (value.length > 2) masked = value.slice(0, 2) + ":" + value.slice(2);
                          const newData = [...weekData];
                          newData[idx].start = masked;
                          setWeekData(newData);
                        }}
                        placeholder="00:00"
                        maxLength={5}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1 rounded bg-gray-100 text-gray-700"
                        value={item.breakStart}
                        onChange={e => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 4) value = value.slice(0, 4);
                          let masked = value;
                          if (value.length > 2) masked = value.slice(0, 2) + ":" + value.slice(2);
                          const newData = [...weekData];
                          newData[idx].breakStart = masked;
                          setWeekData(newData);
                        }}
                        placeholder="__:__"
                        maxLength={5}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1 rounded bg-gray-100 text-gray-700"
                        value={item.breakEnd}
                        onChange={e => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 4) value = value.slice(0, 4);
                          let masked = value;
                          if (value.length > 2) masked = value.slice(0, 2) + ":" + value.slice(2);
                          const newData = [...weekData];
                          newData[idx].breakEnd = masked;
                          setWeekData(newData);
                        }}
                        placeholder="__:__"
                        maxLength={5}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1 rounded bg-gray-300 text-gray-700 font-semibold"
                        value={item.end}
                        onChange={e => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 4) value = value.slice(0, 4);
                          let masked = value;
                          if (value.length > 2) masked = value.slice(0, 2) + ":" + value.slice(2);
                          const newData = [...weekData];
                          newData[idx].end = masked;
                          setWeekData(newData);
                        }}
                        placeholder="00:00"
                        maxLength={5}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.mark}
                        onChange={e => {
                          const newData = [...weekData];
                          newData[idx].mark = e.target.checked;
                          setWeekData(newData);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-6">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-6 py-2 font-semibold" onClick={() => setStep(2)}>Voltar</button>
            <button className="bg-green-600 hover:bg-green-700 text-white rounded px-6 py-2 font-semibold" onClick={() => {
              saveShift({ semana: weekData });
              if (onNavigate) onNavigate('turnos');
            }}>{editingShift ? 'Salvar' : 'Cadastrar'}</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ShiftRegistration;
