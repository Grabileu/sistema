import React, { useEffect, useMemo, useRef, useState } from "react";
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

function parseDateString(value: string): Date | null {
  if (!value || value.length !== 10) return null;
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(date.getTime())) return null;
  return date;
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
  switch (nome) {
    case 'Férias':
      return (
        <span className="text-yellow-500">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fbbf24" strokeWidth="2"/><path d="M8 16l8-8" stroke="#fbbf24" strokeWidth="2"/><path d="M16 16l-8-8" stroke="#fbbf24" strokeWidth="2"/></svg>
        </span>
      );
    case 'Afastamento':
      return (
        <span className="text-red-500">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#ef4444" strokeWidth="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="#ef4444" strokeWidth="2"/></svg>
        </span>
      );
    case 'Atestado médico':
      return (
        <span className="text-green-500">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#22c55e" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="#22c55e" strokeWidth="2"/></svg>
        </span>
      );
    default:
      return (
        <span className="text-blue-600">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" stroke="#2563eb" strokeWidth="2"/><path d="M8 8h8v8H8z" stroke="#2563eb" strokeWidth="2"/></svg>
        </span>
      );
  }
}

export default function LancamentoIndividual() {
  const licencaSelecionada = localStorage.getItem('licencaSelecionada') || 'Férias';
  const [buscaColaborador, setBuscaColaborador] = useState('');
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null);
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
    // Limpa erro de conflito quando o usuário muda as datas ou colaborador
    setErroConflito('');
  }, [dataInicio, dataTermino, colaboradorSelecionado]);

  useEffect(() => {
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
  }, [colaboradores]);

  // Em edicao, voltar retorna para Férias e Afastamentos; em novo lancamento, retorna para etapa 2.
  const handleVoltarEtapa2 = () => {
    setErroConflito('');
    const emEdicao = Boolean(localStorage.getItem('licencaEdicaoId'));
    localStorage.removeItem('licencaEdicaoId');
    localStorage.setItem('currentPage', emEdicao ? 'ferias-e-afastamentos' : 'lancamento-individual-ou-massa');
    window.dispatchEvent(new Event('storage'));
  };

  const handleFazerLancamento = () => {
    setTentouEnviar(true);
    setErroConflito('');

    if (!datasPreenchidas) {
      return;
    }

    const nomeDigitado = buscaColaborador.trim();
    const colaboradorEncontrado = colaboradorSelecionado || colaboradores.find((emp) => emp.nomeCompleto.toLowerCase() === nomeDigitado.toLowerCase()) || null;

    // Validação: funcionário obrigatório
    if (!colaboradorEncontrado || !colaboradorEncontrado.nomeCompleto) {
      setErroConflito('Selecione um funcionário para fazer o lançamento.');
      return;
    }

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

    const edicaoId = localStorage.getItem('licencaEdicaoId');

    // Verifica conflito de datas
    if (verificarConflitoDatas(
      colaboradorEncontrado?.id || null,
      colaboradorEncontrado?.nomeCompleto || nomeDigitado || '',
      dataInicio,
      dataTermino,
      registrosAtuais,
      edicaoId || undefined
    )) {
      setErroConflito(`${colaboradorEncontrado?.nomeCompleto || nomeDigitado} já possui um afastamento neste período.`);
      return;
    }

    const novoRegistro: LancamentoLicencaRegistro = {
      id: `licenca-${Date.now()}`,
      tipoLicenca: licencaSelecionada,
      colaboradorId: colaboradorEncontrado?.id || null,
      colaboradorNome: colaboradorEncontrado?.nomeCompleto || nomeDigitado || 'Colaborador não informado',
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
    } else {
      localStorage.setItem('lancamentosLicenca', JSON.stringify([novoRegistro, ...registrosAtuais]));
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

    localStorage.setItem('currentPage', 'ferias-e-afastamentos');
    window.dispatchEvent(new Event('storage'));

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
          <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold bg-blue-600 text-white">3</span>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-2xl mx-auto mt-2">
        <h2 className="text-lg font-bold mb-6">Configurações básicas</h2>
        <div className="relative mb-6" ref={buscaRef}>
          <div className={`flex items-center border rounded-lg px-4 py-2 bg-white transition ${mostrarSugestoes ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-300'} focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100`}>
            <input
              type="text"
              className="flex-1 bg-transparent text-sm !border-0 outline-none focus:!border-0 focus:!outline-none focus:!ring-0 focus:!ring-transparent"
              placeholder="Buscar funcionário por nome ou matrícula"
              value={buscaColaborador}
              onFocus={() => setMostrarSugestoes(buscaColaborador.trim().length > 0)}
              onChange={(e) => {
                const value = e.target.value;
                setBuscaColaborador(value);
                setMostrarSugestoes(value.trim().length > 0);

                if (colaboradorSelecionado) {
                  setColaboradorSelecionado(null);
                  localStorage.removeItem('colaboradorSelecionadoId');
                  localStorage.removeItem('colaboradorSelecionadoNome');
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
                      setColaboradorSelecionado(emp);
                      setBuscaColaborador(emp.nomeCompleto);
                      setMostrarSugestoes(false);
                      setErroConflito('');
                      localStorage.setItem('colaboradorSelecionadoId', emp.id);
                      localStorage.setItem('colaboradorSelecionadoNome', emp.nomeCompleto);
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
          {licencaSelecionada === 'Férias' && (
            <div className="flex gap-2">
              <div className="bg-white border rounded-lg px-4 py-2 text-xs text-gray-500 shadow-sm">Disponível<br /><span className="font-bold">--</span></div>
              <div className="bg-white border rounded-lg px-4 py-2 text-xs text-gray-500 shadow-sm">Dias usados<br /><span className="font-bold">--</span></div>
            </div>
          )}
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
          placeholder="Deixe um comentário..." 
          maxLength={144}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
        {/* Só mostra se for Férias */}
        {licencaSelecionada === 'Férias' && (
          <div className="mb-6">
            <span className="block mb-2 font-medium">Solicitar abono pecuniário?</span>
            <label className="mr-6 text-blue-600 font-medium flex items-center gap-1"><input type="radio" name="abono" value="sim" className="mr-1" defaultChecked /><span>Sim</span></label>
            <label className="text-gray-600 font-medium flex items-center gap-1"><input type="radio" name="abono" value="nao" className="mr-1" /><span>Não</span></label>
          </div>
        )}
        <div className="flex justify-between mt-8">
          <button className="border border-blue-600 text-blue-600 rounded-full px-6 py-2 font-medium hover:bg-blue-50 transition" onClick={handleVoltarEtapa2}>Voltar</button>
          <button className="bg-blue-600 text-white rounded-full px-6 py-2 font-semibold shadow hover:bg-blue-700 transition" onClick={handleFazerLancamento}>Fazer lançamento</button>
        </div>
      </div>
    </div>
  );
}
