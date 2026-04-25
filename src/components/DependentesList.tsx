import React from 'react';

interface Dependente {
  nome: string;
  relacao: string;
  dataNascimento: string;
  nomeMae: string;
  cpf: string;
  telefone: string;
  email: string;
  observacoes: string;
}

interface DependentesListProps {
  dependentes: Dependente[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

const DependentesList: React.FC<DependentesListProps> = ({ dependentes, onEdit, onRemove }) => {
  if (dependentes.length === 0) {
    return <div className="text-xs text-gray-500 mb-4">Nenhum dependente cadastrado</div>;
  }
  return (
    <div className="mb-4 space-y-3">
      {dependentes.map((dep, idx) => (
        <div key={idx} className="border-b pb-2">
          <div className="mb-1">
            <div className="font-bold text-gray-700">Dependente {idx + 1}</div>
          </div>
          <div className="text-xs text-gray-700">
            <div className="mb-2"><span className="font-medium text-gray-600">Nome:</span> <span className="font-semibold text-gray-900">{dep.nome || '-'}</span></div>
            <div className="mb-2"><span className="font-medium text-gray-600">Relação:</span> <span className="font-semibold text-gray-900">{dep.relacao || '-'}</span></div>
            <div className="mb-2"><span className="font-medium text-gray-600">Data de nascimento:</span> <span className="font-semibold text-gray-900">{dep.dataNascimento || '-'}</span></div>
            <div className="mb-2"><span className="font-medium text-gray-600">Nome da mãe:</span> <span className="font-semibold text-gray-900">{dep.nomeMae || '-'}</span></div>
            <div className="mb-2"><span className="font-medium text-gray-600">CPF:</span> <span className="font-semibold text-gray-900">{dep.cpf || '-'}</span></div>
            <div className="mb-2"><span className="font-medium text-gray-600">Telefone:</span> <span className="font-semibold text-gray-900">{dep.telefone || '-'}</span></div>
            <div className="mb-2"><span className="font-medium text-gray-600">E-mail:</span> <span className="font-semibold text-gray-900">{dep.email || '-'}</span></div>
            <div className="mb-2"><span className="font-medium text-gray-600">Observações:</span> <span className="font-semibold text-gray-900">{dep.observacoes || '-'}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DependentesList;
