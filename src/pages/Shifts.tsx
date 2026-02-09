// Componente para menu de ações dos turnos
function MenuTurnoActions({ idx, shift, shifts, setShifts, onNavigate }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-gray-100 rounded"
      >
        <MoreVertical size={20} className="text-gray-400" />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-50"
        >
          <button
            onClick={() => {
              setOpen(false);
              // Atualiza a data/hora de edição
              const novosTurnos = shifts.map((t, i) => i === idx ? {
                ...t,
                atualizadoEm: new Date().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              } : t);
              localStorage.setItem('turnos', JSON.stringify(novosTurnos));
              setShifts(novosTurnos);
              onNavigate && onNavigate('editar-turno-' + shift.codigo);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit2 size={16} />
            Editar
          </button>
          <button
            onClick={() => {
              setOpen(false);
              // Verifica se há funcionários cadastrados no turno
              const employees = JSON.parse(localStorage.getItem('employees') || '[]');
              const hasEmployees = employees.some(emp => emp.turno === shift.nome);
              if (hasEmployees) {
                alert('Não é possível excluir o turno. Existem funcionários cadastrados neste turno.');
                return;
              }
              if(window.confirm('Deseja realmente excluir este turno?')) {
                const novosTurnos = shifts.filter((_, i) => i !== idx);
                localStorage.setItem('turnos', JSON.stringify(novosTurnos));
                setShifts(novosTurnos);
              }
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState, useRef } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface ShiftsProps {
  onNavigate?: (route: string) => void;
}

const Shifts: React.FC<ShiftsProps> = ({ onNavigate }) => {
  const [shifts, setShifts] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState<{ [turno: string]: number }>({});

  useEffect(() => {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const counts: { [turno: string]: number } = {};
    employees.forEach((emp: any) => {
      if (emp.turno) {
        counts[emp.turno] = (counts[emp.turno] || 0) + 1;
      }
    });
    setEmployeeCounts(counts);
  }, []);
  useEffect(() => {
    const turnosSalvos = JSON.parse(localStorage.getItem('turnos') || '[]');
    setShifts(turnosSalvos);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lista de turnos</h1>
          <button
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded font-semibold"
            onClick={() => onNavigate && onNavigate('cadastro-turno')}
          >
            Cadastrar turno
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <svg className="text-gray-500" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#6B7280" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Turnos
            </h2>
            <p className="text-sm text-gray-600">Os turnos são onde você vai configurar os horários que seus funcionários devem cumprir.</p>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nome do turno</label>
              <input className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm" placeholder="Digite" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo do turno</label>
              <select className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm">
                <option>Todos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Turno segue as regras do ponto?</label>
              <select className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm">
                <option>Todos</option>
              </select>
            </div>
            <div className="flex items-end h-full">
              <button className="w-full bg-indigo-700 hover:bg-indigo-800 text-white rounded px-6 py-2 font-semibold">Pesquisar</button>
            </div>
          </div>
          <div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-3">Código</th>
                  <th className="py-3">Nome</th>
                  <th className="py-3">Nº funcionários</th>
                  <th className="py-3">Total por semana</th>
                  <th className="py-3">Criado em</th>
                  <th className="py-3">Atualizado em</th>
                  <th className="py-3">Regras do ponto</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-gray-400">Nenhum turno cadastrado.</td>
                  </tr>
                ) : (
                  shifts.map((shift, idx) => {
                    // Cálculo do total por semana
                    function parseTime(t) {
                      if (!t || !/^\d{2}:\d{2}$/.test(t)) return null;
                      const [h, m] = t.split(":").map(Number);
                      return h * 60 + m;
                    }
                    let total = 0;
                    if (shift.semana && Array.isArray(shift.semana)) {
                      shift.semana.forEach((item) => {
                        if (item.mark) {
                          const start = parseTime(item.start);
                          const end = parseTime(item.end);
                          const breakStart = parseTime(item.breakStart);
                          const breakEnd = parseTime(item.breakEnd);
                          if (start !== null && end !== null) {
                            let worked = end - start;
                            if (breakStart !== null && breakEnd !== null) {
                              worked -= (breakEnd - breakStart);
                            }
                            total += worked > 0 ? worked : 0;
                          }
                        }
                      });
                    }
                    const horas = Math.floor(total / 60);
                    const minutos = total % 60;
                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-4">{shift.codigo}</td>
                        <td className="py-4">{shift.nome}</td>
                        <td className="py-4 text-indigo-700 font-semibold cursor-pointer">
                          {employeeCounts[shift.nome] || 0}
                        </td>
                        <td className="py-4">{`${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`}</td>
                        <td className="py-4">{shift.criadoEm}</td>
                        <td className="py-4">{shift.atualizadoEm || '-'}</td>
                        <td className="py-4">
                          {shift.regras === 'Segue' ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#D1FAE5"/><path d="M8 12.5l2 2 4-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              Segue
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <MenuTurnoActions
                            idx={idx}
                            shift={shift}
                            shifts={shifts}
                            setShifts={setShifts}
                            onNavigate={onNavigate}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>
                {shifts.length === 0
                  ? 'Nenhum turno cadastrado.'
                  : `Página 1/1 - Exibindo ${shifts.length} de ${shifts.length} registros.`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shifts;
