import React, { useEffect, useMemo, useRef, useState } from "react";
import { Baby, Ban, Briefcase, CakeSlice, CalendarDays, Coffee, Palmtree, Stethoscope } from 'lucide-react';
import DatePicker from '../components/DatePicker';
import { useClickOutside } from '../hooks/useClickOutside';

interface Colaborador {
  id: string;
  nomeCompleto: string;
  matricula?: string;
}

interface LancamentoLicencaRegistro {
  id: string;
  tipoLicenca: string;
  colaboradorId: string | null;
  colaboradorNome: string;
  funcionarioId?: string | null;
  funcionarioNome?: string;
  nomeColaborador?: string;
  nomeFuncionario?: string;
  nome?: string;
  dataInicio: string;
  dataTermino: string;
  criadoEm: string;
  cid?: string;
  observacao?: string;
}

interface LancamentoMassaItem {
  colaborador: Colaborador;
  dataInicio: string;
  dataTermino: string;
  cid?: string;
  observacao?: string;
}

interface LancamentoIndividualProps {
  mode?: 'individual' | 'massa';
  onSuccess?: (message: string) => void;
}

function parseDateString(value: string): Date | null {
  if (!value || value.length !== 10) return null;
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(date.getTime())) return null;
  return date;
}

function getDiasPeriodo(dataInicio: string, dataTermino: string): number | null {
  const inicio = parseDateString(dataInicio);
  const termino = parseDateString(dataTermino);

  if (!inicio || !termino) return null;
  if (termino < inicio) return null;

  const umDiaMs = 1000 * 60 * 60 * 24;
  return Math.floor((termino.getTime() - inicio.getTime()) / umDiaMs) + 1;
}

function verificarConflitoDatas(
  colaboradorId: string | null,
  colaboradorNome: string,
  dataInicio: string,
  dataTermino: string,
  registrosExistentes: LancamentoLicencaRegistro[],
  edicaoId?: string
): boolean {
  const novaDataInicio = parseDateString(dataInicio);
  const novaDataTermino = parseDateString(dataTermino);
  
  if (!novaDataInicio || !novaDataTermino) return false;

  return registrosExistentes.some((item) => {
    // Não comparar com o seu próprio registro em edição
    if (edicaoId && item.id === edicaoId) return false;

    // Comparar por ID se disponível, senão por nome
    const mesmoColaborador = colaboradorId && item.colaboradorId
      ? item.colaboradorId === colaboradorId
      : item.colaboradorNome?.toLowerCase() === colaboradorNome.toLowerCase();

    if (!mesmoColaborador) return false;

    const existingDataInicio = parseDateString(String(item.dataInicio || ''));
    const existingDataTermino = parseDateString(String(item.dataTermino || ''));

    if (!existingDataInicio || !existingDataTermino) return false;

    // Verifica se há sobreposição de datas
    return !(novaDataTermino < existingDataInicio || novaDataInicio > existingDataTermino);
  });
}

