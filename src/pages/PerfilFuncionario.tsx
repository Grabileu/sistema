import EditarDependenteModal from '../components/EditarDependenteModal';
import DependentesList from '../components/DependentesList';
import EditarContatoModal from '../components/EditarContatoModal';
import EditarContatoEmergenciaModal from '../components/EditarContatoEmergenciaModal';

import React, { useEffect, useState } from 'react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useEditModal } from '../hooks/useEditModal';
import EditarPeriodoExperienciaModal from '../components/EditarPeriodoExperienciaModal';
import EditarSindicatoModal from '../components/EditarSindicatoModal';
import EditarEnderecoModal from '../components/EditarEnderecoModal';
import { PERIODO_EXPERIENCIA_OPTIONS } from '../constants/periodoExperienciaOptions';
import { getDepartamentoDaEquipe, formatCurrency } from '../utils/formatters';
import EditarFormacaoModal from '../components/EditarFormacaoModal';
import EditarNecessidadeModal from '../components/EditarNecessidadeModal';
import EditarProfissionalModal from '../components/EditarProfissionalModal';
import EditarDadosPessoaisModal from '../components/EditarDadosPessoaisModal';
import EditarDadosBancariosModal from '../components/EditarDadosBancariosModal';
import {
  FORMA_PAGAMENTO_OPTIONS,
  MODALIDADE_OPTIONS,
  TIPO_CONTA_OPTIONS,
  TIPO_CHAVE_OPTIONS,
  VINCULO_OPTIONS
} from '../constants/selectOptions';
import { Employee } from '../App';
import { maskPISPasep, maskCarteiraTrabalho, maskCelular, maskTelefone, maskWhatsapp } from '../utils/masks';

interface PerfilFuncionarioProps {
  funcionario?: Employee | null;
  onUpdateEmployee?: (employee: Employee) => void;
  onDismissEmployee?: (employeeId: string) => void;
}

type PerfilTab = 'principal' | 'profissional' | 'endereco' | 'dependentes' | 'ferias';

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

interface ContatoEmergencia {
  nome: string;
  relacao: string;
  celular: string;
  telefone: string;
  email: string;
}

const createEmptyDependente = (): Dependente => ({
  nome: '',
  relacao: '',
  dataNascimento: '',
  nomeMae: '',
  cpf: '',
  telefone: '',
  email: '',
  observacoes: '',
});

const createEmptyContatoEmergencia = (): ContatoEmergencia => ({
  nome: '',
  relacao: '',
  celular: '',
  telefone: '',
  email: '',
});

function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

