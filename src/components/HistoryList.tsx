import React, { useEffect, useState } from 'react';
import { Baby, Ban, Briefcase, CakeSlice, CalendarDays, Clock3, Coffee, Palmtree, Search as SearchIcon, Stethoscope, UserMinus, UserPlus, UserX } from 'lucide-react';
import DatePicker from './DatePicker';
import Select from './Select';

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
  onClearHistory: () => void;
}

const tipoLabel: Record<string, string> = {
  falta: 'Falta',
  atraso: 'Atraso',
  licenca: 'Licença',
  admissao: 'Admissão',
  demissao: 'Demissão',
  outro: 'Outro',
};

const operationLabel = (action: string) => {
  const normalized = action.toLowerCase();
  if (normalized.includes('excluiu') || normalized.includes('removeu')) return 'Exclusão';
  if (normalized.includes('editou') || normalized.includes('atualizou')) return 'Atualização';
  if (normalized.includes('adicionou') || normalized.includes('cadastrou') || normalized.includes('criou')) return 'Cadastro';
  return 'Ação';
};

const operationVerb = (action: string) => {
  const normalized = action.toLowerCase();
  if (normalized.includes('editou') || normalized.includes('atualizou')) return 'modificou';
  if (normalized.includes('adicionou') || normalized.includes('cadastrou') || normalized.includes('criou')) return 'cadastrou';
  if (normalized.includes('excluiu') || normalized.includes('removeu')) return 'excluiu';
  return 'realizou';
};

const actionObject = (action: string) => {
  const normalized = action.toLowerCase();

  if (normalized.startsWith('adicionou ')) return normalized.replace('adicionou ', '');
  if (normalized.startsWith('editou ')) return normalized.replace('editou ', '');
  if (normalized.startsWith('atualizou ')) return normalized.replace('atualizou ', '');
  if (normalized.startsWith('cadastrou ')) return normalized.replace('cadastrou ', '');
  if (normalized.startsWith('criou ')) return normalized.replace('criou ', '');
  if (normalized.startsWith('excluiu ')) return normalized.replace('excluiu ', '');
  if (normalized.startsWith('removeu ')) return normalized.replace('removeu ', '');

  return normalized;
};

const extractFuncionarioFromAlvo = (alvo: string) => {
  const trimmed = (alvo || '').trim();
  if (!trimmed) return '';

  if (trimmed.toLowerCase().startsWith('para ')) {
    return trimmed.slice(5).trim();
  }

  return trimmed;
};

const capitalizeWords = (text: string) =>
  text
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const buildHistoryParts = (entry: HistoryEntry) => {
  const usuario = entry.usuario?.trim() || 'Usuário';
  const verbo = operationVerb(entry.acao);
  const objeto = capitalizeWords(actionObject(entry.acao));
  const funcionario = extractFuncionarioFromAlvo(entry.alvo || '');

  return { usuario, verbo, objeto, funcionario };
};

const parseBrDateToRangeBoundary = (date: string, endOfDay: boolean) => {
  if (!date) return null;

  const brMatch = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, dd, mm, yyyy] = brMatch;
    const hours = endOfDay ? '23:59:59' : '00:00:00';
    return new Date(`${yyyy}-${mm}-${dd}T${hours}`);
  }

  const fallback = new Date(date);
  if (Number.isNaN(fallback.getTime())) return null;
  return fallback;
};

const formatEvento = (evento?: string) => {
  if (!evento) return '-';
  if (evento.includes(' a ')) {
    const [inicio, fim] = evento.split(' a ');
    const inicioFmt = new Date(inicio).toLocaleDateString('pt-BR');
    const fimFmt = new Date(fim).toLocaleDateString('pt-BR');
    return `${inicioFmt} a ${fimFmt}`;
  }
  return new Date(evento).toLocaleDateString('pt-BR');
};

