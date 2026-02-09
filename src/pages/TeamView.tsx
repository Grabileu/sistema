import React from 'react';

interface TeamViewProps {
  team: any;
  employees: any[];
}

const TeamView: React.FC<TeamViewProps> = ({ team, employees }) => {
  if (!team) return <div className="p-8 text-center text-gray-500">Equipe não encontrada.</div>;
  const teamEmployees = employees.filter(emp => emp.equipe === team.nome);
  // Gestores: exemplo, cargo contém 'administrativo' (ajuste conforme sua regra)
  const managers = teamEmployees.filter(emp => emp.cargo && emp.cargo.toLowerCase().includes('administrativo'));

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Detalhes da equipe</h2>
          <div className="mb-2"><strong>Nome da Equipe:</strong> {team.nome}</div>
          <div className="mb-2"><strong>Código:</strong> {team.codigo}</div>
          <div className="mb-2"><strong>Departamento:</strong> {team.departamentoNome}</div>
          <div className="mb-2"><strong>Unidade de Negócio:</strong> {team.unidadeNegocio || '-'}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Gestores</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3">Funcionário</th>
                <th className="py-3">E-mail</th>
                <th className="py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {managers.length === 0 ? (
                <tr><td colSpan={3} className="py-4 text-center text-gray-400">Nenhum gestor</td></tr>
              ) : (
                managers.map((emp, idx) => (
                  <tr key={idx}>
                    <td className="py-2">{emp.nomeCompleto}</td>
                    <td className="py-2">{emp.email}</td>
                    <td className="py-2">...</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Funcionários</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-3">Funcionário</th>
              <th className="py-3">E-mail</th>
              <th className="py-3">Último registro</th>
              <th className="py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {teamEmployees.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-gray-400">Nenhum funcionário</td></tr>
            ) : (
              teamEmployees.map((emp, idx) => (
                <tr key={idx}>
                  <td className="py-2">{emp.nomeCompleto}</td>
                  <td className="py-2">{emp.email}</td>
                  <td className="py-2">{emp.ultimoRegistro || 'Sem registro'}</td>
                  <td className="py-2">...</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamView;
