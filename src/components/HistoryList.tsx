import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import DatePicker from './DatePicker';

export interface HistoryEntry {
  id: string;
  usuario: string;
  acao: string;
  alvo: string;
  tipo: 'falta' | 'atraso' | 'licenca' | 'admissao' | 'demissao' | 'outro';
  dataRegistro: string; // data/hora da ação
  dataEvento?: string; // data do evento (ex: dia da falta)
  detalhes?: string;
}

interface HistoryListProps {
  entries: HistoryEntry[];
}

const tipoLabel: Record<string, string> = {
  falta: 'Falta',
  atraso: 'Atraso',
  licenca: 'Licença',
  admissao: 'Admissão',
  demissao: 'Demissão',
  outro: 'Outro',
};

const HistoryList: React.FC<HistoryListProps> = ({ entries }) => {
  const [search, setSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const dateEndRef = React.useRef<HTMLInputElement>(null);
  const [applied, setApplied] = useState({ search: '', dateStart: '', dateEnd: '' });

  const handleApplyFilters = () => {
    setApplied({ search, dateStart, dateEnd });
  };

  // Filtro só é aplicado quando clica em Pesquisar
  const filtered = entries.filter((h) => {
    const nomeMatch =
      applied.search.trim() === '' ||
      h.alvo.toLowerCase().includes(applied.search.trim().toLowerCase()) ||
      h.usuario.toLowerCase().includes(applied.search.trim().toLowerCase());
    const dataRegistro = new Date(h.dataRegistro);
    const startOK = !applied.dateStart || dataRegistro >= new Date(applied.dateStart + 'T00:00:00');
    const endOK = !applied.dateEnd || dataRegistro <= new Date(applied.dateEnd + 'T23:59:59');
    return nomeMatch && startOK && endOK;
  });

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Filtros padrão sistema */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-gray-500">Funcionário ou usuário</label>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Comece digitando o nome"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 bg-gray-100 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:border-blue-300 focus:ring-blue-100 pr-9"
              />
              <SearchIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Data início (registro)</label>
            <div className="mt-1">
              <DatePicker
                value={dateStart}
                onChange={setDateStart}
                placeholder="DD/MM/AAAA"
                className="w-full h-10"
                nextRef={dateEndRef}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">Data fim (registro)</label>
            <div className="mt-1">
              <DatePicker
                value={dateEnd}
                onChange={setDateEnd}
                placeholder="DD/MM/AAAA"
                className="w-full h-10"
                ref={dateEndRef}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="w-full h-10 bg-indigo-600 text-white px-4 rounded-md text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center"
            >
              Pesquisar
            </button>
          </div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-8 text-xs">Nenhum histórico encontrado.</div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((h) => (
            <li key={h.id} className="flex gap-2 items-start bg-gray-50 rounded p-2 border border-gray-200 hover:shadow-sm transition relative">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs">
                {h.usuario[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1 items-center mb-0.5">
                  <span className="font-semibold text-gray-900 text-xs">{h.usuario}</span>
                  <span className="text-gray-600 text-xs">{h.acao}</span>
                  <span className="text-gray-900 font-semibold text-xs">{h.alvo}</span>
                  <span className="inline-block px-1 py-0.5 rounded bg-gray-200 text-[10px] font-medium text-gray-700">{tipoLabel[h.tipo] || h.tipo}</span>
                </div>
                <div className="text-[10px] text-gray-500 mb-0.5">
                  {(() => {
                    // Suporte a período: dataEvento pode ser "2026-03-13" ou "2026-03-13 a 2026-03-15"
                    if (!h.dataEvento) return null;
                    if (h.dataEvento.includes(' a ')) {
                      const [inicio, fim] = h.dataEvento.split(' a ');
                      const inicioFmt = new Date(inicio).toLocaleDateString('pt-BR');
                      const fimFmt = new Date(fim).toLocaleDateString('pt-BR');
                      return <span>Evento: <b>{inicioFmt} a {fimFmt}</b></span>;
                    } else {
                      return <span>Evento: <b>{new Date(h.dataEvento).toLocaleDateString('pt-BR')}</b></span>;
                    }
                  })()}
                </div>
                {h.detalhes && (
                  <div className="text-xs text-gray-700 mt-0.5">
                    {h.detalhes}
                  </div>
                )}
              </div>
              <span className="absolute right-2 bottom-1 text-[10px] text-gray-400 select-none">Criado em {new Date(h.dataRegistro).toLocaleString('pt-BR')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryList;
