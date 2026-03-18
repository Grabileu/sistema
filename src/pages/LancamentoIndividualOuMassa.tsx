import React, { useState } from "react";

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

export default function LancamentoIndividualOuMassa() {
  const [licencaSelecionada] = useState(() => localStorage.getItem('licencaSelecionada') || '');
  const [tipoLancamento, setTipoLancamento] = useState<'individual' | 'massa' | null>(() => {
    const saved = localStorage.getItem('tipoLancamento');
    if (saved === 'individual' || saved === 'massa') return saved;
    return null;
  });
    const [etapa, setEtapa] = useState(2);
    React.useEffect(() => {
      setEtapa(2);
    }, []);
    React.useEffect(() => {
      setEtapa(2);
    }, [tipoLancamento]);
  const handleVoltar = () => {
    localStorage.setItem('currentPage', 'lancamento-licenca');
    window.dispatchEvent(new Event('storage'));
  };

  return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="pt-5 px-8 md:px-12">
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-2xl">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M9 3h6a1 1 0 011 1v1h2a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2V4a1 1 0 011-1z" stroke="#2563eb" strokeWidth="2"/><path d="M9 5h6" stroke="#2563eb" strokeWidth="2"/><path d="M9 12l2 2 4-4" stroke="#2563eb" strokeWidth="2"/></svg>
            </span>
            <h1 className="text-2xl font-semibold text-gray-800">Lançamento de licença</h1>
          </div>
          <p className="text-gray-500 mt-1">Faça o lançamento coletivo ou individual dos seus colaboradores.</p>
        </div>
        {/* Centralização das etapas e opções */}
        <div className="flex flex-col items-center mt-0">
          <div className="flex items-center justify-center w-full max-w-3xl mb-2 mx-auto">{/* ...etapas... */}</div>
          <div className="flex justify-center items-center gap-8 mb-2">{/* ...cards... */}</div>
          <div className="flex justify-between items-center px-12 pb-8 w-full max-w-3xl mx-auto">{/* ...footer... */}</div>
        </div>
        {/* ...existing code para etapa 3 permanece igual... */}
        {etapa === 3 && (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="bg-white rounded-xl shadow p-8 w-[500px] mx-auto mt-12">
              <h2 className="text-xl font-bold mb-4">Configurações básicas</h2>
              <div className="mb-4">
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm" placeholder="Selecione o colaborador" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-purple-500">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" stroke="#a78bfa" strokeWidth="2"/><path d="M8 8h8v8H8z" stroke="#a78bfa" strokeWidth="2"/></svg>
                  </span>
                  <span className="font-semibold">Férias</span>
                </div>
                <div className="flex gap-2">
                  <button className="border rounded px-3 py-1 text-xs text-gray-500">Disponível --</button>
                  <button className="border rounded px-3 py-1 text-xs text-gray-500">Dias usados --</button>
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <input type="date" className="border rounded px-3 py-2 w-1/2" placeholder="Início" />
                <input type="date" className="border rounded px-3 py-2 w-1/2" placeholder="Término" />
              </div>
              <textarea className="w-full border rounded px-3 py-2 mb-4" rows={3} placeholder="Deixe um comentário..." maxLength={140} />
              <div className="mb-4">
                <span className="block mb-2">Solicitar abono pecuniário?</span>
                <label className="mr-4"><input type="radio" name="abono" value="sim" className="mr-1" />Sim</label>
                <label><input type="radio" name="abono" value="nao" className="mr-1" />Não</label>
              </div>
              <div className="mb-4">
                <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 text-center cursor-pointer text-blue-600">
                  <span className="block font-medium">Selecione um arquivo</span>
                  <span className="text-xs text-gray-400">ou arraste aqui</span>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button className="border border-blue-600 text-blue-600 rounded-full px-6 py-2 font-medium hover:bg-blue-50 transition">Voltar</button>
                <button className="bg-blue-600 text-white rounded-full px-6 py-2 font-semibold shadow hover:bg-blue-700 transition">Fazer lançamento</button>
              </div>
            </div>
          </div>
        )}

      {/* Etapas padrão */}
      <div className="flex items-center justify-center w-full max-w-3xl mt-5 mx-auto px-4">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-bold">1</span>
          </div>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
        {/* Step 2 (ativa) */}
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">2</span>
          </div>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-bold">3</span>
          </div>
        </div>
        {/* Só mostra a etapa 4 se o card em massa estiver selecionado */}
        {tipoLancamento === 'massa' && (
          <>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-bold">4</span>
              </div>
            </div>
          </>
        )}
      </div>

      {licencaSelecionada && (
        <div className="flex justify-center mt-4 px-4">
          <div className="inline-flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 shadow-sm">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
              {getLicencaIcon(licencaSelecionada)}
            </span>
            <div className="text-left">
              <span className="block text-xs font-semibold uppercase tracking-wide text-blue-600">Afastamento selecionado:</span>
              <span className="block text-sm font-bold text-gray-800">{licencaSelecionada}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cards - aparecem sempre */}
      <div className="flex flex-wrap justify-center items-center gap-6 mt-6 px-4">
        {/* Card Individual */}
        <div
          className={`rounded-xl shadow-md p-6 w-72 flex flex-col items-center cursor-pointer transition border-2 ${tipoLancamento === 'individual' ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:border-blue-300'}`}
          onClick={() => {
            setTipoLancamento('individual');
            localStorage.setItem('tipoLancamento', 'individual');
          }}
        >
          <svg width="56" height="56" fill="none" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#EFF6FF"/><path stroke="#2563eb" strokeWidth="2" d="M32 36c-6 0-12 3-12 7v3h24v-3c0-4-6-7-12-7z"/><circle cx="32" cy="24" r="8" stroke="#2563eb" strokeWidth="2"/></svg>
          <h2 className="text-lg font-semibold text-gray-800 mt-3">Lançamento individual</h2>
          <p className="text-gray-500 text-center mt-1.5">Selecione um colaborador para fazer um lançamento de licença</p>
        </div>
        {/* Card em Massa */}
        <div
          className={`rounded-xl shadow-md p-6 w-72 flex flex-col items-center cursor-pointer transition border-2 ${tipoLancamento === 'massa' ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:border-blue-300'}`}
          onClick={() => {
            setTipoLancamento('massa');
            localStorage.setItem('tipoLancamento', 'massa');
          }}
        >
          <svg width="56" height="56" fill="none" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#EFF6FF"/><path stroke="#2563eb" strokeWidth="2" d="M20 36c-6 0-12 3-12 7v3h24v-3c0-4-6-7-12-7z"/><circle cx="20" cy="24" r="8" stroke="#2563eb" strokeWidth="2"/><path stroke="#2563eb" strokeWidth="2" d="M44 36c-6 0-12 3-12 7v3h24v-3c0-4-6-7-12-7z"/><circle cx="44" cy="24" r="8" stroke="#2563eb" strokeWidth="2"/></svg>
          <h2 className="text-lg font-semibold text-gray-800 mt-3">Lançamento em massa</h2>
          <p className="text-gray-500 text-center mt-1.5">Configure a licença para mais de um colaborador.</p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="sticky bottom-0 z-10 mt-6 flex justify-between items-center px-8 md:px-12 py-4 border-t border-slate-100 bg-white/95 backdrop-blur">
        <button
          className="border border-blue-600 text-blue-600 rounded-full px-6 py-2 font-medium hover:bg-blue-50 transition"
          onClick={handleVoltar}
        >
          Voltar
        </button>
        <button
          className={`rounded-full px-6 py-2 font-semibold shadow transition ml-4 ${tipoLancamento ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-white hover:bg-gray-500 cursor-not-allowed'}`}
          disabled={!tipoLancamento}
          onClick={() => {
            if (tipoLancamento === 'individual') {
              localStorage.setItem('tipoLancamento', 'individual');
              localStorage.setItem('currentPage', 'lancamento-individual');
              window.dispatchEvent(new Event('storage'));
            } else if (tipoLancamento === 'massa') {
              localStorage.setItem('tipoLancamento', 'massa');
              localStorage.setItem('currentPage', 'lancamento-massa');
              window.dispatchEvent(new Event('storage'));
            }
          }}
        >
          Próximo passo
        </button>
      </div>
    </div>
  );
}
