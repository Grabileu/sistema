import React from 'react';

const shifts = [];

interface ShiftsProps {
  onNavigate?: (route: string) => void;
}

const Shifts: React.FC<ShiftsProps> = ({ onNavigate }) => {
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
          <div className="overflow-x-auto">
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
                {shifts.map((shift, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-4">{shift.codigo}</td>
                    <td className="py-4">{shift.nome}</td>
                    <td className="py-4 text-indigo-700 font-semibold cursor-pointer">{shift.funcionarios}</td>
                    <td className="py-4">{shift.totalSemana}</td>
                    <td className="py-4">{shift.criadoEm}</td>
                    <td className="py-4">{shift.atualizadoEm}</td>
                    <td className="py-4">
                      {shift.regrasPonto ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#D1FAE5"/><path d="M8 12.5l2 2 4-4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Segue
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" fill="#6B7280"/><circle cx="12" cy="12" r="1.5" fill="#6B7280"/><circle cx="12" cy="19" r="1.5" fill="#6B7280"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <span>Página 1/1 - Exibindo 1 de 1 registros.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shifts;