const normalizeObservacao = (detalhes?: string) => {
  if (!detalhes) return '';

  const trimmed = detalhes.trim();
  const withoutPrefix = trimmed
    .replace(/^obs\.?\s*:\s*/i, '')
    .replace(/^observa[cç][aã]o\s*:\s*/i, '')
    .replace(/^motivo\s*:\s*/i, '');

  return withoutPrefix.trim();
};

const getHistoryIcon = (entry: HistoryEntry) => {
  const normalized = `${entry.acao || ''} ${entry.detalhes || ''}`.toLowerCase();

  const isAtestado = /atestado|m[ée]dico|amamenta/.test(normalized);
  const isMaternidade = /maternidade|gestante/.test(normalized);
  const isHappyDay = /happy day/.test(normalized);
  const isAfastamento = /afastamento|suspens|rescis|falecimento|nojo/.test(normalized);
  const isFerias = /férias|ferias|praia|férias coletiva|ferias coletiva/.test(normalized);
  const isFolga = /folga|recesso|banco de horas/.test(normalized);
  const isTrabalho = /teletrabalho|servi[çc]o|treinamento|exame|declaração|justi[çc]a|pleito|obra|quarentena/.test(normalized);

  const badge = (tone: string, icon: React.ReactNode) => (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${tone}`}>
      {icon}
    </span>
  );

  if (entry.tipo === 'falta') return badge('border-red-200 bg-red-50 text-red-600', <UserX size={14} strokeWidth={2.2} />);
  if (entry.tipo === 'atraso') return badge('border-amber-200 bg-amber-50 text-amber-600', <Clock3 size={14} strokeWidth={2.2} />);
  if (entry.tipo === 'admissao') return badge('border-green-200 bg-green-50 text-green-600', <UserPlus size={14} strokeWidth={2.2} />);
  if (entry.tipo === 'demissao') return badge('border-slate-200 bg-slate-50 text-slate-600', <UserMinus size={14} strokeWidth={2.2} />);

  if (isAtestado) return badge('border-emerald-200 bg-emerald-50 text-emerald-600', <Stethoscope size={14} strokeWidth={2.2} />);
  if (isMaternidade) return badge('border-pink-200 bg-pink-50 text-pink-600', <Baby size={14} strokeWidth={2.2} />);
  if (isHappyDay) return badge('border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600', <CakeSlice size={14} strokeWidth={2.2} />);
  if (isAfastamento) return badge('border-rose-200 bg-rose-50 text-rose-600', <Ban size={14} strokeWidth={2.2} />);
  if (isFerias) return badge('border-amber-200 bg-amber-50 text-amber-600', <Palmtree size={14} strokeWidth={2.2} />);
  if (isFolga) return badge('border-teal-200 bg-teal-50 text-teal-600', <Coffee size={14} strokeWidth={2.2} />);
  if (isTrabalho) return badge('border-sky-200 bg-sky-50 text-sky-600', <Briefcase size={14} strokeWidth={2.2} />);

  return badge('border-indigo-200 bg-indigo-50 text-indigo-600', <CalendarDays size={14} strokeWidth={2.2} />);
};

const HistoryList: React.FC<HistoryListProps> = ({ entries, onClearHistory }) => {
  const ITEMS_PER_PAGE = 30;
  const [search, setSearch] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [tipo, setTipo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const dateEndRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hasMountedPageEffectRef = React.useRef(false);
  const [applied, setApplied] = useState({ search: '', dateStart: '', dateEnd: '', tipo: '' });

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const handleApplyFilters = () => {
    setApplied({ search, dateStart, dateEnd, tipo });
  };

  // Filtro só é aplicado quando clica em Pesquisar
  const filtered = entries.filter((h) => {
    const searchNormalized = applied.search.trim().toLowerCase();
    const nomeMatch =
      searchNormalized === '' ||
      h.alvo.toLowerCase().includes(searchNormalized) ||
      h.usuario.toLowerCase().includes(searchNormalized) ||
      h.acao.toLowerCase().includes(searchNormalized) ||
      (h.detalhes || '').toLowerCase().includes(searchNormalized);

    const dataRegistro = new Date(h.dataRegistro);
    const startDate = parseBrDateToRangeBoundary(applied.dateStart, false);
    const endDate = parseBrDateToRangeBoundary(applied.dateEnd, true);
    const startOK = !startDate || dataRegistro >= startDate;
    const endOK = !endDate || dataRegistro <= endDate;

    const typeMatch = applied.tipo === '' || h.tipo === applied.tipo;

    const recordDate = new Date(h.dataRegistro);
    const monthMatch =
      !Number.isNaN(recordDate.getTime()) &&
      recordDate.getMonth() === currentMonth &&
      recordDate.getFullYear() === currentYear;

    return nomeMatch && startOK && endOK && typeMatch && monthMatch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [applied.search, applied.dateStart, applied.dateEnd, applied.tipo, entries.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const displayStart = filtered.length === 0 ? 0 : startIndex + 1;
  const displayEnd = startIndex + paginated.length;

  useEffect(() => {
    if (!hasMountedPageEffectRef.current) {
      hasMountedPageEffectRef.current = true;
      return;
    }

    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [safePage]);

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow p-6">
      {/* Filtros padrão sistema */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-4">
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
            <label className="text-xs text-gray-500">Tipo de registro</label>
            <div className="mt-1">
              <Select
                value={tipo}
                onChange={(value) => setTipo(String(value))}
                options={[
                  { label: 'Todos', value: '' },
                  { label: 'Falta', value: 'falta' },
                  { label: 'Atraso', value: 'atraso' },
                  { label: 'Licença', value: 'licenca' },
                  { label: 'Admissão', value: 'admissao' },
                  { label: 'Demissão', value: 'demissao' },
                  { label: 'Outro', value: 'outro' },
                ]}
                buttonClassName="h-10"
              />
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

      <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          Exibindo <b className="text-gray-700">{displayStart}</b>-<b className="text-gray-700">{displayEnd}</b> de <b className="text-gray-700">{filtered.length}</b> registro(s) do mês atual
        </span>
        <button
          type="button"
          onClick={onClearHistory}
          disabled={entries.length === 0}
          className="h-8 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpar histórico
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-8 text-xs">Nenhum histórico encontrado.</div>
      ) : (
        <>
          <ul className="space-y-3">
          {paginated.map((h) => (
            (() => {
              const sentence = buildHistoryParts(h);
              return (
            <li key={h.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:shadow-sm transition">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {getHistoryIcon(h)}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-900">
                      <span className="font-semibold">{sentence.usuario}</span>{' '}
                      <span>{sentence.verbo}</span>{' '}
                      <span className="font-semibold">{sentence.objeto}</span>
                      {sentence.funcionario && (
                        <>
                          {' '}<span>para</span>{' '}
                          <span className="font-semibold">{sentence.funcionario}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-gray-200 text-[10px] font-medium text-gray-700">{tipoLabel[h.tipo] || h.tipo}</span>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-[10px] font-medium text-blue-700">{operationLabel(h.acao)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1 text-xs text-gray-700 md:grid-cols-2">
                <div>
                  <span className="font-medium text-gray-600">Registro:</span>{' '}
                  <span className="font-semibold text-gray-900">{new Date(h.dataRegistro).toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Evento:</span>{' '}
                  <span className="font-semibold text-gray-900">{formatEvento(h.dataEvento)}</span>
                </div>
              </div>

              {normalizeObservacao(h.detalhes) && (
                <div className="mt-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700">
                  <span className="font-medium text-gray-600">Observações:</span> {normalizeObservacao(h.detalhes)}
                </div>
              )}
            </li>
              );
            })()
          ))}
          </ul>

          {filtered.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="h-8 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-xs text-gray-600">
                Página {safePage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="h-8 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryList;