export default function PerfilFuncionario({ funcionario, onUpdateEmployee, onDismissEmployee }: PerfilFuncionarioProps) {
    // Estado do modal de confirmação de demissão
    const [showDismissModal, setShowDismissModal] = useState(false);
  // Estado do modal de dependente
  const [showEditDependente, setShowEditDependente] = useState(false);
  const [editDependente, setEditDependente] = useState({
    nome: '',
    relacao: '',
    dataNascimento: '',
    nomeMae: '',
    cpf: '',
    telefone: '',
    email: '',
    observacoes: '',
  });
  // Estado da lista de dependentes
  const [dependentes, setDependentes] = useLocalStorageState<Dependente[]>('dependentes', []);
  const [editIndexDependente, setEditIndexDependente] = useState<number | null>(null);
  const [showListaDependentes, setShowListaDependentes] = useState(false);

  // Editar dependente existente
  const handleEditDependente = (idx: number) => {
    setEditDependente(dependentes[idx]);
    setEditIndexDependente(idx);
    setShowEditDependente(true);
  };
  // Remover dependente
  const handleRemoveDependente = (idx: number) => {
    setDependentes(prev => prev.filter((_, i) => i !== idx));
  };
  // Persistir dependentes no localStorage sempre que mudar
    // Estado local para refletir alterações na tela
    const [funcionarioView, setFuncionarioView] = useState<Employee | null>(funcionario ? { ...funcionario } : null);

    useEffect(() => {
      setFuncionarioView(funcionario ? { ...funcionario } : null);
    }, [funcionario]);

    const updateFuncionarioView = (updates: Partial<Employee>) => {
      if (!funcionarioView) return;
      const updated = { ...funcionarioView, ...updates };
      setFuncionarioView(updated);
      onUpdateEmployee?.(updated);
    };

    // ====== ESTADO E HANDLERS DO MODAL DE CONTATO ======
    const [showEditContato, setShowEditContato] = useState(false);
    const [editContato, setEditContato] = useState({
      email: funcionarioView?.email || '',
      emailAlternativo: funcionarioView?.emailAlternativo || '',
      celular: funcionarioView?.celular || '',
      whatsapp: funcionarioView?.whatsapp || '',
      telefone: funcionarioView?.telefone || '',
      telefoneAlternativo: funcionarioView?.telefoneAlternativo || '',
      linkedin: funcionarioView?.linkedin || '',
    });

    const handleOpenEditContato = () => {
      if (funcionarioView) {
        setEditContato({
          email: funcionarioView.email || '',
          emailAlternativo: funcionarioView.emailAlternativo || '',
          celular: funcionarioView.celular || '',
          whatsapp: funcionarioView.whatsapp || '',
          telefone: funcionarioView.telefone || '',
          telefoneAlternativo: funcionarioView.telefoneAlternativo || '',
          linkedin: funcionarioView.linkedin || '',
        });
        setShowEditContato(true);
      }
    };

    const handleEditContatoChange = (field: string, value: string) => {
      setEditContato(prev => ({ ...prev, [field]: value }));
    };

    const handleEditContatoSubmit = () => {
      updateFuncionarioView(editContato);
      setShowEditContato(false);
    };

    // Estado para modal de endereço
    const editEnderecoModal = useEditModal({
      cep: funcionarioView?.cep || '',
      endereco: funcionarioView?.endereco || '',
      numero: funcionarioView?.numero || '',
      complemento: funcionarioView?.complemento || '',
      bairro: funcionarioView?.bairro || '',
      cidade: funcionarioView?.cidade || '',
      estado: funcionarioView?.estado || '',
      pais: funcionarioView?.pais || '',
    }, (values) => {
      if (!funcionarioView) return;
      updateFuncionarioView(values);
    });
    const handleOpenEditEndereco = () => {
      if (funcionarioView) {
        editEnderecoModal.handleOpen({
          cep: funcionarioView.cep || '',
          endereco: funcionarioView.endereco || '',
          numero: funcionarioView.numero || '',
          complemento: funcionarioView.complemento || '',
          bairro: funcionarioView.bairro || '',
          cidade: funcionarioView.cidade || '',
          estado: funcionarioView.estado || '',
          pais: funcionarioView.pais || '',
        });
      }
    };
  // Estado para modal de sindicato
  const editSindicatoModal = useEditModal({
    contribui: '',
    valor: '',
    nome: '',
    anexo: null as File | null,
  }, (values) => {
    updateFuncionarioView({
      sindicato: {
        nome: values.nome,
        contribui: values.contribui,
        valor: values.valor,
        anexo: values.anexo,
      }
    });
  });
  const handleOpenEditSindicato = () => {
    editSindicatoModal.handleOpen();
  };
  // Estado para modal de período de experiência
  const editExperienciaModal = useEditModal({
    periodo: '',
    dataInicio: '',
    dataTermino: '',
  }, (values) => {
    updateFuncionarioView({
      periodoExperiencia: values.periodo,
      dataInicioExperiencia: values.dataInicio,
      dataTerminoExperiencia: values.dataTermino,
    });
  });
  const handleOpenEditExperiencia = () => {
    if (funcionarioView) {
      editExperienciaModal.handleOpen({
        periodo: funcionarioView.periodoExperiencia || '',
        dataInicio: funcionarioView.dataInicioExperiencia || '',
        dataTermino: funcionarioView.dataTerminoExperiencia || '',
      });
    } else {
      editExperienciaModal.handleOpen();
    }
  };

  const [abaAtiva, setAbaAtiva] = useState<PerfilTab>('principal');
  // ...existing code...

  // Estado centralizado para modal de dados pessoais
  const editDadosPessoaisModal = useEditModal({
    nomeCompleto: funcionarioView?.nomeCompleto || '',
    cpf: funcionarioView?.cpf || '',
    rg: funcionarioView?.rg || '',
    corRaca: funcionarioView?.corRaca ? String(funcionarioView.corRaca) : '',
    genero: funcionarioView?.genero ? String(funcionarioView.genero) : '',
    estadoCivil: funcionarioView?.estadoCivil ? String(funcionarioView.estadoCivil) : '',
    categoria: funcionarioView?.categoria ? String(funcionarioView.categoria) : '',
    mae: funcionarioView?.mae || '',
    pai: funcionarioView?.pai || '',
    nacionalidade: funcionarioView?.nacionalidade || 'Brasileiro',
    paisNascimento: funcionarioView?.paisNascimento || '',
    estadoNascimento: funcionarioView?.estadoNascimento || '',
    cidadeNascimento: funcionarioView?.cidadeNascimento || '',
    cnh: funcionarioView?.cnh || '',
    obsGerais: funcionarioView?.obsGerais || '',
    dataNascimento: funcionarioView?.dataNascimento || '',
  }, (values) => {
    updateFuncionarioView(values);
  });

  // Estado centralizado para modal de formação
  const editFormacaoModal = useEditModal({
    escolaridade: funcionarioView?.escolaridade || '',
    conclusao: funcionarioView?.conclusao || '',
    areasFormacao: funcionarioView?.areasFormacao || '',
  }, (values) => {
    updateFuncionarioView(values);
  });

  // Estado centralizado para modal de necessidade especial
  const editNecessidadeModal = useEditModal({
    necessidadeEspecial: funcionarioView?.necessidadeEspecial || 'não',
    tipoNecessidade: funcionarioView?.tipoNecessidade || '',
    obsNecessidade: funcionarioView?.obsNecessidade || '',
  }, (values) => {
    updateFuncionarioView(values);
  });

  // Estado centralizado para modal profissional
  const editProfissionalModal = useEditModal({
    vinculo: funcionarioView?.vinculo || '',
    cargo: funcionarioView?.cargo || '',
    equipe: funcionarioView?.equipe || '',
    turno: funcionarioView?.turno || '',
    departamento: funcionarioView?.departamento || '',
    unidadeNegocio: funcionarioView?.loja || '',
    primeiroEmprego: funcionarioView?.primeiroEmprego || 'não',
    cargoConfianca: funcionarioView?.cargoConfianca || 'não',
    remuneracao: funcionarioView?.remuneracao || '',
    frequenciaPagamento: funcionarioView?.frequenciaPagamento || '',
    mesmoSalarioDesde: funcionarioView?.mesmoSalarioDesde || '',
    estabilidade: funcionarioView?.estabilidade || '',
    seguroDesemprego: funcionarioView?.seguroDesemprego || 'não',
    aposentado: funcionarioView?.aposentado || 'não',
    dataAdmissao: funcionarioView?.dataAdmissao || '',
    pisPasep: funcionarioView?.pisPasep || '',
    carteiraTrabalho: funcionarioView?.carteiraTrabalho || '',
    registroProfissional: funcionarioView?.registroProfissional || '',
    loja: funcionarioView?.loja || '',
    dataExameAdmissional: funcionarioView?.dataExameAdmissional || '',
  }, (values) => {
    updateFuncionarioView(values);
  });

  // Estado centralizado para modal de dados bancários
  const editBancariosModal = useEditModal({
    formaPagamento: '',
    modalidade: '',
    tipoConta: '',
    banco: '',
    agencia: '',
    agenciaDigito: '',
    conta: '',
    contaDigito: '',
    chavePix: '',
    tipoChave: '',
  }, (values) => {
    updateFuncionarioView(values);
  });
  const handleOpenEditBancarios = () => {
    if (funcionarioView) {
      editBancariosModal.handleOpen({
        formaPagamento: funcionarioView.formaPagamento || '',
        modalidade: funcionarioView.modalidade || '',
        tipoConta: funcionarioView.tipoConta || '',
        banco: funcionarioView.banco || '',
        agencia: funcionarioView.agencia || '',
        agenciaDigito: funcionarioView.agenciaDigito || '',
        conta: funcionarioView.conta || '',
        contaDigito: funcionarioView.contaDigito || '',
        chavePix: funcionarioView.chavePix || '',
        tipoChave: funcionarioView.tipoChave || '',
      });
    }
  };

  // Remover todos os antigos estados/setters individuais dos campos profissionais e de formação
  // Todas as referências devem ser feitas via editProfissional, setEditProfissional, editFormacao, setEditFormacao

  if (!funcionarioView) {
    return <div className="p-8 text-center text-gray-500">Funcionário não encontrado.</div>;
  }

  // Busca o departamento correto da equipe do funcionário (dados reais)
  const departamento = funcionarioView.equipe ? getDepartamentoDaEquipe(funcionarioView.equipe) : '-';
  const unidade = funcionarioView.loja || 'Unidade de Negócio 01';
  const perfilCriado = funcionarioView.dataAdmissao || '06/02/2026';
  const ultimoAcesso = funcionarioView.ultimoAcesso || '-';
  const idInterno = funcionarioView.id || '1493045D829A4E93C6348CD39BC4548';
  const genero = funcionarioView.genero || 'Masculino';
  const dataNascimento = funcionarioView.dataNascimento || '16/04/2005';







  // Impede rolagem do body apenas quando o modal de contato está aberto
  useEffect(() => {
    if (showEditContato) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEditContato]);

  // ====== ESTADO E HANDLERS DO MODAL DE CONTATO DE EMERGÊNCIA ======
  const [showEditContatoEmergencia, setShowEditContatoEmergencia] = useState(false);
  // Lista de contatos de emergência
  const [contatosEmergencia, setContatosEmergencia] = useLocalStorageState<ContatoEmergencia[]>('contatosEmergencia', []);
  // Estado para edição/adicionar contato
  const [editContatoEmergencia, setEditContatoEmergencia] = useState({
    nome: '',
    relacao: '',
    celular: '',
    telefone: '',
    email: '',
  });
  // Índice do contato em edição (null = novo)
  const [editIndexContatoEmergencia, setEditIndexContatoEmergencia] = useState<number | null>(null);

  // Abrir modal para novo contato
  const handleOpenNovoContatoEmergencia = () => {
    setEditContatoEmergencia({ nome: '', relacao: '', celular: '', telefone: '', email: '' });
    setEditIndexContatoEmergencia(null);
    setShowEditContatoEmergencia(true);
  };
  // Abrir modal para editar todos os contatos de emergência
  const [showListaContatosEmergencia, setShowListaContatosEmergencia] = useState(false);
  const handleEditarContatoEmergencia = () => {
    setShowListaContatosEmergencia(true);
  };
  // Editar contato individual da lista
  const handleEditarContatoIndividual = (idx: number) => {
    setEditContatoEmergencia(contatosEmergencia[idx]);
    setEditIndexContatoEmergencia(idx);
    setShowEditContatoEmergencia(true);
  };
  // Remover contato individual da lista
  const handleRemoverContatoIndividual = (idx: number) => {
    setContatosEmergencia(prev => prev.filter((_, i) => i !== idx));
  };
  // Atualizar campos do modal
  const handleEditContatoEmergenciaChange = (field: string, value: string) => {
    setEditContatoEmergencia(prev => ({ ...prev, [field]: value }));
  };
  // Salvar contato (novo ou edição)
  const handleEditContatoEmergenciaSubmit = () => {
    if (editIndexContatoEmergencia === null) {
      setContatosEmergencia(prev => [...prev, editContatoEmergencia]);
    } else {
      setContatosEmergencia(prev => prev.map((c, i) => i === editIndexContatoEmergencia ? editContatoEmergencia : c));
    }
    setShowEditContatoEmergencia(false);
  };
  // Persistir contatos de emergência no localStorage sempre que mudar

  // Remover contato de emergência
  const handleRemoverContatoEmergencia = () => {
    if (editIndexContatoEmergencia !== null) {
      setContatosEmergencia(prev => prev.filter((_, i) => i !== editIndexContatoEmergencia));
      setShowEditContatoEmergencia(false);
    }
  };

  const detailTabs: Array<{ key: PerfilTab; label: string }> = [
    { key: 'principal', label: 'Principal' },
    { key: 'profissional', label: 'Profissional e Financeiro' },
    { key: 'endereco', label: 'Endereço e contatos' },
    { key: 'dependentes', label: 'Dependentes' },
  ];

  const getDetailTabButtonClass = (tab: PerfilTab) =>
    `text-sm ${abaAtiva === tab ? 'font-bold text-indigo-700 border-b-2 border-indigo-700 px-2 pb-1' : 'text-gray-600'}`;

  const renderDetailTabButtons = () => (
    <div className="flex justify-between gap-2 border-b border-gray-200 mb-4">
      {detailTabs.map(({ key, label }) => (
        <button
          key={key}
          className={getDetailTabButtonClass(key)}
          onClick={() => setAbaAtiva(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Modal de edição de informações pessoais */}
      <EditarDadosPessoaisModal
        open={editDadosPessoaisModal.open}
        onClose={editDadosPessoaisModal.handleClose}
        values={editDadosPessoaisModal.values}
        onChange={editDadosPessoaisModal.handleChange}
        onSubmit={editDadosPessoaisModal.handleSubmit}
      />
      {/* Modal de edição de formação */}
      <EditarFormacaoModal
        open={editFormacaoModal.open}
        values={editFormacaoModal.values}
        onChange={editFormacaoModal.handleChange}
        onClose={editFormacaoModal.handleClose}
        onSubmit={editFormacaoModal.handleSubmit}
      />
      {/* Modal de edição de necessidades especiais */}
      <EditarNecessidadeModal
        open={editNecessidadeModal.open}
        values={editNecessidadeModal.values}
        onChange={editNecessidadeModal.handleChange}
        onClose={editNecessidadeModal.handleClose}
        onSubmit={editNecessidadeModal.handleSubmit}
      />
      {/* Modal de edição de Informações Profissionais */}
      <EditarProfissionalModal
        open={editProfissionalModal.open}
        values={editProfissionalModal.values}
        onChange={editProfissionalModal.handleChange}
        onClose={editProfissionalModal.handleClose}
        funcionarioView={funcionarioView}
        onSubmit={editProfissionalModal.handleSubmit}
      />
      <div className="bg-gray-50 min-h-screen py-6 px-1 md:px-0">
        {/* Abas superiores refinadas */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg px-0 pt-0 pb-0 mb-4">
            <div className="flex flex-row justify-between border-b border-gray-200">
              <button className="flex-1 px-0 py-3 text-base font-bold text-indigo-700 border-b-2 border-indigo-700 bg-white transition-all text-center" style={{marginBottom: -1}}>Principal</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Permissões de ponto</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Histórico de ponto</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Espelho de ponto</button>
              <button className="flex-1 px-0 py-3 text-base font-medium text-gray-700 border-b-2 border-transparent bg-white hover:text-indigo-700 transition-all text-center" style={{marginBottom: -1}}>Férias/Afastamentos</button>
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
            <div className="mb-2">Nacionalidade: <span className="text-gray-900 font-medium">{funcionarioView.nacionalidade || '-'}</span></div>
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
                <button
                  className="border border-indigo-600 text-indigo-700 font-medium rounded px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 transition-all text-xs"
                  onClick={() => {
                    if (funcionario && funcionario.id) {
                      localStorage.setItem('editingEmployeeId', funcionario.id);
                      localStorage.setItem('currentPage', 'cadastro-funcionario');
                      // Também seta o perfil para garantir que App.tsx saiba de onde veio
                      localStorage.setItem('perfilFuncionarioId', funcionario.id);
                      window.dispatchEvent(new Event('storage'));
                    }
                  }}
                >
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
                <button
                  className="border border-red-500 text-red-600 font-medium rounded px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 transition-all text-xs"
                  onClick={() => setShowDismissModal(true)}
                >
                        {/* Modal de confirmação de demissão */}
                        {showDismissModal && funcionarioView && (
                          <DeleteConfirmModal
                            title="Confirmar demissão"
                            description="Tem certeza que deseja demitir este funcionário? Esta ação não pode ser desfeita."
                            itemName={funcionarioView.nomeCompleto}
                            onCancel={() => setShowDismissModal(false)}
                            onConfirm={() => {
                              setShowDismissModal(false);
                              if (onDismissEmployee && funcionarioView?.id) {
                                onDismissEmployee(funcionarioView.id);
                              }
                            }}
                          />
                        )}
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
            {renderDetailTabButtons()}
        {abaAtiva === 'endereco' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-indigo-700">Endereço</h2>
              <button className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold" onClick={handleOpenEditEndereco} aria-label="Editar endereço">Editar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
              <div>
                <div className="mb-2"><span className="font-medium text-gray-600">CEP:</span> <span className="font-semibold text-gray-900">{funcionarioView.cep || '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">Endereço:</span> <span className="font-semibold text-gray-900">{funcionarioView.endereco || '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">Número:</span> <span className="font-semibold text-gray-900">{funcionarioView.numero || '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">Complemento:</span> <span className="font-semibold text-gray-900">{funcionarioView.complemento || '-'}</span></div>
              </div>
              <div>
                <div className="mb-2"><span className="font-medium text-gray-600">Bairro:</span> <span className="font-semibold text-gray-900">{funcionarioView.bairro || '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">Cidade:</span> <span className="font-semibold text-gray-900">{funcionarioView.cidade || '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">Estado:</span> <span className="font-semibold text-gray-900">{funcionarioView.estado || '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">País:</span> <span className="font-semibold text-gray-900">{funcionarioView.pais || '-'}</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4 mt-8">
              <h2 className="text-base font-bold text-indigo-700">Contato</h2>
              <button className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold" onClick={handleOpenEditContato} aria-label="Editar contato">Editar</button>
            </div>
            <EditarContatoModal
              open={showEditContato}
              values={editContato}
              onChange={handleEditContatoChange}
              onClose={() => setShowEditContato(false)}
              onSubmit={handleEditContatoSubmit}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
              <div>
                <div className="mb-2"><span className="font-medium text-gray-600">Celular:</span> <span className="font-semibold text-gray-900">{funcionarioView.celular ? maskCelular(funcionarioView.celular) : '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">WhatsApp:</span> <span className="font-semibold text-gray-900">{funcionarioView.whatsapp ? maskWhatsapp(funcionarioView.whatsapp) : '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">Telefone:</span> <span className="font-semibold text-gray-900">{funcionarioView.telefone ? maskTelefone(funcionarioView.telefone) : '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">Telefone alternativo:</span> <span className="font-semibold text-gray-900">{funcionarioView.telefoneAlternativo ? maskTelefone(funcionarioView.telefoneAlternativo) : '-'}</span></div>
              </div>
              <div>
                <div className="mb-2"><span className="font-medium text-gray-600">E-mail:</span> <span className="font-bold text-gray-900">{funcionarioView.email || '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">E-mail alternativo:</span> <span className="font-semibold text-gray-900">{funcionarioView.emailAlternativo || '-'}</span></div>
                <div className="mb-2"><span className="font-medium text-gray-600">Linkedin:</span> <span className="font-semibold text-gray-900">{funcionarioView.linkedin || '-'}</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4 mt-8">
              <span className="text-base font-bold text-indigo-700">Contatos de emergência</span>
              {contatosEmergencia.length > 0 && (
                <button
                  className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold"
                  onClick={handleEditarContatoEmergencia}
                  aria-label="Editar contatos de emergência"
                >
                  Editar
                </button>
              )}
            </div>
              {contatosEmergencia.length === 0 ? (
                <div className="text-xs text-gray-500 mb-4">Nenhum contato de emergência</div>
              ) : (
                <div className="mb-4 space-y-3">
                  {contatosEmergencia.map((contato, idx) => (
                    <div key={idx} className="border-b pb-2">
                      <div className="mb-1">
                        <div className="font-bold text-gray-700">Contato {idx + 1}</div>
                      </div>
                      <div className="text-xs text-gray-700">
                        <div className="mb-2"><span className="font-medium text-gray-600">Nome:</span> <span className="font-semibold text-gray-900">{contato.nome || '-'}</span></div>
                        <div className="mb-2"><span className="font-medium text-gray-600">Relação:</span> <span className="font-semibold text-gray-900">{contato.relacao || '-'}</span></div>
                        <div className="mb-2"><span className="font-medium text-gray-600">Celular:</span> <span className="font-semibold text-gray-900">{contato.celular || '-'}</span></div>
                        <div className="mb-2"><span className="font-medium text-gray-600">Telefone:</span> <span className="font-semibold text-gray-900">{contato.telefone || '-'}</span></div>
                        <div className="mb-2"><span className="font-medium text-gray-600">E-mail:</span> <span className="font-semibold text-gray-900">{contato.email || '-'}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            {contatosEmergencia.length === 0 && (
              <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-indigo-700 font-semibold py-2 rounded transition text-xs" onClick={handleOpenNovoContatoEmergencia}>
                <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='16' height='16' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2'/><path stroke='currentColor' strokeWidth='2' strokeLinecap='round' d='M12 8v8m-4-4h8'/></svg>
                Novo contato de emergência
              </button>
            )}
            {contatosEmergencia.length > 0 && (
              <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-indigo-700 font-semibold py-2 rounded transition text-xs mt-2" onClick={handleOpenNovoContatoEmergencia}>
                <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='16' height='16' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2'/><path stroke='currentColor' strokeWidth='2' strokeLinecap='round' d='M12 8v8m-4-4h8'/></svg>
                Novo contato de emergência
              </button>
            )}
            {/* Modal para editar um contato individual */}
            <EditarContatoEmergenciaModal
              open={showEditContatoEmergencia}
              values={editContatoEmergencia}
              onChange={handleEditContatoEmergenciaChange}
              onClose={() => setShowEditContatoEmergencia(false)}
              onSubmit={handleEditContatoEmergenciaSubmit}
              RemoverBotao={editIndexContatoEmergencia !== null}
              onRemover={handleRemoverContatoEmergencia}
            />
            {/* Modal para listar e editar/remover todos os contatos */}
            {showListaContatosEmergencia && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 relative animate-fade-in">
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    onClick={() => setShowListaContatosEmergencia(false)}
                    aria-label="Fechar"
                  >×</button>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Editar contatos de emergência</h2>
                  {contatosEmergencia.length === 0 ? (
                    <div className="text-xs text-gray-500 mb-4">Nenhum contato de emergência cadastrado.</div>
                  ) : (
                    <div className="space-y-4 mb-4">
                      {contatosEmergencia.map((contato, idx) => (
                        <div key={idx} className="border-b pb-3 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-700 mb-1">Contato {idx + 1}</div>
                            <div className="text-xs text-gray-700">
                              <span className="font-medium">Nome:</span> {contato.nome || '-'}<br />
                              <span className="font-medium">Relação:</span> {contato.relacao || '-'}<br />
                              <span className="font-medium">Celular:</span> {contato.celular || '-'}<br />
                              <span className="font-medium">Telefone:</span> {contato.telefone || '-'}<br />
                              <span className="font-medium">E-mail:</span> {contato.email || '-'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="flex items-center gap-1 text-indigo-700 hover:underline text-xs"
                              onClick={() => { handleEditarContatoIndividual(idx); setShowListaContatosEmergencia(false); }}
                              title={`Editar contato ${idx + 1}`}
                            >
                              <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='14' height='14' fill='none' viewBox='0 0 24 24'><path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m2-2v8m0 0 2-2m-2 2-2-2'/></svg>
                              Editar
                            </button>
                            <button
                              className="flex items-center gap-1 text-red-500 hover:underline text-xs"
                              onClick={() => handleRemoverContatoIndividual(idx)}
                              title={`Remover contato ${idx + 1}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Remover
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-indigo-700 font-medium py-2 rounded transition text-xs mt-2"
                    onClick={() => { setShowListaContatosEmergencia(false); handleOpenNovoContatoEmergencia(); }}
                  >
                    <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='16' height='16' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2'/><path stroke='currentColor' strokeWidth='2' strokeLinecap='round' d='M12 8v8m-4-4h8'/></svg>
                    Novo contato de emergência
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de edição de endereço deve ser global, para garantir stacking correto */}
        <EditarEnderecoModal
          open={editEnderecoModal.open}
          values={editEnderecoModal.values}
          onChange={editEnderecoModal.handleChange}
          onClose={editEnderecoModal.handleClose}
          onSubmit={editEnderecoModal.handleSubmit}
        />
        {abaAtiva === 'profissional' && (
              <div>
                {/* Informações Profissionais */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-indigo-700">Informações profissionais</h2>
                  <button onClick={() => editProfissionalModal.handleOpen({
                    vinculo: funcionarioView?.vinculo || '',
                    cargo: funcionarioView?.cargo || '',
                    equipe: funcionarioView?.equipe || '',
                    turno: funcionarioView?.turno || '',
                    departamento: funcionarioView?.departamento || '',
                    unidadeNegocio: funcionarioView?.loja || '',
                    primeiroEmprego: funcionarioView?.primeiroEmprego || 'não',
                    cargoConfianca: funcionarioView?.cargoConfianca || 'não',
                    remuneracao: funcionarioView?.remuneracao || '',
                    frequenciaPagamento: funcionarioView?.frequenciaPagamento || '',
                    mesmoSalarioDesde: funcionarioView?.mesmoSalarioDesde || '',
                    estabilidade: funcionarioView?.estabilidade || '',
                    seguroDesemprego: funcionarioView?.seguroDesemprego || 'não',
                    aposentado: funcionarioView?.aposentado || 'não',
                    dataAdmissao: funcionarioView?.dataAdmissao || '',
                    pisPasep: funcionarioView?.pisPasep || '',
                    carteiraTrabalho: funcionarioView?.carteiraTrabalho || '',
                    registroProfissional: funcionarioView?.registroProfissional || '',
                    loja: funcionarioView?.loja || '',
                    dataExameAdmissional: funcionarioView?.dataExameAdmissional || '',
                  })} className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold" aria-label="Editar informações profissionais">Editar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Código/Matrícula:</span> <span className="font-bold text-gray-900">{funcionarioView.matricula || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Data de admissão:</span> <span className="font-bold text-gray-900">{funcionarioView.dataAdmissao || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Data de início:</span> <span className="font-bold text-gray-900">{funcionarioView.dataInicio || funcionarioView.dataAdmissao || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Data do exame admissional:</span> <span className="font-semibold text-gray-900">{funcionarioView.dataExameAdmissional || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Cargo:</span> <span className="font-semibold text-gray-900">{funcionarioView.cargo || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Turno:</span> <span className="font-semibold text-gray-900">{funcionarioView.turno || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Equipe:</span> <span className="font-semibold text-gray-900">{funcionarioView.equipe || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Departamento:</span> <span className="font-semibold text-gray-900">{departamento}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Loja:</span> <span className="font-semibold text-gray-900">{funcionarioView.loja || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Data do exame admissional:</span> <span className="font-semibold text-gray-900">{funcionarioView.dataExameAdmissional || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">PIS/PASEP:</span> <span className="font-semibold text-gray-900">{funcionarioView.pisPasep || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nº Carteira de Trabalho:</span> <span className="font-semibold text-gray-900">{funcionarioView.carteiraTrabalho || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Registro profissional:</span> <span className="font-semibold text-gray-900">{funcionarioView.registroProfissional || '-'}</span></div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Vínculo:</span> <span className="font-semibold text-gray-900">{
                      (() => {
                        const opt = VINCULO_OPTIONS.find(o => o.value === funcionarioView.vinculo);
                        return opt ? opt.label : '-';
                      })()
                    }</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Cargo de confiança?</span> <span className="font-bold text-gray-900">{funcionarioView.cargoConfianca === 'sim' ? 'Sim' : 'Não'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Primeiro emprego?</span> <span className="font-bold text-gray-900">{funcionarioView.primeiroEmprego === 'sim' ? 'Sim' : 'Não'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Remuneração:</span> <span className="font-semibold text-gray-900">{funcionarioView.remuneracao ? formatCurrency(Number(funcionarioView.remuneracao.replace(/\D/g, '')) / 100) : '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Frequência de pagamento:</span> <span className="font-bold text-gray-900">{funcionarioView.frequenciaPagamento ? funcionarioView.frequenciaPagamento.charAt(0).toUpperCase() + funcionarioView.frequenciaPagamento.slice(1) : 'Não informado'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Mesmo salário desde:</span> <span className="font-semibold text-gray-900">{funcionarioView.mesmoSalarioDesde || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Estabilidade:</span> <span className="font-semibold text-gray-900">{funcionarioView.estabilidade ? funcionarioView.estabilidade.charAt(0).toUpperCase() + funcionarioView.estabilidade.slice(1).replace('_',' ') : '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Tem seguro desemprego?</span> <span className="font-bold text-gray-900">{funcionarioView.seguroDesemprego === 'sim' ? 'Sim' : 'Não'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Aposentado?</span> <span className="font-bold text-gray-900">{funcionarioView.aposentado === 'sim' ? 'Sim' : 'Não'}</span></div>
                  </div>
                </div>

                {/* Dados Bancários */}

                <div className="flex items-center justify-between mt-8 mb-2">
                  <h2 className="text-base font-bold text-indigo-700">Dados bancários</h2>
                  <button
                    className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold"
                    onClick={handleOpenEditBancarios}
                    aria-label="Editar dados bancários"
                    type="button"
                  >Editar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-4">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Forma de pagamento:</span> <span className="font-semibold text-gray-900">{
                      (() => {
                        const opt = FORMA_PAGAMENTO_OPTIONS.find(o => o.value === funcionarioView.formaPagamento);
                        return opt ? opt.label : '-';
                      })()
                    }</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Tipo de conta:</span> <span className="font-bold text-gray-900">{
                      (() => {
                        const opt = TIPO_CONTA_OPTIONS.find(o => o.value === funcionarioView.tipoConta);
                        return opt ? opt.label : 'Não informado';
                      })()
                    }</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Banco:</span> <span className="font-semibold text-gray-900">{funcionarioView.banco || '-'}</span></div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-medium text-gray-600">Agência:</span>
                      <span className="font-semibold text-gray-900">{(funcionarioView.agencia || '-').toUpperCase()}</span>
                      <span className="font-medium text-gray-600 ml-2">Dígito:</span>
                      <span className="font-semibold text-gray-900">{(funcionarioView.agenciaDigito || '-').toUpperCase()}</span>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-medium text-gray-600">Conta:</span>
                      <span className="font-semibold text-gray-900">{(funcionarioView.conta || '-').toUpperCase()}</span>
                      <span className="font-medium text-gray-600 ml-2">Dígito:</span>
                      <span className="font-semibold text-gray-900">{(funcionarioView.contaDigito || '-').toUpperCase()}</span>
                    </div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Chave PIX:</span> <span className="font-semibold text-gray-900">{funcionarioView.chavePix || '-'}</span></div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Modalidade:</span> <span className="font-bold text-gray-900">{
                      (() => {
                        const opt = MODALIDADE_OPTIONS.find(o => o.value === funcionarioView.modalidade);
                        return opt ? opt.label : 'Não definido';
                      })()
                    }</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Tipo da chave:</span> <span className="font-semibold text-gray-900">{
                      (() => {
                        const opt = TIPO_CHAVE_OPTIONS.find(o => o.value === funcionarioView.tipoChave);
                        return opt ? opt.label : '-';
                      })()
                    }</span></div>
                  </div>
                </div>

                <EditarDadosBancariosModal
                  open={editBancariosModal.open}
                  values={editBancariosModal.values}
                  onChange={editBancariosModal.handleChange}
                  onClose={editBancariosModal.handleClose}
                  onSubmit={editBancariosModal.handleSubmit}
                />

                {/* Período de experiência */}
                <div className="flex items-center justify-between mt-8 mb-2">
                  <h2 className="text-base font-bold text-indigo-700">Período de experiência</h2>
                  <button className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold" onClick={handleOpenEditExperiencia} aria-label="Editar período de experiência">Editar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-4">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Período:</span> <span className="font-semibold text-gray-900">{
                      (() => {
                        const opt = PERIODO_EXPERIENCIA_OPTIONS.find(o => o.value === funcionarioView?.periodoExperiencia);
                        return opt ? opt.label : '-';
                      })()
                    }</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Início:</span> <span className="font-semibold text-gray-900">{funcionarioView?.dataInicioExperiencia || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Término:</span> <span className="font-semibold text-gray-900">{funcionarioView?.dataTerminoExperiencia || '-'}</span></div>
                  </div>
                </div>

                <EditarPeriodoExperienciaModal
                  open={editExperienciaModal.open}
                  values={editExperienciaModal.values}
                  onChange={editExperienciaModal.handleChange}
                  onClose={editExperienciaModal.handleClose}
                  onSubmit={editExperienciaModal.handleSubmit}
                />

                {/* Sindicato */}
                <div className="flex items-center justify-between mt-8 mb-2">
                  <h2 className="text-base font-bold text-indigo-700">Sindicato</h2>
                  <button className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold" onClick={handleOpenEditSindicato} aria-label="Editar sindicato">Editar</button>
                </div>
                <EditarSindicatoModal
                  open={editSindicatoModal.open}
                  values={editSindicatoModal.values}
                  onChange={editSindicatoModal.handleChange}
                  onClose={editSindicatoModal.handleClose}
                  onSubmit={editSindicatoModal.handleSubmit}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-2">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nome sindicato:</span> <span className="font-semibold text-gray-900">{funcionarioView.sindicato?.nome || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Funcionário contribui?</span> <span className="font-bold text-gray-900">{funcionarioView.sindicato?.contribui === 'sim' ? 'Sim' : funcionarioView.sindicato?.contribui === 'não' ? 'Não' : '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Valor:</span> <span className="font-semibold text-gray-900">{funcionarioView.sindicato?.valor ? formatCurrency(Number(funcionarioView.sindicato.valor) / 100) : '-'}</span></div>
                  </div>
                </div>
              </div>
            )}
      {abaAtiva === 'dependentes' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-indigo-700">Dependentes</h2>
            {dependentes.length > 0 && (
              <button
                className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold"
                onClick={() => setShowListaDependentes(true)}
                aria-label="Editar dependentes"
              >
                Editar
              </button>
            )}
          </div>
          <DependentesList
            dependentes={dependentes}
            onEdit={() => {}}
            onRemove={() => {}}
          />
          <button
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-indigo-700 font-semibold py-2 rounded transition text-xs"
            onClick={() => {
              setEditDependente({ nome: '', relacao: '', dataNascimento: '', nomeMae: '', cpf: '', telefone: '', email: '', observacoes: '' });
              setEditIndexDependente(null);
              setShowEditDependente(true);
            }}
            aria-label="Novo dependente"
          >
            <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='16' height='16' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2'/><path stroke='currentColor' strokeWidth='2' strokeLinecap='round' d='M12 8v8m-4-4h8'/></svg>
            Novo dependente
          </button>
          <EditarDependenteModal
            open={showEditDependente}
            values={editDependente}
            onChange={(field, value) => setEditDependente(prev => ({ ...prev, [field]: value }))}
            onClose={() => setShowEditDependente(false)}
            onSubmit={() => {
              if (editIndexDependente === null) {
                setDependentes(prev => [...prev, editDependente]);
              } else {
                setDependentes(prev => prev.map((d, i) => i === editIndexDependente ? editDependente : d));
              }
              setShowEditDependente(false);
              setEditIndexDependente(null);
            }}
            RemoverBotao={editIndexDependente !== null}
            onRemover={() => {
              if (editIndexDependente !== null) {
                setDependentes(prev => prev.filter((_, i) => i !== editIndexDependente));
                setShowEditDependente(false);
                setEditIndexDependente(null);
              }
            }}
            index={editIndexDependente ?? undefined}
          />
          {/* Modal de edição em lista, igual contatos de emergência */}
          {showListaDependentes && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-8 relative animate-fade-in">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  onClick={() => setShowListaDependentes(false)}
                  aria-label="Fechar"
                >×</button>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Editar dependentes</h2>
                {dependentes.length === 0 ? (
                  <div className="text-xs text-gray-500 mb-4">Nenhum dependente cadastrado.</div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {dependentes.map((dep, idx) => (
                      <div key={idx} className="border-b pb-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-700 mb-1">Dependente {idx + 1}</div>
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">Nome:</span> {dep.nome || '-'}<br />
                            <span className="font-medium">Relação:</span> {dep.relacao || '-'}<br />
                            <span className="font-medium">Data de nascimento:</span> {dep.dataNascimento || '-'}<br />
                            <span className="font-medium">Nome da mãe:</span> {dep.nomeMae || '-'}<br />
                            <span className="font-medium">CPF:</span> {dep.cpf || '-'}<br />
                            <span className="font-medium">Telefone:</span> {dep.telefone || '-'}<br />
                            <span className="font-medium">E-mail:</span> {dep.email || '-'}<br />
                            <span className="font-medium">Observações:</span> {dep.observacoes || '-'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex items-center gap-1 text-indigo-700 hover:underline text-xs"
                            onClick={() => { handleEditDependente(idx); setShowListaDependentes(false); }}
                            title={`Editar dependente ${idx + 1}`}
                          >
                            <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='14' height='14' fill='none' viewBox='0 0 24 24'><path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m2-2v8m0 0 2-2m-2 2-2-2'/></svg>
                            Editar
                          </button>
                          <button
                            className="flex items-center gap-1 text-red-500 hover:underline text-xs"
                            onClick={() => handleRemoveDependente(idx)}
                            title={`Remover dependente ${idx + 1}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-indigo-700 font-medium py-2 rounded transition text-xs mt-2"
                  onClick={() => { setShowListaDependentes(false); setEditDependente({ nome: '', relacao: '', dataNascimento: '', nomeMae: '', cpf: '', telefone: '', email: '', observacoes: '' }); setEditIndexDependente(null); setShowEditDependente(true); }}
                >
                  <svg xmlns='http://www.w3.org/2000/svg' className='inline-block' width='16' height='16' fill='none' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2'/><path stroke='currentColor' strokeWidth='2' strokeLinecap='round' d='M12 8v8m-4-4h8'/></svg>
                  Novo dependente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
            {abaAtiva === 'principal' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-indigo-700">Informações pessoais</h2>
                  <button onClick={() => editDadosPessoaisModal.handleOpen({
                    nomeCompleto: funcionarioView?.nomeCompleto || '',
                    cpf: funcionarioView?.cpf || '',
                    rg: funcionarioView?.rg || '',
                    corRaca: funcionarioView?.corRaca ? String(funcionarioView.corRaca) : '',
                    genero: funcionarioView?.genero ? String(funcionarioView.genero) : '',
                    estadoCivil: funcionarioView?.estadoCivil ? String(funcionarioView.estadoCivil) : '',
                    categoria: funcionarioView?.categoria ? String(funcionarioView.categoria) : '',
                    mae: funcionarioView?.mae || '',
                    pai: funcionarioView?.pai || '',
                    nacionalidade: funcionarioView?.nacionalidade || 'Brasileiro',
                    paisNascimento: funcionarioView?.paisNascimento || '',
                    estadoNascimento: funcionarioView?.estadoNascimento || '',
                    cidadeNascimento: funcionarioView?.cidadeNascimento || '',
                    cnh: funcionarioView?.cnh || '',
                    obsGerais: funcionarioView?.obsGerais || '',
                    dataNascimento: funcionarioView?.dataNascimento || '',
                  })} className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold" aria-label="Editar informações pessoais">Editar</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nome completo:</span> <span className="font-semibold text-gray-900">{funcionarioView.nomeCompleto}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">CPF:</span> <span className="font-bold text-gray-900">{funcionarioView.cpf}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">RG:</span> <span className="font-semibold text-gray-900">{funcionarioView.rg || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Gênero:</span> <span className="font-semibold text-gray-900">{funcionarioView.genero ? funcionarioView.genero.charAt(0).toUpperCase() + funcionarioView.genero.slice(1) : '-'}</span></div>

                    <div className="mb-2"><span className="font-medium text-gray-600">Estado civil:</span> <span className="font-semibold text-gray-900">{funcionarioView.estadoCivil ? funcionarioView.estadoCivil.charAt(0).toUpperCase() + funcionarioView.estadoCivil.slice(1) : '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">CNH:</span> <span className="font-semibold text-gray-900">{funcionarioView.cnh || '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Categoria:</span> <span className="font-semibold text-gray-900">{funcionarioView.categoria ? funcionarioView.categoria.toUpperCase() : '-'}</span></div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Observações gerais:</span> <span className="font-semibold text-gray-900">{funcionarioView.obsGerais || '-'}</span></div>
                  </div>
                  <div>
                    <div className="mb-2"><span className="font-medium text-gray-600">Nacionalidade:</span> <span className="font-bold text-gray-900">{funcionarioView.nacionalidade || '-'}</span></div>
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
                  <button onClick={() => editFormacaoModal.handleOpen({
                    escolaridade: funcionarioView?.escolaridade || '',
                    conclusao: funcionarioView?.conclusao || '',
                    areasFormacao: funcionarioView?.areasFormacao || ''
                  })} className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold" aria-label="Editar formação">Editar</button>
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
                  <button onClick={() => editNecessidadeModal.handleOpen({
                    necessidadeEspecial: funcionarioView?.necessidadeEspecial || 'não',
                    tipoNecessidade: funcionarioView?.tipoNecessidade || '',
                    obsNecessidade: funcionarioView?.obsNecessidade || '',
                  })} className="flex items-center gap-1 text-indigo-700 hover:underline text-xs font-semibold" aria-label="Editar necessidades especiais">Editar</button>
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
