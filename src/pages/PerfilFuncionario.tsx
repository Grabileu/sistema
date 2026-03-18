import React, { useState } from 'react';
import DatePicker from '../components/DatePicker';
import Select from '../components/Select';
import { Employee } from '../App';

interface PerfilFuncionarioProps {
  funcionario?: Employee | null;
}


export default function PerfilFuncionario({ funcionario }: PerfilFuncionarioProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditProfissional, setShowEditProfissional] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'principal' | 'profissional' | 'endereco' | 'dependentes'>('principal');
  // Estado local para refletir alterações na tela
  const [funcionarioView, setFuncionarioView] = useState<Employee | null>(funcionario ? { ...funcionario } : null);
    // Estados para modal de formação (após funcionarioView)
    const [showEditFormacao, setShowEditFormacao] = useState(false);
    const [editEscolaridade, setEditEscolaridade] = useState<string>(funcionarioView?.escolaridade || '');
    const [editConclusao, setEditConclusao] = useState<string>(funcionarioView?.conclusao || '');
    const [editAreasFormacao, setEditAreasFormacao] = useState<string>(funcionarioView?.areasFormacao || '');
  const [showEditNecessidade, setShowEditNecessidade] = useState(false);
  const [editNecessidadeEspecial, setEditNecessidadeEspecial] = useState<string>('não');
  const [editTipoNecessidade, setEditTipoNecessidade] = useState<string>('');
  const [editObsNecessidade, setEditObsNecessidade] = useState<string>('');

  // Estados para modal de edição profissional
  const [editVinculo, setEditVinculo] = useState<string>(funcionarioView?.vinculo || '');
  const [editCargo, setEditCargo] = useState<string>(funcionarioView?.cargo || '');
  const [editEquipe, setEditEquipe] = useState<string>(funcionarioView?.equipe || '');
  const [editTurno, setEditTurno] = useState<string>(funcionarioView?.turno || '');
  const [editDepartamento, setEditDepartamento] = useState<string>(funcionarioView?.departamento || '');
  const [editUnidadeNegocio, setEditUnidadeNegocio] = useState<string>(funcionarioView?.loja || '');
  const [editPrimeiroEmprego, setEditPrimeiroEmprego] = useState<string>(funcionarioView?.primeiroEmprego || 'não');
  const [editCargoConfianca, setEditCargoConfianca] = useState<string>(funcionarioView?.cargoConfianca || 'não');
  const [editRemuneracao, setEditRemuneracao] = useState<string>(funcionarioView?.remuneracao || '');
  const [editFrequenciaPagamento, setEditFrequenciaPagamento] = useState<string>(funcionarioView?.frequenciaPagamento || '');
  const [editMesmoSalarioDesde, setEditMesmoSalarioDesde] = useState<string>(funcionarioView?.mesmoSalarioDesde || '');
  const [editEstabilidade, setEditEstabilidade] = useState<string>(funcionarioView?.estabilidade || '');
  const [editSeguroDesemprego, setEditSeguroDesemprego] = useState<string>(funcionarioView?.seguroDesemprego || 'não');
  const [editAposentado, setEditAposentado] = useState<string>(funcionarioView?.aposentado || 'não');

  const [editDataAdmissao, setEditDataAdmissao] = useState<string>(funcionarioView?.dataAdmissao || '');

  const [editPISPasep, setEditPISPasep] = useState<string>(funcionarioView?.pisPasep || '');
  const [editCarteiraTrabalho, setEditCarteiraTrabalho] = useState<string>(funcionarioView?.carteiraTrabalho || '');
  const [editRegistroProfissional, setEditRegistroProfissional] = useState<string>(funcionarioView?.registroProfissional || '');

  const [editLoja, setEditLoja] = useState<string>(funcionarioView?.loja || '');

  if (!funcionarioView) {
    return <div className="p-8 text-center text-gray-500">Funcionário não encontrado.</div>;
  }

  // Simulação de dados extras para visual
  const departamento = funcionarioView.equipe ? 'Departamento Administrativo' : '-';
  const unidade = funcionarioView.loja || 'Unidade de Negócio 01';
  const perfilCriado = funcionarioView.dataAdmissao || '06/02/2026';
  const ultimoAcesso = funcionarioView.ultimoAcesso || '-';
  const idInterno = funcionarioView.id || '1493045D829A4E93C6348CD39BC4548';
  const genero = funcionarioView.genero || 'Masculino';
  const dataNascimento = funcionarioView.dataNascimento || '16/04/2005';

  // Estados locais para selects do modal
  const [editNome, setEditNome] = useState<string>(funcionarioView?.nomeCompleto || '');
  const [editCorRaca, setEditCorRaca] = useState<string>(funcionarioView?.corRaca ? String(funcionarioView.corRaca) : '');
  const [editGenero, setEditGenero] = useState<string>(funcionarioView?.genero ? String(funcionarioView.genero) : '');
  const [editEstadoCivil, setEditEstadoCivil] = useState<string>(funcionarioView?.estadoCivil ? String(funcionarioView.estadoCivil) : '');
  const [editCategoria, setEditCategoria] = useState<string>(funcionarioView?.categoria ? String(funcionarioView.categoria) : '');
  const [editMae, setEditMae] = useState<string>(funcionarioView?.mae || '');
  const [editPai, setEditPai] = useState<string>(funcionarioView?.pai || '');
  const [editNacionalidade, setEditNacionalidade] = useState<string>(funcionarioView?.nacionalidade || 'Brasileiro');
  const [editPaisNascimento, setEditPaisNascimento] = useState<string>(funcionarioView?.paisNascimento || '');
  const [editEstadoNascimento, setEditEstadoNascimento] = useState<string>(funcionarioView?.estadoNascimento || '');
  const [editCidadeNascimento, setEditCidadeNascimento] = useState<string>(funcionarioView?.cidadeNascimento || '');
  const [editRG, setEditRG] = useState<string>(funcionarioView?.rg || '');
  const [editCNH, setEditCNH] = useState<string>(funcionarioView?.cnh || '');
  const [editObsGerais, setEditObsGerais] = useState<string>(funcionarioView?.obsGerais || '');

  const [editDataExameAdmissional, setEditDataExameAdmissional] = useState<string>(funcionarioView?.dataExameAdmissional || '');

  // Função para aplicar máscara no PIS/PASEP
  function maskPISPasep(value: string) {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{5})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{5})\.(\d{2})(\d)/, "$1.$2.$3-$4")
      .slice(0, 14);
  }
  // Função para aplicar máscara na Carteira de Trabalho (opcional: 99.99999 ou 9999999)
  function maskCarteiraTrabalho(value: string) {
    const onlyNums = value.replace(/\D/g, "");
    if (onlyNums.length <= 2) return onlyNums;
    if (onlyNums.length <= 7) return onlyNums.replace(/(\d{2})(\d{0,5})/, "$1.$2");
    return onlyNums.slice(0, 7).replace(/(\d{2})(\d{0,5})/, "$1.$2");
  }

  return (
    <>
      {/* Modal de edição de informações pessoais */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-4 md:p-8 relative max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Editar dados do funcionário</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <div className="mb-6">
              <span className="text-indigo-700 font-bold text-lg">Informações pessoais</span>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              setFuncionarioView((prev) => prev ? {
                ...prev,
                nomeCompleto: editNome,
                corRaca: editCorRaca,
                genero: editGenero,
                estadoCivil: editEstadoCivil,
                categoria: editCategoria,
                mae: editMae,
                pai: editPai,
                nacionalidade: editNacionalidade,
                paisNascimento: editPaisNascimento,
                estadoNascimento: editEstadoNascimento,
                cidadeNascimento: editCidadeNascimento,
                rg: editRG,
                cnh: editCNH,
                obsGerais: editObsGerais,
              } : prev);
              setShowEditModal(false);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Nome completo <span className="text-red-500">*</span></label>
                  <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">CPF <span className="text-red-500">*</span></label>
                  <input type="text" defaultValue={funcionario?.cpf} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">RG</label>
                  <input type="text" value={editRG} onChange={e => setEditRG(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                {/* Campo Nome social removido conforme solicitado */}
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Cor/Raça</label>
                  <Select
                    value={editCorRaca}
                    onChange={v => setEditCorRaca(String(v))}
                    options={[
                      { label: 'Nenhum', value: '' },
                      { label: 'Indígena', value: 'indigena' },
                      { label: 'Branca', value: 'branca' },
                      { label: 'Preta', value: 'preta' },
                      { label: 'Amarela', value: 'amarela' },
                      { label: 'Parda', value: 'parda' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Gênero <span className="text-red-500">*</span></label>
                  <Select
                    value={editGenero}
                    onChange={v => setEditGenero(String(v))}
                    options={[
                      { label: 'Masculino', value: 'masculino' },
                      { label: 'Feminino', value: 'feminino' },
                      { label: 'Outros', value: 'outros' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Data de nascimento <span className="text-red-500">*</span></label>
                  <DatePicker
                    value={funcionario?.dataNascimento || ''}
                    onChange={() => {}}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Estado civil</label>
                  <Select
                    value={editEstadoCivil}
                    onChange={v => setEditEstadoCivil(String(v))}
                    options={[
                      { label: 'Nenhum', value: '' },
                      { label: 'Solteiro(a)', value: 'solteiro' },
                      { label: 'Casado(a)', value: 'casado' },
                      { label: 'Viuvo(a)', value: 'viuvo' },
                      { label: 'Divorciado(a)', value: 'divorciado' },
                      { label: 'União Estável', value: 'uniaoestavel' },
                      { label: 'Separado(a)', value: 'separado' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">CNH</label>
                  <input type="text" value={editCNH} onChange={e => setEditCNH(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Categoria</label>
                  <Select
                    value={editCategoria}
                    onChange={v => setEditCategoria(String(v))}
                    options={[
                      { label: 'Nenhum', value: '' },
                      { label: 'ACC', value: 'acc' },
                      { label: 'A', value: 'a' },
                      { label: 'B', value: 'b' },
                      { label: 'C', value: 'c' },
                      { label: 'D', value: 'd' },
                      { label: 'E', value: 'e' },
                    ]}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Nacionalidade</label>
                  <input type="text" value={editNacionalidade} onChange={e => setEditNacionalidade(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Nome da mãe</label>
                  <input type="text" value={editMae} onChange={e => setEditMae(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Nome do pai</label>
                  <input type="text" value={editPai} onChange={e => setEditPai(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-1 font-medium">País que nasceu</label>
                    <input type="text" value={editPaisNascimento} onChange={e => setEditPaisNascimento(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1 font-medium">Estado que nasceu</label>
                    <input type="text" value={editEstadoNascimento} onChange={e => setEditEstadoNascimento(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1 font-medium">Cidade que nasceu</label>
                    <input type="text" value={editCidadeNascimento} onChange={e => setEditCidadeNascimento(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Observações gerais</label>
                  <textarea value={editObsGerais} onChange={e => setEditObsGerais(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm min-h-[60px]" />
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded transition">Salvar alterações</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded transition">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de edição de formação */}
      {showEditFormacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-4 md:p-8 relative max-h-[90vh] overflow-visible">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Editar formação</h2>
              <button onClick={() => setShowEditFormacao(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              setFuncionarioView((prev) => prev ? {
                ...prev,
                escolaridade: editEscolaridade,
                conclusao: editConclusao,
                areasFormacao: editAreasFormacao,
              } : prev);
              setShowEditFormacao(false);
            }}>
              <div className="mb-6">
                <span className="text-indigo-700 font-bold text-lg">Formação</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Escolaridade</label>
                  <Select
                    value={editEscolaridade}
                    onChange={v => setEditEscolaridade(String(v))}
                    options={[
                      { label: 'Não informado', value: '' },
                      { label: 'Fundamental incompleto', value: 'fundamental incompleto' },
                      { label: 'Fundamental completo', value: 'fundamental completo' },
                      { label: 'Médio incompleto', value: 'medio incompleto' },
                      { label: 'Médio completo', value: 'medio completo' },
                      { label: 'Superior incompleto', value: 'superior incompleto' },
                      { label: 'Superior completo', value: 'superior completo' },
                      { label: 'Pós-graduação', value: 'pos graduacao' },
                      { label: 'Mestrado', value: 'mestrado' },
                      { label: 'Doutorado', value: 'doutorado' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Data de conclusão</label>
                  <DatePicker
                    value={editConclusao}
                    onChange={v => setEditConclusao(v)}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Área(s) de formação</label>
                  <input
                    type="text"
                    value={editAreasFormacao}
                    onChange={e => setEditAreasFormacao(e.target.value)}
                    placeholder="Separe por vírgulas"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                  />
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded transition">Salvar alterações</button>
                <button type="button" onClick={() => setShowEditFormacao(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded transition">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de edição de necessidades especiais */}
      {showEditNecessidade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-4 md:p-8 relative max-h-[90vh] overflow-visible">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Editar necessidades especiais</h2>
              <button onClick={() => setShowEditNecessidade(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              setFuncionarioView((prev) => prev ? {
                ...prev,
                necessidadeEspecial: editNecessidadeEspecial,
                tipoNecessidade: editTipoNecessidade,
                obsNecessidade: editObsNecessidade,
              } : prev);
              setShowEditNecessidade(false);
            }}>
              <div className="mb-6">
                <span className="text-indigo-700 font-bold text-lg">Necessidades especiais</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Portador de necessidades especiais?</label>
                  <Select
                    value={editNecessidadeEspecial || 'não'}
                    onChange={v => setEditNecessidadeEspecial(String(v))}
                    options={[
                      { label: 'Não', value: 'não' },
                      { label: 'Sim', value: 'sim' },
                    ]}
                  />
                </div>
                {editNecessidadeEspecial === 'sim' && (
                  <>
                    <div>
                      <label className="block text-gray-700 text-sm mb-1 font-medium">Tipo</label>
                      <Select
                        value={editTipoNecessidade || ''}
                        onChange={v => setEditTipoNecessidade(String(v))}
                        options={[
                          { label: 'Físico', value: 'fisico' },
                          { label: 'Visual', value: 'visual' },
                          { label: 'Auditiva', value: 'auditiva' },
                          { label: 'Mental', value: 'mental' },
                          { label: 'Intelectual', value: 'intelectual' },
                        ]}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm mb-1 font-medium">Observações sobre necessidades especiais</label>
                      <textarea
                        value={editObsNecessidade || ''}
                        onChange={e => setEditObsNecessidade(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm min-h-[60px]"
                        placeholder="Digite"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded transition">Salvar alterações</button>
                <button type="button" onClick={() => setShowEditNecessidade(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded transition">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de edição de Informações Profissionais */}
      {showEditProfissional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-4 md:p-8 relative max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Editar dados do funcionário</h2>
              <button onClick={() => setShowEditProfissional(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              setFuncionarioView((prev) => prev ? {
                ...prev,
                vinculo: editVinculo,
                cargo: editCargo,
                equipe: editEquipe,
                turno: editTurno,
                departamento: editDepartamento,
                loja: editUnidadeNegocio,
                primeiroEmprego: editPrimeiroEmprego,
                cargoConfianca: editCargoConfianca,
                remuneracao: editRemuneracao,
                frequenciaPagamento: editFrequenciaPagamento,
                mesmoSalarioDesde: editMesmoSalarioDesde,
                estabilidade: editEstabilidade,
                seguroDesemprego: editSeguroDesemprego,
                aposentado: editAposentado,
              } : prev);
              setShowEditProfissional(false);
            }}>
              <div className="mb-6">
                <span className="text-indigo-700 font-bold text-lg">Informações profissionais</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Código/Matrícula *</label>
                  <input type="text" value={funcionarioView?.matricula || ''} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Data de admissão *</label>
                  <DatePicker
                    value={editDataAdmissao}
                    onChange={v => setEditDataAdmissao(v)}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Data de início</label>
                  <DatePicker
                    value={funcionarioView?.dataInicio || funcionarioView?.dataAdmissao || ''}
                    onChange={() => {}}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed opacity-70"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Data do exame admissional</label>
                  <DatePicker
                    value={editDataExameAdmissional || funcionarioView?.dataExameAdmissional || ''}
                    onChange={v => setEditDataExameAdmissional(v)}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">PIS/PASEP</label>
                  <input type="text" value={editPISPasep} onChange={e => setEditPISPasep(maskPISPasep(e.target.value))} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Nº Carteira de Trabalho</label>
                  <input type="text" value={editCarteiraTrabalho} onChange={e => setEditCarteiraTrabalho(maskCarteiraTrabalho(e.target.value))} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Registro profissional</label>
                  <input type="text" value={editRegistroProfissional} onChange={e => setEditRegistroProfissional(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
              </div>
              <div className="mb-6">
                <span className="text-indigo-700 font-bold text-lg">Dados da ocupação</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Vínculo</label>
                  <Select value={editVinculo} onChange={v => setEditVinculo(String(v))} options={[{label:'Selecione',value:''}]} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Cargo *</label>
                  <input type="text" value={editCargo} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Equipe *</label>
                  <input type="text" value={editEquipe} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Turno *</label>
                  <input type="text" value={editTurno} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Departamento *</label>
                  <input type="text" value={editDepartamento} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Loja</label>
                  <input type="text" value={editLoja} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm cursor-not-allowed" />
                </div>
                <div className="col-span-full">
                  <span className="text-xs text-gray-500 italic">Esses campos só podem ser editados na tela de cadastro do funcionário.</span>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Primeiro emprego</label>
                  <Select value={editPrimeiroEmprego} onChange={v => setEditPrimeiroEmprego(String(v))} options={[{label:'Não',value:'não'},{label:'Sim',value:'sim'}]} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Cargo de confiança</label>
                  <Select value={editCargoConfianca} onChange={v => setEditCargoConfianca(String(v))} options={[{label:'Não',value:'não'},{label:'Sim',value:'sim'}]} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Remuneração</label>
                  <input type="text" value={editRemuneracao} onChange={e => setEditRemuneracao(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Frequência de pagamento</label>
                  <Select value={editFrequenciaPagamento} onChange={v => setEditFrequenciaPagamento(String(v))} options={[{label:'Nenhum',value:''}]} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Mesmo salário desde</label>
                  <input type="date" value={editMesmoSalarioDesde} onChange={e => setEditMesmoSalarioDesde(e.target.value)} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Estabilidade</label>
                  <Select value={editEstabilidade} onChange={v => setEditEstabilidade(String(v))} options={[{label:'Nenhum',value:''}]} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Tem seguro desemprego?</label>
                  <Select value={editSeguroDesemprego} onChange={v => setEditSeguroDesemprego(String(v))} options={[{label:'Não',value:'não'},{label:'Sim',value:'sim'}]} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm mb-1 font-medium">Aposentado?</label>
                  <Select value={editAposentado} onChange={v => setEditAposentado(String(v))} options={[{label:'Não',value:'não'},{label:'Sim',value:'sim'}]} />
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded transition">Salvar alterações</button>
                <button type="button" onClick={() => setShowEditProfissional(false)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded transition">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="bg-gray-50 min-h-screen py-6 px-1 md:px-0">
        {/* Abas superiores refinadas */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg px-0 pt-0 pb-0 mb-4">
            <div className="flex flex-row justify-between border-b border-gray-200">
              <button className="flex-1 px-0 py-3 text-base font-bold text-indigo-700 border-b-2 border-indigo-700 bg-white transition-all text-center" style={{marginBottom: -1}}>Principal</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Benefícios</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Permissões de ponto</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Histórico de ponto</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Espelho de ponto</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Férias/Afastamentos</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Documentos</button>
            </div>
          </div>
        </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Coluna esquerda: Dados detalhados */}
        <div className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-center border border-gray-100 min-w-[320px] max-w-[400px] w-full mx-auto md:mx-0">
          <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500 mb-2 bg-gray-50">
            {funcionarioView.nomeCompleto.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div className="text-lg font-semibold text-gray-800 text-center mt-1">{funcionarioView.nomeCompleto}</div>
          <div className="text-gray-500 mb-3 text-center text-xs">{funcionarioView.cargo}</div>
          <hr className="w-full my-2 border-gray-200" />
          <div className="w-full text-xs text-gray-700">
            <div className="mb-2">Código de matrícula: <span className="text-gray-900 font-medium">{funcionarioView.matricula}</span></div>
            <div className="mb-2">CPF: <span className="text-gray-900 font-medium">{funcionarioView.cpf}</span></div>
            <div className="mb-2">E-mail: <span className="text-gray-900 font-medium">{funcionarioView.email}</span></div>
            <div className="mb-2">Admissão: <span className="text-gray-900 font-medium">{funcionarioView.dataAdmissao}</span></div>
            <div className="mb-2">Turno: <span className="text-indigo-700 font-medium cursor-pointer hover:underline">{funcionarioView.turno}</span></div>
            <div className="pl-4 text-xs text-indigo-700 cursor-pointer hover:underline mb-2">Histórico de alteração</div>
            <div className="mb-2">Cargo: <span className="text-indigo-700 font-medium cursor-pointer hover:underline">{funcionarioView.cargo}</span></div>
            <div className="pl-4 text-xs text-indigo-700 cursor-pointer hover:underline mb-2">Histórico de alteração</div>
            <div className="mb-2">Equipe: <span className="text-indigo-700 font-medium cursor-pointer hover:underline">{funcionarioView.equipe}</span></div>
            <div className="pl-4 text-xs text-indigo-700 cursor-pointer hover:underline mb-2">Histórico de alteração</div>
            <div className="mb-2">Departamento: <span className="text-indigo-700 font-medium cursor-pointer hover:underline">{departamento}</span></div>
            <div className="mb-2">Unidade de negócio: <span className="text-indigo-700 font-medium cursor-pointer hover:underline">{unidade}</span></div>
            <div className="mb-2">Perfil criado em: <span className="text-gray-900 font-medium">{perfilCriado}</span></div>
            <div className="mb-2">Último acesso: <span className="text-gray-900 font-medium">{ultimoAcesso}</span> <span className="text-xs text-gray-400 ml-1">ⓘ</span></div>
            <div className="mb-2">ID interno: <span className="text-gray-400 text-xs">{idInterno}</span></div>
          </div>
        </div>

        {/* Coluna direita: Ações rápidas e status do dia */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 flex flex-col md:flex-row gap-6 items-start w-full">
            <div className="flex-1">
              <div className="font-bold text-base text-gray-900 mb-3">Ações rápidas</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button className="border border-indigo-600 text-indigo-700 font-medium rounded px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 transition-all text-xs">
                  {/* Lápis (Heroicons outline) */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L6.75 19.963l-4 1 1-4L16.862 3.487z" />
                  </svg>
                  Editar cadastro
                </button>
                <button className="border border-indigo-600 text-indigo-700 font-medium rounded px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 transition-all text-xs">
                  {/* Relógio (Heroicons outline) */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                  </svg>
                  Alterar turno/equipe
                </button>
                <button className="border border-indigo-600 text-indigo-700 font-medium rounded px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 transition-all text-xs">
                  {/* Impressora (Heroicons outline) */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17v4H7v-4m10 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10m10 0H7m10 0a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2h10z" />
                  </svg>
                  Baixar ficha do funcionário
                </button>
                <button className="border border-red-500 text-red-600 font-medium rounded px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 transition-all text-xs">
                  {/* Boneco (User - Heroicons outline) */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                  </svg>
                  Demitir
                </button>
              </div>
            </div>
            {/* Status do dia removido */}
          </div>

          {/* Abas detalhadas */}
          <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 mt-2 w-full">
            <div className="flex justify-between gap-2 border-b border-gray-200 mb-4">
              <button
                className={`text-sm ${abaAtiva === 'principal' ? 'font-bold text-indigo-700 border-b-2 border-indigo-700 px-2 pb-1' : 'text-gray-600'}`}
                onClick={() => setAbaAtiva('principal')}
              >
                Principal
              </button>
              <button
                className={`text-sm ${abaAtiva === 'profissional' ? 'font-bold text-indigo-700 border-b-2 border-indigo-700 px-2 pb-1' : 'text-gray-600'}`}
                onClick={() => setAbaAtiva('profissional')}
              >
                Profissional e Financeiro
              </button>
              <button
                className={`text-sm ${abaAtiva === 'endereco' ? 'font-bold text-indigo-700 border-b-2 border-indigo-700 px-2 pb-1' : 'text-gray-600'}`}
                onClick={() => setAbaAtiva('endereco')}
              >
                Endereço e contatos
              </button>
              <button
                className={`text-sm ${abaAtiva === 'dependentes' ? 'font-bold text-indigo-700 border-b-2 border-indigo-700 px-2 pb-1' : 'text-gray-600'}`}
                onClick={() => setAbaAtiva('dependentes')}
              >
                Dependentes
              </button>
            </div>
                        {abaAtiva === 'endereco' && (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h2 className="text-base font-bold text-indigo-700">Endereço</h2>
                              <button className="flex items-center gap-1 text-indigo-700 hover:underline text-xs">Editar</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
                              <div>
                                <div className="mb-2"><span className="font-medium text-gray-600">CEP:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Endereço:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Número:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Complemento:</span> <span className="font-semibold text-gray-900">-</span></div>
                              </div>
                              <div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Bairro:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Cidade:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Estado:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">País:</span> <span className="font-semibold text-gray-900">-</span></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-3 mt-6">
                              <h2 className="text-base font-bold text-indigo-700">Contato</h2>
                              <button className="flex items-center gap-1 text-indigo-700 hover:underline text-xs">Editar</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
                              <div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Celular:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">WhatsApp:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Telefone:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Telefone alternativo:</span> <span className="font-semibold text-gray-900">-</span></div>
                              </div>
                              <div>
                                <div className="mb-2"><span className="font-medium text-gray-600">E-mail:</span> <span className="font-bold text-gray-900">{funcionario.email}</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">E-mail alternativo:</span> <span className="font-semibold text-gray-900">-</span></div>
                                <div className="mb-2"><span className="font-medium text-gray-600">Linkedin:</span> <span className="font-semibold text-gray-900">-</span></div>
                              </div>
                            </div>
                            <div className="mt-8 mb-2 text-base font-bold text-indigo-700">Contatos de emergência</div>
                            <div className="text-xs text-gray-500 mb-4">Nenhum contato de emergência</div>
                            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-indigo-700 font-medium py-2 rounded transition text-xs">
                              <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='16' height='16' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2'/><path stroke='currentColor' strokeWidth='2' strokeLinecap='round' d='M12 8v8m-4-4h8'/></svg>
                              Novo contato de emergência
                            </button>
                          </div>
                        )}
            {abaAtiva === 'profissional' && (
              <div>
                {/* Informações Profissionais */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-indigo-700">Informações profissionais</h2>
                  <button onClick={() => setShowEditProfissional(true)} className="flex items-center gap-1 text-indigo-700 hover:underline text-xs">Editar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Código/Matrícula:</span> <span className="font-bold text-gray-900">#1</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Data de admissão:</span> <span className="font-bold text-gray-900">01/03/2026</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Data de início:</span> <span className="font-bold text-gray-900">16/03/2026</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Data do exame admissional:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Cargo:</span> <span className="font-semibold text-gray-900">Cargo Administrativo</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Turno:</span> <span className="font-semibold text-gray-900">TESTE</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Equipe:</span> <span className="font-semibold text-gray-900">TESTANDO</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Departamento:</span> <span className="font-semibold text-gray-900">REPOSIÇÃO</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Unidade de Negócio:</span> <span className="font-semibold text-gray-900">Unidade de Negócio 01</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">PIS/PASEP:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nº Carteira de Trabalho:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Registro profissional:</span> <span className="font-semibold text-gray-900">-</span></div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Vínculo:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Cargo de confiança?</span> <span className="font-bold text-gray-900">Não</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Primeiro emprego?</span> <span className="font-bold text-gray-900">Não</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Remuneração:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Frequência de pagamento:</span> <span className="font-bold text-gray-900">Não informado</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Mesmo salário desde:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Estabilidade:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Tem seguro desemprego?</span> <span className="font-bold text-gray-900">Não</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Aposentado?</span> <span className="font-bold text-gray-900">Não</span></div>
                  </div>
                </div>

                {/* Dados Bancários */}
                <div className="flex items-center justify-between mt-8 mb-2">
                  <h2 className="text-base font-bold text-indigo-700">Dados bancários</h2>
                  <button className="flex items-center gap-1 text-indigo-700 hover:underline text-xs">Editar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-4">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Forma de pagamento:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Tipo de conta:</span> <span className="font-bold text-gray-900">Não informado</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Banco:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Agência:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Chave PIX:</span> <span className="font-semibold text-gray-900">-</span></div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Modalidade:</span> <span className="font-bold text-gray-900">Não definido</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Conta:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Dígito:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Dígito:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Tipo da chave:</span> <span className="font-semibold text-gray-900">-</span></div>
                  </div>
                </div>

                {/* Período de experiência */}
                <div className="flex items-center justify-between mt-8 mb-2">
                  <h2 className="text-base font-bold text-indigo-700">Período de experiência</h2>
                  <button className="flex items-center gap-1 text-indigo-700 hover:underline text-xs">Editar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-4">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Período:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Início:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Término:</span> <span className="font-semibold text-gray-900">-</span></div>
                  </div>
                </div>

                {/* Sindicato */}
                <div className="flex items-center justify-between mt-8 mb-2">
                  <h2 className="text-base font-bold text-indigo-700">Sindicato</h2>
                  <button className="flex items-center gap-1 text-indigo-700 hover:underline text-xs">Editar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-2">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nome sindicato:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Funcionário contribui?</span> <span className="font-bold text-gray-900">Não</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Anexo:</span> <span className="font-semibold text-gray-900">-</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Valor:</span> <span className="font-semibold text-gray-900">-</span></div>
                  </div>
                </div>
              </div>
            )}
            {abaAtiva === 'dependentes' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-indigo-700">Dependentes</h2>
                </div>
                <div className="text-xs text-gray-500 mb-4">Nenhum dependente cadastrado</div>
                <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-indigo-700 font-medium py-2 rounded transition text-xs">
                  <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='16' height='16' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2'/><path stroke='currentColor' strokeWidth='2' strokeLinecap='round' d='M12 8v8m-4-4h8'/></svg>
                  Novo dependente
                </button>
              </div>
            )}
            {abaAtiva === 'principal' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-indigo-700">Informações pessoais</h2>
                  <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1 text-indigo-700 hover:underline text-xs">
                    <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='14' height='14' fill='none' viewBox='0 0 24 24'><path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m2-2v8m0 0 2-2m-2 2-2-2'/></svg>
                    Editar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nome completo:</span> <span className="font-semibold text-gray-900">{funcionarioView.nomeCompleto}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">CPF:</span> <span className="font-bold text-gray-900">{funcionario.cpf}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">RG:</span> <span className="font-semibold text-gray-900">{funcionarioView.rg || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Gênero:</span> <span className="font-semibold text-gray-900">{funcionarioView.genero ? funcionarioView.genero.charAt(0).toUpperCase() + funcionarioView.genero.slice(1) : '-'}</span></div>

                    <div className="mb-2"><span className="font-medium text-gray-600">Estado civil:</span> <span className="font-semibold text-gray-900">{funcionarioView.estadoCivil ? funcionarioView.estadoCivil.charAt(0).toUpperCase() + funcionarioView.estadoCivil.slice(1) : '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">CNH:</span> <span className="font-semibold text-gray-900">{funcionarioView.cnh || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Categoria:</span> <span className="font-semibold text-gray-900">{funcionarioView.categoria ? funcionarioView.categoria.charAt(0).toUpperCase() + funcionarioView.categoria.slice(1) : '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Observações gerais:</span> <span className="font-semibold text-gray-900">{funcionarioView.obsGerais || '-'}</span></div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nacionalidade:</span> <span className="font-bold text-gray-900">{funcionarioView.paisNascimento || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Cor/Raça:</span> <span className="font-semibold text-gray-900">{funcionarioView.corRaca ? funcionarioView.corRaca.charAt(0).toUpperCase() + funcionarioView.corRaca.slice(1) : '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Data de nascimento:</span> <span className="font-bold text-gray-900">{dataNascimento}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nome da mãe:</span> <span className="font-semibold text-gray-900">{funcionarioView.mae || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nome do pai:</span> <span className="font-semibold text-gray-900">{funcionarioView.pai || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">País que nasceu:</span> <span className="font-semibold text-gray-900">{funcionarioView.paisNascimento || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Estado que nasceu:</span> <span className="font-semibold text-gray-900">{funcionarioView.estadoNascimento || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Cidade que nasceu:</span> <span className="font-semibold text-gray-900">{funcionarioView.cidadeNascimento || '-'}</span></div>
                  </div>
                </div>

                {/* Formação */}
                <div className="flex items-center justify-between mt-8 mb-2">
                  <h2 className="text-base font-bold text-indigo-700">Formação</h2>
                  <button onClick={() => {
                    setEditEscolaridade(funcionarioView?.escolaridade || '');
                    setEditConclusao(funcionarioView?.conclusao || '');
                    setEditAreasFormacao(funcionarioView?.areasFormacao || '');
                    setShowEditFormacao(true);
                  }} className="flex items-center gap-1 text-indigo-700 hover:underline text-xs">
                    <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='14' height='14' fill='none' viewBox='0 0 24 24'><path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m2-2v8m0 0 2-2m-2 2-2-2'/></svg>Editar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-4">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Escolaridade:</span> <span className="font-semibold text-gray-900">{funcionarioView.escolaridade ? funcionarioView.escolaridade.charAt(0).toUpperCase() + funcionarioView.escolaridade.slice(1) : '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Data de conclusão:</span> <span className="font-semibold text-gray-900">{funcionarioView.conclusao || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Área(s) de formação:</span> <span className="font-semibold text-gray-900">{funcionarioView.areasFormacao || '-'}</span></div>
                  </div>
                </div>

                {/* Necessidades Especiais */}
                <div className="flex items-center justify-between mt-8 mb-2">
                  <h2 className="text-base font-bold text-indigo-700">Necessidades especiais</h2>
                  <button onClick={() => setShowEditNecessidade(true)} className="flex items-center gap-1 text-indigo-700 hover:underline text-xs">
                    <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='14' height='14' fill='none' viewBox='0 0 24 24'><path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m2-2v8m0 0 2-2m-2 2-2-2'/></svg>Editar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-2">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Portador de necessidades especiais?</span> <span className="font-bold text-gray-900">{funcionarioView.necessidadeEspecial === 'sim' ? 'Sim' : 'Não'}</span></div>
                    {funcionarioView.necessidadeEspecial === 'sim' && (
                      <>
                        <div className="mb-2"><span className="font-medium text-gray-600">Tipo:</span> <span className="font-semibold text-gray-900">{funcionarioView.tipoNecessidade ? funcionarioView.tipoNecessidade.charAt(0).toUpperCase() + funcionarioView.tipoNecessidade.slice(1) : '-'}</span></div>
                        <div className="mb-2"><span className="font-medium text-gray-600">Observação:</span> <span className="font-semibold text-gray-900">{funcionarioView.obsNecessidade || '-'}</span></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
