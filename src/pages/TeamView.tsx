
import React from 'react';
import { UserGroupIcon, UserCircleIcon, UsersIcon } from '@heroicons/react/24/outline';

import { Department, BusinessUnit } from '../App';

interface TeamViewProps {
  team: any;
  employees: any[];
  departments?: Department[];
  businessUnits?: BusinessUnit[];
}

const TeamView: React.FC<TeamViewProps> = ({ team, employees, departments = [], businessUnits = [] }) => {
  if (!team) return <div className="p-8 text-center text-gray-500">Equipe não encontrada.</div>;
  const teamEmployees = employees.filter(emp => emp.equipe === team.nome);
  // Gestores: buscar pelos IDs salvos no time
  const managers = team.gestorIds && Array.isArray(team.gestorIds)
    ? employees.filter(emp => team.gestorIds.includes(emp.id))
    : [];

  function getInitials(name: string) {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Buscar departamento da equipe
  const departamento = departments.find(dep => dep.id === team.departamentoId);
  // Buscar unidade de negócio do departamento
  const unidadeId = departamento?.unidadeNegocio;
  let unidadeNome = '-';
  if (unidadeId) {
    if (unidadeId === 'company-main') {
      // Buscar nome da empresa principal
      const companyDataStr = localStorage.getItem('companyData');
      if (companyDataStr) {
        try {
          const companyData = JSON.parse(companyDataStr);
          unidadeNome = companyData.nomeEmpresa || companyData.razaoSocial || 'Empresa Principal';
        } catch {}
      } else {
        unidadeNome = 'Empresa Principal';
      }
    } else {
      const unidade = businessUnits.find(u => u.id === unidadeId);
      if (unidade) unidadeNome = unidade.nomeUnidade;
      else unidadeNome = 'Unidade não encontrada';
    }
  } else if (departamento) {
    unidadeNome = 'Departamento sem unidade vinculada';
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Detalhes da equipe */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6 text-indigo-700" /> Detalhes da equipe
          </h2>
          <div className="mb-2"><span className="font-medium">Nome da Equipe:</span> <span className="font-bold">{team.nome}</span></div>
          <div className="mb-2"><span className="font-medium">Código:</span> <span className="font-bold">{team.codigo}</span></div>
          <div className="mb-2"><span className="font-medium">Departamento:</span> <span className="text-indigo-700 cursor-pointer hover:underline">{team.departamentoNome}</span></div>
          <div className="mb-2"><span className="font-medium">Unidade de Negócio:</span> <span className="text-indigo-700 cursor-pointer hover:underline">{unidadeNome}</span></div>
        </div>
        {/* Gestores */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserCircleIcon className="w-6 h-6 text-indigo-700" /> Gestores
          </h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Funcionário</th>
                <th className="py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {managers.length === 0 ? (
                <tr><td colSpan={2} className="py-4 text-center text-gray-400">Nenhum gestor</td></tr>
              ) : (
                managers.map((emp, idx) => (
                  <tr key={idx}>
                    <td className="py-2 flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 mr-2 text-base">{getInitials(emp.nomeCompleto)}</span>
                      <div>
                        <a className="text-indigo-700 font-medium hover:underline cursor-pointer">#{emp.matricula} {emp.nomeCompleto}</a>
                        <div className="text-xs text-gray-500">{emp.cargo}</div>
                        <div className="text-xs text-gray-400">{emp.email}</div>
                      </div>
                    </td>
                    <td className="py-2">...</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Funcionários */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-indigo-700" /> Funcionários
          </h2>
        </div>
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
                  <td className="py-2 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 mr-2 text-base">{getInitials(emp.nomeCompleto)}</span>
                    <div>
                      <a className="text-indigo-700 font-medium hover:underline cursor-pointer">#{emp.matricula} {emp.nomeCompleto}</a>
                      <div className="text-xs text-gray-500">Cargo {emp.cargo}</div>
                    </div>
                  </td>
                  <td className="py-2">{emp.email}</td>
                  <td className="py-2">{emp.ultimoRegistro || 'Sem registro'}</td>
                  <td className="py-2">...</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Paginação visual fake */}
        <div className="flex justify-end items-center text-xs text-gray-500 mt-2">
          Página 1/1 - Exibindo {teamEmployees.length} de {teamEmployees.length} registros.
        </div>
      </div>
    </div>
  );
};

export default TeamView;
