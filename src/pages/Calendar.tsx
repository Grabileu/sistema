import React, { useState } from 'react';
import { CalendarDays, ArrowLeft, ArrowRight, Filter, Cross, Grid, UserPlus, Search, User, MapPin } from 'lucide-react';

const collaborators = [
  {
    name: 'Administrador',
    cargo: 'Cargo Administrador',
    avatar: 'https://ui-avatars.com/api/?name=Administrador&background=E0E7EF&color=2563EB',
    events: [
      { day: 6, icon: <UserPlus size={18} /> },
      { day: 3, icon: <Grid size={18} /> },
    ],
  },
  {
    name: 'Antonio Miguel',
    cargo: 'Cargo Administrador',
    avatar: 'https://ui-avatars.com/api/?name=Antonio+Miguel&background=E0E7EF&color=2563EB',
    events: [
      { day: 6, icon: <UserPlus size={18} /> },
    ],
  },
  {
    name: 'Gabriel Umberto',
    cargo: 'Cargo Administrador',
    avatar: 'https://ui-avatars.com/api/?name=Gabriel+Umberto&background=E0E7EF&color=2563EB',
    events: [
      { day: 6, icon: <UserPlus size={18} /> },
    ],
  },
];

const weekDays = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const Calendar: React.FC = () => {
  const [monthIdx, setMonthIdx] = useState(1); // Fevereiro
  const [year, setYear] = useState(2026);
  const [search, setSearch] = useState('');
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIdx;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const month = months[monthIdx];

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays size={28} className="text-blue-700" />
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">Visualize informações e eventos importantes da sua empresa.</p>

        <div className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} className="text-blue-700" />
            <span className="font-semibold text-lg">{month} {year}</span>
            <button className="ml-2 p-1 rounded hover:bg-gray-100" onClick={() => setMonthIdx(idx => idx === 0 ? 11 : idx - 1)}><ArrowLeft size={18} /></button>
            <button className="p-1 rounded hover:bg-gray-100" onClick={() => setMonthIdx(idx => idx === 11 ? 0 : idx + 1)}><ArrowRight size={18} /></button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200"><MapPin size={18} /></button>
            <button className="p-2 rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"><Cross size={18} /></button>
            <button className="p-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"><Grid size={18} /></button>
            <button className="p-2 rounded border border-blue-300 text-blue-700 hover:bg-blue-50 bg-white"><UserPlus size={18} /></button>
            <div className="relative">
              <input type="text" placeholder="Nome" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 pr-3 py-2 rounded border border-gray-200 text-sm bg-white" />
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"><Filter size={16} />Filtrar</button>
          </div>
        </div>

        {/* Área principal: coluna de colaboradores + grade de calendário */}
        <div className="grid grid-cols-[220px_1fr] rounded-2xl shadow-lg bg-[#f5f6f8] overflow-x-auto border-l-2 border-r-2 border-t-2 border-gray-300 relative w-full max-w-[100vw] mt-0">
          {/* Coluna de colaboradores fixa */}
          <div>
            <div className="flex items-center gap-2 px-6 border-b border-r border-gray-300 h-12 bg-[#f5f6f8]" style={{height: '48px'}}>
              <User size={22} className="text-gray-400" />
              <span className="text-gray-400 font-semibold text-lg">Colaboradores</span>
            </div>
            {collaborators.map((colab, idx) => (
              <div key={colab.name} className="flex items-center gap-3 px-6 border-b border-r border-gray-300 h-20 bg-white" style={{height: '80px'}}>
                <img src={colab.avatar} alt={colab.name} className="w-10 h-10 rounded-full border border-blue-100" />
                <div className="flex flex-col justify-center w-[140px]">
                  <button className="text-blue-700 font-semibold text-base hover:underline text-left truncate w-full whitespace-nowrap overflow-hidden" style={{maxWidth: '140px'}}>{colab.name}</button>
                  <span className="text-xs text-gray-400 mt-1 truncate w-full whitespace-nowrap overflow-hidden" style={{maxWidth: '140px'}}>{colab.cargo}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Grade de calendário */}
          <div className="w-full">
            <table className="min-w-full border-separate border-spacing-0 w-full">
              <thead className="sticky top-0 z-10">
                <tr style={{height: '48px'}}>
                  {days.map(day => (
                    <th key={day} className={`w-[64px] min-w-[64px] max-w-[64px] py-0 px-2 text-center text-gray-700 font-bold border-r border-b border-gray-300 bg-[#f5f6f8] align-middle ${day === 1 ? 'border-l border-gray-300' : ''}`} style={{width: '64px', minWidth: '64px', maxWidth: '64px', height: '48px'}}>
                      <div className="flex flex-col justify-center h-full">
                        <span className="text-xl font-bold truncate w-full whitespace-nowrap overflow-hidden">{day}</span>
                        <span className="text-xs text-gray-400 truncate w-full whitespace-nowrap overflow-hidden">{weekDays[new Date(year, monthIdx, day).getDay()]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {collaborators.map((colab, idx) => (
                  <tr key={colab.name} style={{height: '80px'}}>
                    {days.map(day => (
                      <td key={day} className={`w-[64px] min-w-[64px] max-w-[64px] h-20 border-r border-b border-gray-300 bg-white hover:bg-gray-50 transition relative align-middle ${day === 1 ? 'border-l border-gray-300' : ''}`} style={{width: '64px', minWidth: '64px', maxWidth: '64px', height: '80px'}}>
                        {/* ...existing marcações visuais... */}
                        {idx === 0 && day === 6 && (
                          <div className="absolute inset-1 flex items-center justify-center">
                            <button className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-300 shadow-sm"><UserPlus size={18} /></button>
                          </div>
                        )}
                        {idx === 0 && day === 3 && (
                          <div className="absolute inset-1 flex items-center justify-center">
                            <div className="w-12 h-8 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center opacity-70" />
                          </div>
                        )}
                        {idx === 1 && day === 6 && (
                          <div className="absolute inset-1 flex items-center justify-center">
                            <button className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-300 shadow-sm"><UserPlus size={18} /></button>
                          </div>
                        )}
                        {idx === 2 && day === 6 && (
                          <div className="absolute inset-1 flex items-center justify-center">
                            <button className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-300 shadow-sm"><UserPlus size={18} /></button>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
