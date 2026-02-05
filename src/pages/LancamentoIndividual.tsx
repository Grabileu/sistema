import React from "react";

export default function LancamentoIndividual() {
  // Função para voltar para etapa 2
  const handleVoltarEtapa2 = () => {
    localStorage.setItem('currentPage', 'lancamento-individual-ou-massa');
    window.dispatchEvent(new Event('storage'));
  };
  return (
    <div className="flex flex-col items-center min-h-screen bg-[#f6f7fb] p-6">
      {/* Barra de etapas */}
      <div className="w-full max-w-4xl mx-auto mt-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block text-blue-600">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" stroke="#2563eb" strokeWidth="2"/><path d="M8 8h8v8H8z" stroke="#2563eb" strokeWidth="2"/></svg>
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
        <div className="mb-6">
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-white">
            <input type="text" className="flex-1 outline-none text-sm" placeholder="Selecione o colaborador" />
            <span className="ml-2 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#6b7280" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2 shadow-sm">
            <span className="text-purple-500">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" stroke="#a78bfa" strokeWidth="2"/><path d="M8 8h8v8H8z" stroke="#a78bfa" strokeWidth="2"/></svg>
            </span>
            <span className="font-semibold">Férias</span>
          </div>
          <div className="flex gap-2">
            <div className="bg-white border rounded-lg px-4 py-2 text-xs text-gray-500 shadow-sm">Disponível<br /><span className="font-bold">--</span></div>
            <div className="bg-white border rounded-lg px-4 py-2 text-xs text-gray-500 shadow-sm">Dias usados<br /><span className="font-bold">--</span></div>
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 mb-1">Início</label>
            <input type="date" className="border rounded-lg px-3 py-2 w-full" />
          </div>
          <div className="w-1/2">
            <label className="block text-xs text-gray-500 mb-1">Término</label>
            <input type="date" className="border rounded-lg px-3 py-2 w-full" />
          </div>
        </div>
        <textarea className="w-full border rounded-lg px-3 py-2 mb-2" rows={3} placeholder="Deixe um comentário..." maxLength={144} />
        <div className="text-right text-xs text-gray-400 mb-4">0/144</div>
        {/* Só mostra se for Férias */}
        { (localStorage.getItem('licencaSelecionada') || 'Férias') === 'Férias' && (
          <div className="mb-6">
            <span className="block mb-2 font-medium">Solicitar abono pecuniário?</span>
            <label className="mr-6 text-blue-600 font-medium flex items-center gap-1"><input type="radio" name="abono" value="sim" className="mr-1" defaultChecked /><span>Sim</span></label>
            <label className="text-gray-600 font-medium flex items-center gap-1"><input type="radio" name="abono" value="nao" className="mr-1" /><span>Não</span></label>
          </div>
        )}
        <div className="mb-6">
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center cursor-pointer text-blue-600 bg-blue-50">
            <span className="block font-medium text-blue-600"><svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="mx-auto mb-1"><path d="M12 16v-8m0 8l-4-4m4 4l4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="4" width="16" height="16" rx="4" stroke="#2563eb" strokeWidth="2"/></svg></span>
            <span className="block font-medium">Selecione um arquivo</span>
            <span className="text-xs text-gray-400">ou arraste aqui</span>
          </div>
        </div>
        <div className="flex justify-between mt-8">
          <button className="border border-blue-600 text-blue-600 rounded-full px-6 py-2 font-medium hover:bg-blue-50 transition" onClick={handleVoltarEtapa2}>Voltar</button>
          <button className="bg-blue-600 text-white rounded-full px-6 py-2 font-semibold shadow hover:bg-blue-700 transition">Fazer lançamento</button>
        </div>
      </div>
    </div>
  );
}
