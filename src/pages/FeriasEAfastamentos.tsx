import React from 'react';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function CalendarMonth({ month, year, isCurrent }) {
  // Gera os dias do mês
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array(firstDay).fill('');
  const daysArr = [...blanks, ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];

  return (
    <div className="bg-white rounded-xl p-4 flex-1 min-w-[270px] max-w-[320px] border border-gray-300 transition-all">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-gray-700 text-base tracking-wide">{months[month]}</span>
        {isCurrent && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold">Mês atual</span>}
      </div>
      <div className="grid grid-cols-7 text-xs text-gray-400 mb-1 font-semibold gap-x-0.5">
        {days.map(d => <div key={d} className="text-center uppercase tracking-tight">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 gap-x-0.5 text-sm">
        {daysArr.map((d, i) => (
          <div
            key={i}
            className={`h-7 flex items-center justify-center rounded text-gray-700 font-medium ${d ? '' : 'bg-transparent'}`}
          >
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
}

const FeriasEAfastamentos = ({ onNovoLancamento }) => {
  const year = 2026;
  const currentMonth = new Date().getMonth();

  return (
    <div className="p-6 bg-[#f6f7fb] min-h-screen">
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="inline-block text-blue-600 mr-2">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </span>
              Férias e Afastamentos
            </h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie de forma eficiente as férias, afastamentos e solicitações dos seus colaboradores.</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-blue-600 text-sm hover:underline">Como é calculado as férias?</a>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => {
                localStorage.setItem('currentPage', 'lancamento-licenca');
                window.dispatchEvent(new Event('storage'));
              }}
            >
              Fazer novo lançamento
            </button>
          </div>
        </div>
        <hr className="my-3 border-gray-200" />
        <div className="flex gap-8 border-b border-gray-200">
          <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2 px-1">Calendário</button>
          <button className="text-gray-700 font-semibold pb-2 px-1">Disponibilidade</button>
          <button className="text-gray-700 font-semibold pb-2 px-1">Solicitações</button>
          <button className="text-gray-700 font-semibold pb-2 px-1">Fluxo de aprovação</button>
        </div>
      </div>
      {/* Barra de filtros: seletor de ano à esquerda, filtros à direita */}
      <div className="bg-[#f4f5f8] border border-gray-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-2">
          <span className="text-gray-400"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#bdbdbd" strokeWidth="2"/><text x="12" y="17" textAnchor="middle" fontSize="10" fill="#333">2026</text></svg></span>
          <span className="text-gray-700 text-sm font-medium">2026</span>
          <button className="text-gray-400 hover:text-gray-600 px-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#bdbdbd" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg></button>
          <button className="text-gray-400 hover:text-gray-600 px-1"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#bdbdbd" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></button>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Nome" className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white" />
          <button className="flex items-center gap-1 border border-gray-200 rounded px-3 py-1.5 text-sm bg-white text-gray-700"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#6b7280" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>Filtrar</button>
          <button className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white text-blue-700 font-semibold">Anual</button>
          <button className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white text-gray-500">Mensal</button>
          <button className="border border-gray-200 rounded px-3 py-1.5 text-sm bg-white"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#6b7280" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </div>
      </div>
      {/* Cards de pendências e ausências */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">0</span>
            <span className="text-gray-700 font-semibold">Pendências</span>
          </div>
          <div className="mb-2">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="3" stroke="#a3a3a3" strokeWidth="2"/></svg>
          </div>
          <div className="text-center text-gray-500 text-sm">Tudo certo por aqui!<br/>Nenhuma solicitação pendente no momento.<br/>Aproveite para descansar! 😊</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">0</span>
            <span className="text-gray-700 font-semibold">Ausências este mês</span>
          </div>
          <div className="mb-2">
            {/* Ícone praia */}
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><g><ellipse cx="24" cy="40" rx="16" ry="4" fill="#e0e7ff"/><path d="M16 32c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#2563eb" strokeWidth="2"/><path d="M24 32v-8" stroke="#2563eb" strokeWidth="2"/><path d="M32 32c0-4.418-3.582-8-8-8s-8 3.582-8 8" stroke="#2563eb" strokeWidth="2"/></g></svg>
          </div>
          <div className="text-center text-gray-700 font-semibold text-lg mb-1">Sem ausências</div>
          <div className="text-center text-gray-500 text-sm">Nenhuma ausência registrada este mês. Todos estarão presentes no trabalho.</div>
        </div>
        {/* Espaço para mais cards se necessário */}
      </div>
      {/* Calendário anual */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((m, idx) => (
          <CalendarMonth key={m} month={idx} year={year} isCurrent={idx === currentMonth} />
        ))}
      </div>
    </div>
  );
};

export default FeriasEAfastamentos;
