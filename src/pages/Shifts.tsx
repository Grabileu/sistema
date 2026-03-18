// Componente para menu de ações dos turnos
function MenuTurnoActions({ shift, shifts, setShifts, onNavigate, onBlockedDelete, onRequestDelete }) {
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
              const novosTurnos = shifts.map((t) => t.codigo === shift.codigo ? {
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
              const linkedEmployees = employees.filter(emp => emp.turno === shift.nome);
              if (linkedEmployees.length > 0) {
                onBlockedDelete?.(shift.nome, linkedEmployees);
                return;
              }

              onRequestDelete?.(shift.codigo, shift.nome);
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
import { MoreVertical, Edit2, Trash2, AlertTriangle, X } from 'lucide-react';
import Select from '../components/Select';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface ShiftsProps {
  onNavigate?: (route: string) => void;
}

const Shifts: React.FC<ShiftsProps> = ({ onNavigate }) => {
  const [shifts, setShifts] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState<{ [turno: string]: number }>({});
  const [blockedShiftDelete, setBlockedShiftDelete] = useState<{ turnoNome: string; employees: any[] } | null>(null)
  const [pendingShiftDelete, setPendingShiftDelete] = useState<{ shiftCode: string; shiftName: string } | null>(null)
  const [inputFilters, setInputFilters] = useState({ nome: '', tipo: '', regras: '' })
  const [appliedFilters, setAppliedFilters] = useState({ nome: '', tipo: '', regras: '' })

  const handleConfirmDeleteShift = () => {
    if (!pendingShiftDelete) {
      return;
    }

    setShifts((prevShifts) => {
      const nextShifts = prevShifts.filter((shift: any) => shift.codigo !== pendingShiftDelete.shiftCode);
      localStorage.setItem('turnos', JSON.stringify(nextShifts));
      return nextShifts;
    });

    setPendingShiftDelete(null);
  };

  const cancelPendingShiftDelete = () => {
    setPendingShiftDelete(null);
  };

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

  const tipoValues = Array.from(
    new Set([
      'Semanal',
      'Sem HR Fixa',
      'Livre/Folguista',
      ...shifts.map((shift: any) => shift.tipo).filter(Boolean)
    ])
  )

  const tipoOptions = [
    { label: 'Todos', value: '' },
    ...tipoValues.map((tipo) => ({
      label: String(tipo),
      value: String(tipo)
    }))
  ]

  const regrasOptions = [
    { label: 'Todos', value: '' },
    { label: 'Segue', value: 'Segue' },
    { label: 'Não seguir', value: 'Não segue' }
  ]

  const filteredShifts = shifts.filter((shift: any) => {
    if (appliedFilters.nome && !String(shift.nome || '').toLowerCase().includes(appliedFilters.nome.toLowerCase())) {
      return false
    }

    if (appliedFilters.tipo && shift.tipo !== appliedFilters.tipo) {
      return false
    }

    if (appliedFilters.regras && shift.regras !== appliedFilters.regras) {
      return false
    }

    return true
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      {blockedShiftDelete && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/45 backdrop-blur-sm px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Exclusao bloqueada</h2>
                  <p className="text-sm text-gray-600">
                    Nao foi possivel excluir o turno "{blockedShiftDelete.turnoNome}" porque ha funcionario(s) vinculado(s).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBlockedShiftDelete(null)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="mb-3 text-sm font-medium text-gray-800">
                Funcionarios vinculados ({blockedShiftDelete.employees.length})
              </p>
              <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Matricula</th>
                      <th className="px-3 py-2 font-medium">Nome</th>
                      <th className="px-3 py-2 font-medium">Cargo</th>
                      <th className="px-3 py-2 font-medium">Equipe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedShiftDelete.employees.map((employee: any) => (
                      <tr key={employee.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-700">{employee.matricula || '-'}</td>
                        <td className="px-3 py-2 text-gray-900">{employee.nomeCompleto}</td>
                        <td className="px-3 py-2 text-gray-700">{employee.cargo || '-'}</td>
                        <td className="px-3 py-2 text-gray-700">{employee.equipe || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingShiftDelete && (
        <DeleteConfirmModal
          title="Excluir turno"
          description="Tem certeza que deseja excluir o turno abaixo?"
          itemName={pendingShiftDelete.shiftName}
          onConfirm={handleConfirmDeleteShift}
          onCancel={cancelPendingShiftDelete}
        />
      )}

      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Lista de turnos</h1>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700"
            onClick={() => onNavigate && onNavigate('cadastro-turno')}
          >
            Cadastrar turno
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="bg-white shadow rounded-lg p-6">
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
              <input
                className="w-full px-4 py-2 rounded border border-gray-200 bg-gray-50 text-sm"
                placeholder="Digite"
                value={inputFilters.nome}
                onChange={(e) => setInputFilters((prev) => ({ ...prev, nome: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo do turno</label>
              <Select
                value={inputFilters.tipo}
                onChange={(value) => setInputFilters((prev) => ({ ...prev, tipo: String(value) }))}
                options={tipoOptions}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Turno segue as regras do ponto?</label>
              <Select
                value={inputFilters.regras}
                onChange={(value) => setInputFilters((prev) => ({ ...prev, regras: String(value) }))}
                options={regrasOptions}
              />
            </div>
            <div className="flex items-end h-full">
              <button
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white rounded px-6 py-2 font-semibold"
                onClick={() => setAppliedFilters(inputFilters)}
              >
                Pesquisar
              </button>
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
                {filteredShifts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-gray-400">
                      {shifts.length === 0 ? 'Nenhum turno cadastrado.' : 'Nenhum turno encontrado para os filtros selecionados.'}
                    </td>
                  </tr>
                ) : (
                  filteredShifts.map((shift: any, idx) => {
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
                      <tr key={`${shift.codigo}-${idx}`} className="border-b hover:bg-gray-50">
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
                            <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FEE2E2"/><path d="M8.5 8.5l7 7m0-7l-7 7" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
                              Não seguir
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <MenuTurnoActions
                            shift={shift}
                            shifts={shifts}
                            setShifts={setShifts}
                            onNavigate={onNavigate}
                            onBlockedDelete={(turnoNome, linkedEmployees) => {
                              setBlockedShiftDelete({ turnoNome, employees: linkedEmployees })
                            }}
                            onRequestDelete={(shiftCode, shiftName) => {
                              setPendingShiftDelete({ shiftCode, shiftName })
                            }}
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
                {filteredShifts.length === 0
                  ? 'Nenhum turno cadastrado.'
                  : `Página 1/1 - Exibindo ${filteredShifts.length} de ${shifts.length} registros.`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shifts;
