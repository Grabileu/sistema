import React from 'react'
import { Search, CalendarDays, ChevronDown } from 'lucide-react'

const teamMembers = [
  { name: 'Claudia Mar...', role: 'Administradora' },
  { name: 'Edu Siplaki', role: 'Assistente' },
  { name: 'Gustavo Fur..', role: 'Assistente' },
  { name: 'João Neto', role: 'Administrativo' },
  { name: 'Kelly Olive..', role: 'Auxiliar De...' },
  { name: 'Larissa Vie..', role: 'Administrativo' },
  { name: 'Magna Sil..', role: 'Administrativo' },
]

const dayRecords = [
  { day: 'Qui', date: '17/07', registros: '-', foto: 'green', ht: '00:00', hi: '00:00', hn: '00:00', he: '00:00', hf: '00:00', situacao: 'Sem Registro', he1: '00:00' },
  { day: 'Qua', date: '16/07', registros: '-', foto: 'green', ht: '00:00', hi: '00:00', hn: '00:00', he: '00:00', hf: '00:00', situacao: 'Concluído', he1: '00:00' },
  { day: 'Ter', date: '15/07', registros: '-', foto: 'green', ht: '00:00', hi: '00:00', hn: '00:00', he: '00:00', hf: '00:00', situacao: 'Concluído', he1: '00:00' },
  { day: 'Seg', date: '14/07', registros: '-', foto: 'green', ht: '00:00', hi: '00:00', hn: '00:00', he: '00:00', hf: '00:00', situacao: 'Concluído', he1: '00:00' },
  { day: 'Dom', date: '13/07', registros: '-', foto: 'green', ht: '00:00', hi: '00:00', hn: '00:00', he: '00:00', hf: '00:00', situacao: 'Concluído', he1: '00:00' },
  { day: 'Sáb', date: '12/07', registros: '-', foto: 'green', ht: '00:00', hi: '00:00', hn: '00:00', he: '00:00', hf: '00:00', situacao: 'Concluído', he1: '00:00' },
  { day: 'Sex', date: '11/07', registros: '-', foto: 'green', ht: '00:00', hi: '00:00', hn: '00:00', he: '00:00', hf: '00:00', situacao: 'Concluído', he1: '00:00' },
]

const EspelhoDePonto: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid w-full gap-4 lg:grid-cols-[1.8fr_1fr_1.3fr]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:bg-white"
                placeholder="Comece digitando o nome"
                aria-label="Funcionário"
              />
            </label>

            <button className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-slate-300">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Equipe</div>
                <div className="mt-1 font-semibold text-slate-900">Nenhuma</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            <button className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:border-slate-300">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Período</div>
                <div className="mt-1 font-semibold text-slate-900">Mês atual - Julho</div>
              </div>
              <CalendarDays className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          <button className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300">
            Mais filtros
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-lg font-bold text-slate-800">A</div>
              <div>
                <div className="text-base font-semibold text-slate-900">Administrador Marq Testes</div>
                <div className="text-sm text-slate-500">Ceo</div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                0 ocorrências
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                0 faltas
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                0 abonos
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">Saldo do período: 00:00</div>
                <div className="text-slate-500">Saldo acumulado: -48:00</div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-3 overflow-x-auto px-4 py-4">
            {teamMembers.map((member) => (
              <div key={member.name} className="min-w-[190px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200 text-sm font-semibold text-slate-700">{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                  <div className="text-sm font-medium text-slate-900">{member.name}</div>
                </div>
                <div className="text-xs text-slate-500">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Turno</div>
              <div className="text-xl font-semibold text-slate-900">Livre/Folguista</div>
            </div>
            <div className="text-sm text-slate-500">Visualização de 7 dias</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Dias</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Registros</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Fotos</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">H.T</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">H.I</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">H.N</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">H.E</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">H.F</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">Situação</th>
                <th className="whitespace-nowrap px-4 py-4 text-left font-semibold">H.E 1 (0%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {dayRecords.map((record) => (
                <tr key={record.day + record.date} className="group">
                  <td className="whitespace-nowrap px-4 py-4 text-slate-900 font-medium">{record.day} - {record.date}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{record.registros}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{record.ht}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{record.hi}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{record.hn}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{record.he}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{record.hf}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{record.situacao}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{record.he1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EspelhoDePonto
