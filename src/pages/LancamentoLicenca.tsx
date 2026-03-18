import React, { useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';

const licencas = [
  // Mais usados primeiro
  { nome: 'Férias', icon: 'purple' },
  { nome: 'Afastamento', icon: 'red' },
  { nome: 'Atestado médico', icon: 'blue' },
  { nome: 'Licença Remunerada', icon: 'blue' },
  { nome: 'Licença', icon: 'blue' },
  { nome: 'Licença Maternidade', icon: 'blue' },
  { nome: 'Licença Paternidade', icon: 'blue' },
  { nome: 'Férias Coletiva', icon: 'blue' },
  { nome: 'Folga', icon: 'blue' },
  { nome: 'INSS', icon: 'blue' },
  { nome: 'Treinamento', icon: 'blue' },
  { nome: 'Justiça', icon: 'blue' },
  { nome: 'Happy Day', icon: 'blue' },
  { nome: 'Esqueci de Registrar', icon: 'blue' },
  { nome: 'Sem internet no momento de registrar', icon: 'blue' },
  // Demais opções
  { nome: 'Folga abonada', icon: 'blue' },
  { nome: 'Admissão', icon: 'blue' },
  { nome: 'Atestado médico - Invalidado', icon: 'blue' },
  { nome: 'Teletrabalho', icon: 'blue' },
  { nome: 'Acidente de Trabalho', icon: 'blue' },
  { nome: 'Outros', icon: 'blue' },
  { nome: 'Serviço Externo', icon: 'blue' },
  { nome: 'Quarentena', icon: 'blue' },
  { nome: 'Suspensão Contrato de Trabalho', icon: 'blue' },
  { nome: 'Serviço Obrigatório', icon: 'blue' },
  // Novas opções do print extra
  { nome: 'Licença Nojo', icon: 'blue' },
  { nome: 'Licença Gala', icon: 'blue' },
  { nome: 'Pleito Eleitoral', icon: 'blue' },
  { nome: 'Recesso Escolar', icon: 'blue' },
  { nome: 'Declaração de Comparecimento', icon: 'blue' },
  { nome: 'Recesso', icon: 'blue' },
  { nome: 'Rescisão', icon: 'blue' },
  { nome: 'Folga coletiva', icon: 'blue' },
  { nome: 'Exame de retorno ao trabalho', icon: 'blue' },
  { nome: 'Atestado de Amamentação', icon: 'blue' },
  { nome: 'Banco de horas', icon: 'blue' },
  { nome: 'Falecimento unilateral', icon: 'blue' },
  { nome: 'Falecimento colateral', icon: 'blue' },
  { nome: 'Liberados', icon: 'blue' },
  { nome: 'Obra Paralisada', icon: 'blue' },
  { nome: 'Licença não Remunerada', icon: 'blue' },
  { nome: 'Licença Gestante', icon: 'blue' },
  { nome: 'Suspensão Disciplinar', icon: 'blue' },
  { nome: 'Acompanhamento', icon: 'blue' },
  { nome: 'Folga de Campo', icon: 'blue' },
  { nome: 'SAT - Seguro Acidente de Trabalho', icon: 'blue' },
  { nome: 'Aposentadoria por invalidez', icon: 'blue' },
  { nome: 'Redução de jornada', icon: 'blue' },
  { nome: 'Atestado médico assid', icon: 'blue' },
  { nome: 'DP - FÉRIAS COLETIVAS', icon: 'blue' },
];

function getIcon(nome) {
  switch (nome) {
    case 'Férias':
      return (
        <span className="text-yellow-500">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fbbf24" strokeWidth="2"/><path d="M8 16l8-8" stroke="#fbbf24" strokeWidth="2"/><path d="M16 16l-8-8" stroke="#fbbf24" strokeWidth="2"/></svg>
        </span>
      );
    case 'Afastamento':
      return (
        <span className="text-red-500">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#ef4444" strokeWidth="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="#ef4444" strokeWidth="2"/></svg>
        </span>
      );
    case 'Atestado médico':
      return (
        <span className="text-green-500">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#22c55e" strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke="#22c55e" strokeWidth="2"/></svg>
        </span>
      );
    case 'Licença Remunerada':
      return (
        <span className="text-blue-500">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2"/><path d="M8 12h8" stroke="#3b82f6" strokeWidth="2"/></svg>
        </span>
      );
    case 'Licença':
      return (
        <span className="text-indigo-500">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" stroke="#6366f1" strokeWidth="2"/><path d="M8 8h8v8H8z" stroke="#6366f1" strokeWidth="2"/></svg>
        </span>
      );
    case 'Licença Maternidade':
      return (
        <span className="text-pink-500">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><ellipse cx="12" cy="15" rx="6" ry="4" stroke="#ec4899" strokeWidth="2"/><circle cx="12" cy="9" r="3" stroke="#ec4899" strokeWidth="2"/></svg>
        </span>
      );
    case 'Licença Paternidade':
      return (
        <span className="text-blue-800">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><ellipse cx="12" cy="15" rx="6" ry="4" stroke="#1e40af" strokeWidth="2"/><rect x="9" y="7" width="6" height="4" stroke="#1e40af" strokeWidth="2"/></svg>
        </span>
      );
    case 'Férias Coletiva':
      return (
        <span className="text-orange-500">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="8" rx="4" stroke="#f97316" strokeWidth="2"/><path d="M4 8l8 8 8-8" stroke="#f97316" strokeWidth="2"/></svg>
        </span>
      );
    case 'Folga':
      return (
        <span className="text-teal-500">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#14b8a6" strokeWidth="2"/><path d="M8 16l8-8" stroke="#14b8a6" strokeWidth="2"/></svg>
        </span>
      );
    default:
      return (
        <span className="text-blue-600">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" stroke="#2563eb" strokeWidth="2"/><path d="M8 8h8v8H8z" stroke="#2563eb" strokeWidth="2"/></svg>
        </span>
      );
  }
}

const LancamentoLicenca = () => {
      // Não limpar seleção ao abrir a tela, apenas ao clicar em "Voltar" da etapa 1
      // React.useEffect removido para manter seleção ao voltar
    // Função para voltar para tela inicial de Férias e Afastamentos
    const handleVoltarFeriasEAfastamentos = () => {
      // Limpa seleção e estado
      localStorage.removeItem('licencaSelecionada');
      localStorage.removeItem('licencaShowAll');
      localStorage.removeItem('tipoLancamento');
      localStorage.removeItem('colaboradorSelecionadoId');
      localStorage.removeItem('colaboradorSelecionadoNome');
      localStorage.removeItem('licencaEdicaoId');
      setSelectedIdx(null);
      setShowAll(false);
      setInputSearch("");
      localStorage.setItem('currentPage', 'ferias-e-afastamentos');
      window.dispatchEvent(new Event('storage'));
    };
  const [selectedIdx, setSelectedIdx] = useState<number | null>(() => {
    const saved = localStorage.getItem('licencaSelecionada');
    if (saved) {
      const idx = licencas.findIndex(l => l.nome === saved);
      return idx !== -1 ? idx : null;
    }
    return null;
  });
  const [showAll, setShowAll] = useState(() => {
    const savedShowAll = localStorage.getItem('licencaShowAll');
    return savedShowAll === 'true';
  });
  const [inputSearch, setInputSearch] = useState("");
  const [etapa, setEtapa] = useState(1);

  // Avançar etapa
  const handleNext = () => {
    // Salva a licença selecionada e o estado de mostrar mais no localStorage para persistir ao voltar
    if (selectedIdx !== null) {
      localStorage.setItem('licencaSelecionada', licencas[selectedIdx].nome);
    }
    localStorage.setItem('licencaShowAll', showAll ? 'true' : 'false');
    localStorage.setItem('currentPage', 'lancamento-individual-ou-massa');
    window.dispatchEvent(new Event('storage'));
  };
  // Voltar etapa (mantém para compatibilidade, mas só há etapa 1)
  const handlePrev = () => {};

  return (
    <div className="bg-[#f6f7fb] min-h-screen p-6 flex flex-col justify-between">
      <div>
        <div className="bg-white rounded-xl shadow p-8 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <span className="inline-block text-blue-600 mr-2">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M9 3h6a1 1 0 011 1v1h2a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2V4a1 1 0 011-1z" stroke="#2563eb" strokeWidth="2"/><path d="M9 5h6" stroke="#2563eb" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="#2563eb" strokeWidth="2"/></svg>
            </span>
            Lançamento de licença
          </h1>
          <p className="text-gray-500 text-sm">Faça o lançamento coletivo ou individual dos seus colaboradores.</p>
        </div>
        <hr className="mb-6" />
        {/* Etapas animadas */}
        {/* Barra de etapas 1---2---3---4, apenas etapa 1 ativa */}
        <div className="flex items-center justify-center w-full max-w-3xl mb-6 mx-auto">
          {/* Etapa 1 ativa */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold bg-blue-600 text-white scale-110 shadow-lg">1</div>
          <div className="flex-1 h-0.5 bg-blue-100 mx-2" />
          {/* Etapa 2 inativa */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold bg-gray-300 text-gray-600">2</div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
          {/* Etapa 3 inativa */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold bg-gray-300 text-gray-600">3</div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
          {/* Etapa 4 inativa */}
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold bg-gray-300 text-gray-600">4</div>
        </div>

        {/* Campo de busca */}
        <div className="flex justify-center mb-8">
          <div className="w-[420px]">
            <div className="relative flex-1">
            <input
              type="text"
              placeholder="Pesquisar"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              value={inputSearch}
              onChange={e => {
                setInputSearch(e.target.value);
              }}
            />
            <span className="absolute right-3 top-2.5 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#6b7280" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
            </span>
            </div>
          </div>
        </div>
        {/* Cards de licença */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
          {((inputSearch.trim() ? licencas.filter(l => l.nome.toLowerCase().includes(inputSearch.toLowerCase())) : (showAll ? licencas : licencas.slice(0, 5))).map((item, idx) => {
            // Para manter seleção correta ao filtrar
            const realIdx = licencas.findIndex(l => l.nome === item.nome);
            return (
              <div
                key={item.nome}
                className={`bg-white rounded-xl shadow flex flex-col items-center justify-center p-6 cursor-pointer transition border-2 ${selectedIdx === realIdx ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-blue-300'}`}
                onClick={() => {
                  setSelectedIdx(realIdx);
                  localStorage.setItem('licencaSelecionada', licencas[realIdx].nome);
                }}
              >
                {getIcon(item.nome)}
                <span className="mt-3 text-gray-700 font-semibold text-center text-sm">{item.nome}</span>
              </div>
            );
          }))}
        </div>
        {/* Botões finais */}
        <div className="flex items-center justify-between mt-12 px-2">
          <button className="text-blue-600 border border-blue-600 rounded-full px-6 py-2 font-semibold hover:bg-blue-50 transition" onClick={handleVoltarFeriasEAfastamentos}>Voltar</button>
          {showAll ? (
            <button className="text-blue-600 text-sm font-semibold" onClick={() => {
              setShowAll(false);
              localStorage.setItem('licencaShowAll', 'false');
              setSelectedIdx(null);
            }}>Ver menos</button>
          ) : (
            <button className="text-blue-600 text-sm font-semibold" onClick={() => {
              setShowAll(true);
              localStorage.setItem('licencaShowAll', 'true');
            }}>Mostrar mais</button>
          )}
          <button
            className={`rounded-full px-6 py-2 font-semibold shadow transition ${selectedIdx !== null ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-white hover:bg-gray-500 cursor-not-allowed'}`}
            disabled={selectedIdx === null}
            onClick={handleNext}
          >
            Próximo passo
          </button>
        </div>
      </div>
    {/* Estilos da transição de etapa */}
    <style>{`
      .fade-slide-enter {
        opacity: 0;
        transform: scale(0.8) translateY(20px);
      }
      .fade-slide-enter-active {
        opacity: 1;
        transform: scale(1) translateY(0);
        transition: opacity 400ms, transform 400ms;
      }
      .fade-slide-exit {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      .fade-slide-exit-active {
        opacity: 0;
        transform: scale(0.8) translateY(-20px);
        transition: opacity 400ms, transform 400ms;
      }
    `}</style>
    </div>
  );
};

export default LancamentoLicenca;