function getLicencaIcon(nome: string) {
  const normalized = (nome || '').toLowerCase();

  const isAtestado = /atestado|m[ée]dico|amamenta/.test(normalized);
  const isMaternidade = /maternidade|gestante/.test(normalized);
  const isHappyDay = /happy day/.test(normalized);
  const isAfastamento = /afastamento|suspens|rescis|falecimento|nojo/.test(normalized);
  const isFerias = /férias|ferias|praia|férias coletiva|ferias coletiva/.test(normalized);
  const isFolga = /folga|recesso|banco de horas/.test(normalized);
  const isTrabalho = /teletrabalho|servi[çc]o|treinamento|exame|declaração|justi[çc]a|pleito|obra|quarentena/.test(normalized);

  const badge = (tone: string, icon: React.ReactNode) => (
    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${tone}`}>
      {icon}
    </span>
  );

  if (isAtestado) {
    return badge('border-emerald-200 bg-emerald-50 text-emerald-600', <Stethoscope size={16} strokeWidth={2.2} />);
  }

  if (isMaternidade) {
    return badge('border-pink-200 bg-pink-50 text-pink-600', <Baby size={16} strokeWidth={2.2} />);
  }

  if (isHappyDay) {
    return badge('border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600', <CakeSlice size={16} strokeWidth={2.2} />);
  }

  if (isAfastamento) {
    return badge('border-rose-200 bg-rose-50 text-rose-600', <Ban size={16} strokeWidth={2.2} />);
  }

  if (isFerias) {
    return badge('border-amber-200 bg-amber-50 text-amber-600', <Palmtree size={16} strokeWidth={2.2} />);
  }

  if (isFolga) {
    return badge('border-teal-200 bg-teal-50 text-teal-600', <Coffee size={16} strokeWidth={2.2} />);
  }

  if (isTrabalho) {
    return badge('border-sky-200 bg-sky-50 text-sky-600', <Briefcase size={16} strokeWidth={2.2} />);
  }

  return badge('border-indigo-200 bg-indigo-50 text-indigo-600', <CalendarDays size={16} strokeWidth={2.2} />);
}

export default function LancamentoIndividual({ mode = 'individual', onSuccess }: LancamentoIndividualProps) {
  const isMassMode = mode === 'massa';
  const [massStep, setMassStep] = useState<3 | 4>(3);
  const licencaSelecionada = localStorage.getItem('licencaSelecionada') || 'Férias';
  const [buscaColaborador, setBuscaColaborador] = useState('');
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);
  const [lancamentosEmFila, setLancamentosEmFila] = useState<LancamentoMassaItem[]>([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataTermino, setDataTermino] = useState('');
  const [cid, setCid] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erroConflito, setErroConflito] = useState('');
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const buscaRef = useRef<HTMLDivElement>(null);
  const dataTerminoRef = useRef<HTMLInputElement>(null);
  const carregouEdicaoRef = useRef(false);

  const dataInicioValida = dataInicio.trim().length === 10;
  const dataTerminoValida = dataTermino.trim().length === 10;
  const datasPreenchidas = dataInicioValida && dataTerminoValida;

  const diasLicenca = useMemo(() => {
    const inicio = parseDateString(dataInicio);
    const termino = parseDateString(dataTermino);

    if (!inicio || !termino) return null;
    if (termino < inicio) return -1;

    const umDiaMs = 1000 * 60 * 60 * 24;
    const diferencaMs = termino.getTime() - inicio.getTime();
    return Math.floor(diferencaMs / umDiaMs) + 1;
  }, [dataInicio, dataTermino]);

  const colaboradores = useMemo<Colaborador[]>(() => {
    const stored = localStorage.getItem('employees');
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((emp) => emp && typeof emp === 'object')
        .map((emp) => ({
          id: String(emp.id || ''),
          nomeCompleto: String(emp.nomeCompleto || ''),
          matricula: emp.matricula ? String(emp.matricula) : undefined,
        }))
        .filter((emp) => emp.id && emp.nomeCompleto);
    } catch {
      return [];
    }
  }, []);

  const colaboradoresFiltrados = useMemo(() => {
    const termo = buscaColaborador.trim().toLowerCase();

    if (!termo) {
      return [];
    }

    return colaboradores
      .filter((emp) => {
        const nome = emp.nomeCompleto.toLowerCase();
        const matricula = (emp.matricula || '').toLowerCase();
        return nome.includes(termo) || matricula.includes(termo);
      })
      .slice(0, 8);
  }, [colaboradores, buscaColaborador]);

  useClickOutside(buscaRef, () => setMostrarSugestoes(false));

  useEffect(() => {
    if (isMassMode) {
      setMassStep(3);
    }
  }, [isMassMode]);

  useEffect(() => {
    // Limpa erro de conflito quando o usuário muda as datas ou colaborador
    setErroConflito('');
  }, [dataInicio, dataTermino, colaboradorSelecionado, lancamentosEmFila]);

  useEffect(() => {
    if (isMassMode) {
      carregouEdicaoRef.current = true;
      return;
    }

    if (carregouEdicaoRef.current) return;

    const edicaoId = localStorage.getItem('licencaEdicaoId');
    if (!edicaoId) {
      carregouEdicaoRef.current = true;
      return;
    }

    const salvo = localStorage.getItem('lancamentosLicenca');
    if (!salvo) {
      carregouEdicaoRef.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(salvo);
      if (!Array.isArray(parsed)) {
        carregouEdicaoRef.current = true;
        return;
      }

      const registro = parsed.find((item) => String(item?.id || '') === edicaoId) as LancamentoLicencaRegistro | undefined;
      if (!registro) {
        carregouEdicaoRef.current = true;
        return;
      }

      const nomeRegistro = String(
        registro.colaboradorNome ||
        registro.funcionarioNome ||
        registro.nomeColaborador ||
        registro.nomeFuncionario ||
        registro.nome ||
        ''
      ).trim();

      setBuscaColaborador(nomeRegistro);
      setDataInicio(String(registro.dataInicio || ''));
      setDataTermino(String(registro.dataTermino || ''));
      setCid(String(registro.cid || ''));
      setObservacao(String(registro.observacao || ''));

      if (registro.tipoLicenca) {
        localStorage.setItem('licencaSelecionada', String(registro.tipoLicenca));
      }

      const idRegistro = String(registro.colaboradorId || registro.funcionarioId || '').trim();
      const colaboradorPorId = idRegistro ? colaboradores.find((emp) => emp.id === idRegistro) : null;

      if (colaboradorPorId) {
        setColaboradorSelecionado(colaboradorPorId);
      } else if (nomeRegistro) {
        setColaboradorSelecionado({
          id: idRegistro || `edicao-${edicaoId}`,
          nomeCompleto: nomeRegistro,
        });
      }
    } catch {
      // Ignora registro corrompido e segue em modo de novo lançamento.
    }

    carregouEdicaoRef.current = true;
  }, [colaboradores, isMassMode]);

  // Em edicao, voltar retorna para Férias e Afastamentos; em novo lancamento, retorna para etapa 2.
  const handleVoltarEtapa2 = () => {
    if (isMassMode && massStep === 4) {
      setMassStep(3);
      return;
    }

    setErroConflito('');
    const emEdicao = Boolean(localStorage.getItem('licencaEdicaoId'));
    localStorage.removeItem('licencaEdicaoId');
    localStorage.setItem('currentPage', emEdicao ? 'ferias-e-afastamentos' : 'lancamento-individual-ou-massa');
    window.dispatchEvent(new Event('storage'));
  };

  const handleFazerLancamento = () => {
    setTentouEnviar(true);
    setErroConflito('');

    let registrosAtuais: LancamentoLicencaRegistro[] = [];
    const salvo = localStorage.getItem('lancamentosLicenca');
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        if (Array.isArray(parsed)) {
          registrosAtuais = parsed;
        }
      } catch {
        registrosAtuais = [];
      }
    }

    if (isMassMode) {
      if (lancamentosEmFila.length === 0) {
        setErroConflito('Adicione pelo menos um funcionário na fila antes de finalizar.');
        return;
      }

      const itemComConflito = lancamentosEmFila.find((item) =>
        verificarConflitoDatas(
          item.colaborador.id || null,
          item.colaborador.nomeCompleto || '',
          item.dataInicio,
          item.dataTermino,
          registrosAtuais
        )
      );

      if (itemComConflito) {
        setErroConflito(`${itemComConflito.colaborador.nomeCompleto} já possui um afastamento no período informado.`);
        return;
      }

      const baseTimestamp = Date.now();
      const novosRegistros: LancamentoLicencaRegistro[] = lancamentosEmFila.map((item, index) => ({
        id: `licenca-${baseTimestamp}-${index}`,
        tipoLicenca: licencaSelecionada,
        colaboradorId: item.colaborador.id || null,
        colaboradorNome: item.colaborador.nomeCompleto || 'Colaborador não informado',
        dataInicio: item.dataInicio,
        dataTermino: item.dataTermino,
        criadoEm: new Date().toISOString(),
        cid: item.cid,
        observacao: item.observacao,
      }));

      localStorage.setItem('lancamentosLicenca', JSON.stringify([...novosRegistros, ...registrosAtuais]));
      onSuccess?.('Lançamentos em massa realizados com sucesso.');
    } else {
      if (!datasPreenchidas) {
        return;
      }

      const nomeDigitado = buscaColaborador.trim();
      const colaboradorEncontrado = colaboradorSelecionado || colaboradores.find((emp) => emp.nomeCompleto.toLowerCase() === nomeDigitado.toLowerCase()) || null;

      if (!colaboradorEncontrado) {
        setErroConflito('Selecione um funcionário para fazer o lançamento.');
        return;
      }

      const edicaoId = localStorage.getItem('licencaEdicaoId');
      const possuiConflito = verificarConflitoDatas(
        colaboradorEncontrado.id || null,
        colaboradorEncontrado.nomeCompleto || '',
        dataInicio,
        dataTermino,
        registrosAtuais,
        edicaoId || undefined
      );

      if (possuiConflito) {
        setErroConflito(`${colaboradorEncontrado.nomeCompleto} já possui um afastamento neste período.`);
        return;
      }

      const novoRegistro: LancamentoLicencaRegistro = {
        id: `licenca-${Date.now()}-0`,
        tipoLicenca: licencaSelecionada,
        colaboradorId: colaboradorEncontrado.id || null,
        colaboradorNome: colaboradorEncontrado.nomeCompleto || 'Colaborador não informado',
        dataInicio,
        dataTermino,
        criadoEm: new Date().toISOString(),
        cid: cid.trim() || undefined,
        observacao: observacao.trim() || undefined,
      };

      if (edicaoId) {
        const indexRegistro = registrosAtuais.findIndex((item) => String(item.id) === edicaoId);

        if (indexRegistro >= 0) {
          const registroAtual = registrosAtuais[indexRegistro];
          const atualizado: LancamentoLicencaRegistro = {
            ...registroAtual,
            ...novoRegistro,
            id: edicaoId,
            criadoEm: registroAtual.criadoEm || novoRegistro.criadoEm,
          };

          registrosAtuais[indexRegistro] = atualizado;
          localStorage.setItem('lancamentosLicenca', JSON.stringify(registrosAtuais));
        } else {
          localStorage.setItem('lancamentosLicenca', JSON.stringify([{ ...novoRegistro, id: edicaoId }, ...registrosAtuais]));
        }

        localStorage.removeItem('licencaEdicaoId');
        onSuccess?.('Lançamento atualizado com sucesso.');
      } else {
        localStorage.setItem('lancamentosLicenca', JSON.stringify([novoRegistro, ...registrosAtuais]));
        onSuccess?.('Lançamento realizado com sucesso.');
      }
    }

    // Limpa o rascunho do fluxo para o proximo lancamento iniciar do zero.
    localStorage.removeItem('licencaSelecionada');
    localStorage.removeItem('licencaShowAll');
    localStorage.removeItem('tipoLancamento');
    localStorage.removeItem('colaboradorSelecionadoId');
    localStorage.removeItem('colaboradorSelecionadoNome');
    localStorage.removeItem('licencaEdicaoId');

    // Limpa os states
    setCid('');
    setObservacao('');
    setBuscaColaborador('');
    setColaboradorSelecionado(null);
    setLancamentosEmFila([]);

    localStorage.setItem('currentPage', 'ferias-e-afastamentos');
    window.dispatchEvent(new Event('storage'));

  };

  const handleIrParaEtapa4 = () => {
    setErroConflito('');
    if (lancamentosEmFila.length === 0) {
      setErroConflito('Adicione pelo menos um funcionário na fila antes de avançar para a revisão.');
      return;
    }
    setMassStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdicionarNaFila = () => {
    setTentouEnviar(true);
    setErroConflito('');

    if (!colaboradorSelecionado) {
      setErroConflito('Selecione um funcionário antes de adicionar na fila.');
      return;
    }

    if (!datasPreenchidas || diasLicenca === -1) {
      setErroConflito('Informe um período válido para adicionar este funcionário na fila.');
      return;
    }

    if (lancamentosEmFila.some((item) => item.colaborador.id === colaboradorSelecionado.id)) {
      setErroConflito('Esse funcionário já está na fila deste lançamento.');
      return;
    }

    setLancamentosEmFila((prev) => [
      ...prev,
      {
        colaborador: colaboradorSelecionado,
        dataInicio,
        dataTermino,
        cid: cid.trim() || undefined,
        observacao: observacao.trim() || undefined,
      }
    ]);

    setBuscaColaborador('');
    setColaboradorSelecionado(null);
    setDataInicio('');
    setDataTermino('');
    setCid('');
    setObservacao('');
    setTentouEnviar(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#f6f7fb] p-6">
      {/* Barra de etapas */}
      <div className="w-full max-w-4xl mx-auto mt-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block text-blue-600">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 3h6a1 1 0 011 1v1h2a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2V4a1 1 0 011-1z" stroke="#2563eb" strokeWidth="2"/><path d="M9 5h6" stroke="#2563eb" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="#2563eb" strokeWidth="2"/></svg>
            </span>
            <span className="text-2xl font-bold">Lançamento de licença</span>
          </div>
          <span className="text-gray-500">Faça o lançamento coletivo ou individual dos seus colaboradores.</span>
        </div>
        <div className="flex items-center justify-center mt-6">
          <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold bg-blue-200 text-blue-600">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#6366f1" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          </span>
          <div className="flex-1 h-0.5 bg-blue-100 mx-2" />
          <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold bg-blue-200 text-blue-600">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#6366f1" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          </span>
          <div className="flex-1 h-0.5 bg-blue-100 mx-2" />
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${!isMassMode || massStep === 3 ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-600'}`}>3</span>
          {isMassMode && (
            <>
              <div className={`flex-1 h-0.5 mx-2 ${massStep === 4 ? 'bg-blue-100' : 'bg-gray-200'}`} />
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${massStep === 4 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>4</span>
            </>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-2xl mx-auto mt-2">
        <h2 className="text-lg font-bold mb-6">{isMassMode && massStep === 4 ? 'Revisão final dos lançamentos' : 'Configurações básicas'}</h2>
        {(!isMassMode || massStep === 3) && (
          <>
        <div className="relative mb-6" ref={buscaRef}>
          <div className={`flex items-center border rounded-lg px-4 py-2 bg-white transition ${mostrarSugestoes ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-300'} focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100`}>
            <input
              type="text"
              className="flex-1 bg-transparent text-sm !border-0 outline-none focus:!border-0 focus:!outline-none focus:!ring-0 focus:!ring-transparent"
              placeholder={isMassMode ? 'Buscar funcionários por nome ou matrícula' : 'Buscar funcionário por nome ou matrícula'}
              value={buscaColaborador}
              onFocus={() => setMostrarSugestoes(buscaColaborador.trim().length > 0)}
              onChange={(e) => {
                const value = e.target.value;
                setBuscaColaborador(value);
                setMostrarSugestoes(value.trim().length > 0);

                if (colaboradorSelecionado) {
                  setColaboradorSelecionado(null);
                  if (!isMassMode) {
                    localStorage.removeItem('colaboradorSelecionadoId');
                    localStorage.removeItem('colaboradorSelecionadoNome');
                  }
                }
              }}
            />
            <span className="ml-2 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#6b7280" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
            </span>
          </div>

          {mostrarSugestoes && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {colaboradoresFiltrados.length > 0 ? (
                colaboradoresFiltrados.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-50"
                    onClick={() => {
                      if (isMassMode) {
                        setColaboradorSelecionado(emp);
                        setBuscaColaborador(emp.nomeCompleto);
                      } else {
                        setColaboradorSelecionado(emp);
                        setBuscaColaborador(emp.nomeCompleto);
                        localStorage.setItem('colaboradorSelecionadoId', emp.id);
                        localStorage.setItem('colaboradorSelecionadoNome', emp.nomeCompleto);
                      }
                      setMostrarSugestoes(false);
                      setErroConflito('');
                    }}
                  >
                    <span className="font-medium text-gray-800">{emp.nomeCompleto}</span>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-gray-500">Nenhum funcionário encontrado.</p>
              )}
            </div>
          )}

        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2 shadow-sm">
            {getLicencaIcon(licencaSelecionada)}
            <span className="font-semibold">{licencaSelecionada}</span>
          </div>
        </div>
        {licencaSelecionada === 'Atestado médico' && (
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-1">CID (opcional)</label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 w-full"
              maxLength={10}
              value={cid}
              onChange={(e) => setCid(e.target.value)}
            />
          </div>
        )}
        <div className="flex gap-4 mb-6">
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 mb-1">Início</label>
            <DatePicker
              value={dataInicio}
              onChange={setDataInicio}
              placeholder="Selecionar data"
              className="!bg-white !border-gray-300 !rounded-lg"
              error={tentouEnviar && !dataInicioValida}
              nextRef={dataTerminoRef}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 mb-1">Término</label>
            <DatePicker
              ref={dataTerminoRef}
              value={dataTermino}
              onChange={setDataTermino}
              placeholder="Selecionar data"
              className="!bg-white !border-gray-300 !rounded-lg"
              error={tentouEnviar && !dataTerminoValida}
            />
          </div>
        </div>
        {diasLicenca !== null && diasLicenca > 0 && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Quantidade de dias: <span className="font-semibold">{diasLicenca}</span> {diasLicenca === 1 ? 'dia' : 'dias'}
          </div>
        )}
        {diasLicenca === -1 && (
          <p className="mb-4 text-sm font-medium text-red-600">
            A data de término não pode ser anterior à data de início.
          </p>
        )}
        {tentouEnviar && !datasPreenchidas && (
          <p className="mb-4 text-sm font-medium text-red-600">
            Preencha as datas de início e término para fazer o lançamento.
          </p>
        )}
        {erroConflito && (
          <p className="mb-4 text-sm font-medium text-red-600">
            {erroConflito}
          </p>
        )}
        <textarea 
          className="w-full border rounded-lg px-3 py-2 mb-2" 
          rows={3} 
          placeholder="Deixe uma observação..." 
          maxLength={144}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
        {isMassMode && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleAdicionarNaFila}
              className="rounded-full border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Adicionar funcionário com esse período
            </button>
          </div>
        )}
        {isMassMode && (
          <div className="mb-6">
            {lancamentosEmFila.length === 0 ? (
              <p className="text-xs text-gray-500">Nenhum funcionário adicionado na fila.</p>
            ) : (
              <div className="space-y-2">
                {lancamentosEmFila.map((item) => (
                  <div key={item.colaborador.id} className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
                    <div className="text-blue-800">
                      <span className="font-semibold">{item.colaborador.nomeCompleto}</span>
                      <span className="text-blue-600"> - {item.dataInicio} a {item.dataTermino}</span>
                      {(() => {
                        const dias = getDiasPeriodo(item.dataInicio, item.dataTermino);
                        if (!dias) return null;
                        return <span className="text-blue-700"> ({dias} {dias === 1 ? 'dia' : 'dias'})</span>;
                      })()}
                    </div>
                    <button
                      type="button"
                      className="text-blue-700 hover:text-blue-900"
                      onClick={() => setLancamentosEmFila((prev) => prev.filter((entry) => entry.colaborador.id !== item.colaborador.id))}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Só mostra se for Férias */}
        {licencaSelecionada === 'Férias' && (
          <div className="mb-6">
            <span className="block mb-2 font-medium">Solicitar abono pecuniário?</span>
            <label className="mr-6 text-blue-600 font-medium flex items-center gap-1"><input type="radio" name="abono" value="sim" className="mr-1" defaultChecked /><span>Sim</span></label>
            <label className="text-gray-600 font-medium flex items-center gap-1"><input type="radio" name="abono" value="nao" className="mr-1" /><span>Não</span></label>
          </div>
        )}
          </>
        )}

        {isMassMode && massStep === 4 && (
          <div className="mb-6 space-y-3">
            {lancamentosEmFila.map((item) => {
              const dias = getDiasPeriodo(item.dataInicio, item.dataTermino);
              return (
                <div key={item.colaborador.id} className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-blue-900">{item.colaborador.nomeCompleto}</p>
                    {dias && <span className="text-xs font-semibold text-blue-700">{dias} {dias === 1 ? 'dia' : 'dias'}</span>}
                  </div>
                  <p className="mt-1 text-xs text-blue-700">Período: {item.dataInicio} a {item.dataTermino}</p>
                  {item.cid && <p className="mt-1 text-xs text-blue-700">CID: {item.cid}</p>}
                  {item.observacao && <p className="mt-1 text-xs text-blue-700">Observação: {item.observacao}</p>}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-between mt-8">
          <button className="border border-blue-600 text-blue-600 rounded-full px-6 py-2 font-medium hover:bg-blue-50 transition" onClick={handleVoltarEtapa2}>Voltar</button>
          <button
            className="bg-blue-600 text-white rounded-full px-6 py-2 font-semibold shadow hover:bg-blue-700 transition"
            onClick={isMassMode && massStep === 3 ? handleIrParaEtapa4 : handleFazerLancamento}
          >
            {isMassMode ? (massStep === 3 ? 'Próxima etapa' : 'Fazer lançamentos') : 'Fazer lançamento'}
          </button>
        </div>
      </div>
    </div>
  );
}
