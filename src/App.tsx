// Função utilitária para registrar ações de afastamento/licença no histórico
type RegistrarHistoricoLicencaParams = {
  acao: string;
  usuario?: string;
  funcionarioNome: string;
  tipoLicenca: string;
  dataInicio?: string;
  dataTermino?: string;
  detalhes?: string;
  entryId?: string;
  setHistoryEntries: (updater: (prev: any[]) => any[]) => void;
};

function registrarHistoricoLicenca({
  acao,
  usuario,
  funcionarioNome,
  tipoLicenca,
  dataInicio,
  dataTermino,
  detalhes,
  entryId,
  setHistoryEntries
}: RegistrarHistoricoLicencaParams) {
  // Converte datas de DD/MM/AAAA para AAAA-MM-DD se necessário
  function toISO(dateStr?: string) {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const [dia, mes, ano] = dateStr.split('/');
    if (ano && mes && dia) return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    return dateStr;
  }
  const inicioISO = toISO(dataInicio);
  const terminoISO = toISO(dataTermino);
  const periodo = terminoISO && terminoISO !== inicioISO
    ? `${inicioISO} a ${terminoISO}`
    : inicioISO;
  setHistoryEntries((prev: any[]) => [
    {
      id: entryId || `${acao}-${funcionarioNome}-${tipoLicenca}-${periodo}-${Date.now()}`,
      usuario: usuario || 'Usuário',
      acao,
      alvo: funcionarioNome ? `para ${funcionarioNome.replace(/^para /, '')}` : '',
      tipo: 'licenca',
      dataRegistro: new Date().toISOString(),
      dataEvento: periodo,
      detalhes,
    },
    ...prev
  ]);
}
// ...existing code...
import React, { useEffect, useState } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { AlertTriangle } from 'lucide-react'
import Header from './components/Header'
import Calendar from './pages/Calendar'
import LancamentoLicenca from './pages/LancamentoLicenca'
import LancamentoIndividualOuMassa from './pages/LancamentoIndividualOuMassa'
import Navigation from './components/Navigation'
import PromoCards from './components/PromoCards'
import StatusCard from './components/StatusCard'
import PendingTasks from './components/PendingTasks'
import HistoryList, { HistoryEntry } from './components/HistoryList'
import Sidebar from './components/Sidebar'
import SystemMotionFeedback from './components/SystemMotionFeedback'
import ActiveEmployees from './pages/ActiveEmployees'
import PerfilFuncionario from './pages/PerfilFuncionario'
import EmployeeRegistration from './pages/EmployeeRegistration'
import Birthdays from './pages/Birthdays'
import DismissedEmployees from './pages/DismissedEmployees'
import Departments from './pages/Departments'
import DepartmentCreate from './pages/DepartmentCreate'
import CompanyData from './pages/CompanyData'
import Positions from './pages/Positions'
import PositionCreate from './pages/PositionCreate'
import BusinessUnits from './pages/BusinessUnits'
import LancamentoIndividual from './pages/LancamentoIndividual'
import Teams from './pages/Teams'
import TeamCreate from './pages/TeamCreate'
import FeriasEAfastamentos from './pages/FeriasEAfastamentos'
import BusinessUnitCreate from './pages/BusinessUnitCreate'
import Shifts from './pages/Shifts'
import ShiftRegistration from './pages/ShiftRegistration'

import TeamView from './pages/TeamView';
import Faltas from './pages/Faltas';
import AdicionarFalta from './pages/AdicionarFalta';
import Atrasos from './pages/Atrasos';
import AdicionarAtraso from './pages/AdicionarAtraso';
import QuebraDeCaixa from './pages/QuebraDeCaixa';
import AdicionarQuebraDeCaixa from './pages/AdicionarQuebraDeCaixa';
import Ceasa from './pages/Ceasa';
import CeasaSupplierCreate from './pages/CeasaSupplierCreate';
import CeasaPurchaseCreate from './pages/CeasaPurchaseCreate';
import CeasaAnalytics from './pages/CeasaAnalytics';
import Beneficios from './pages/Beneficios';
import Feriados from './pages/Feriados.tsx';
import Login from './pages/Login';
import Usuarios from './pages/Usuarios';
import Administradores from './pages/Administradores';
import PermissoesPerfis from './pages/PermissoesPerfis';
import { ProfilePermissions, loadProfilePermissions, saveProfilePermissions, canAccessPage, getFirstAllowedPage } from './utils/permissions';

export interface SindicatoData {
  nome: string;
  contribui: string;
  valor: string;
  anexo: File | string | null;
}

export interface Employee {
  id: string;
  matricula: string;
  nomeCompleto: string;
  email: string;
  cpf: string;
  genero: string;
  dataNascimento: string;
  isCLT: string;
  pis?: string;
  dataAdmissao: string;
  equipe: string;
  cargo: string;
  turno: string;
  ultimoAcesso: string;
  ultimoRegistro: string;
  criarDiasApartirDe?: string;
  loja: string;
  corRaca?: string;
  estadoCivil?: string;
  categoria?: string;
  mae?: string;
  pai?: string;
  rg?: string;
  cnh?: string;
  nacionalidade?: string;
  paisNascimento?: string;
  estadoNascimento?: string;
  cidadeNascimento?: string;
  obsGerais?: string;
  escolaridade?: string;
  conclusao?: string;
  areasFormacao?: string;
  necessidadeEspecial?: string;
  tipoNecessidade?: string;
  obsNecessidade?: string;
  // Novos campos para Profissional e Financeiro
  dataInicio?: string;
  dataExameAdmissional?: string;
  // --- CAMPOS BANCÁRIOS ---
  formaPagamento?: string;
  modalidade?: string;
  tipoConta?: string;
  banco?: string;
  agencia?: string;
  agenciaDigito?: string;
  conta?: string;
  contaDigito?: string;
  chavePix?: string;
  tipoChave?: string;
  pisPasep?: string;
  carteiraTrabalho?: string;
  registroProfissional?: string;
  vinculo?: string;
  cargoConfianca?: string;
  primeiroEmprego?: string;
  remuneracao?: string;
  frequenciaPagamento?: string;
  mesmoSalarioDesde?: string;
  estabilidade?: string;
  seguroDesemprego?: string;
  aposentado?: string;
  departamento?: string;
  periodoExperiencia?: string;
  dataInicioExperiencia?: string;
  dataTerminoExperiencia?: string;
  // CAMPOS DE CONTATO
  emailAlternativo?: string;
  celular?: string;
  whatsapp?: string;
  telefone?: string;
  telefoneAlternativo?: string;
  linkedin?: string;
  // Dados de sindicato
  sindicato?: SindicatoData;
  // --- CAMPOS DE ENDEREÇO ---
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
}

export interface Position {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  totalFuncionarios: number;
  criadoEm: string;
}

export interface BusinessUnit {
  id: string;
  nomeUnidade: string;
  unidadePrincipal: boolean;
  cnpj: string;
  telefone?: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  ramoAtividade?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  estado?: string;
  cidade?: string;
  observacao?: string;
  criadoEm: string;
}

export interface Department {
  id: string;
  codigo: string;
  nome: string;
  unidadeNegocio: string;
  observacao?: string;
  criadoEm: string;
}

export interface Team {
  id: string;
  codigo: string;
  nome: string;
  lojaId?: string;
  lojaNome?: string;
  departamentoId: string;
  departamentoNome: string;
  observacao?: string;
  employeeIds: string[];
  gestorIds?: string[];
  totalFuncionarios: number;
  totalGestores: number;
  criadoEm: string;
}

export interface Falta {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  data: string;
  motivo: string;
  criadoEm: string;
}

export interface Atraso {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  data: string;
  motivo: string;
  criadoEm: string;
}

export interface QuebraDeCaixa {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  data: string;
  formaPagamento: string;
  criadoEm: string;
}

export interface Beneficio {
  id: string;
  nome: string;
  categoria: 'hora_extra' | 'adicional' | 'vale' | 'beneficio' | 'previdencia' | 'outros';
  tipo: 'percentual' | 'valor_fixo' | 'variavel';
  percentual?: number;
  valor?: number;
  descricao?: string;
  incidencia?: 'provento' | 'desconto' | 'informativo';
  baseCalculo?: 'salario_base' | 'hora_normal' | 'piso_categoria' | 'valor_mensal' | 'valor_dia' | 'valor_evento' | 'nao_se_aplica';
  natureza?: 'legal' | 'convencao_coletiva' | 'politica_interna' | 'premiacao';
  elegibilidadeTipo?: 'todos' | 'empresa' | 'loja' | 'departamento' | 'cargo' | 'equipe' | 'contrato';
  elegibilidadeValores?: string[];
  vigenciaInicio?: string;
  vigenciaFim?: string;
  tetoMensal?: number;
  carenciaDias?: number;
  coparticipacao?: number;
  codigoRubrica?: string;
  codigoInterno?: string;
  incideINSS?: boolean;
  incideFGTS?: boolean;
  incideIRRF?: boolean;
  enviaESocial?: boolean;
  ativo: boolean;
  criadoEm: string;
}

export interface SistemaUsuario {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  senhaHash: string;
  perfil: 'admin' | 'rh' | 'gestor' | 'colaborador';
  ativo: boolean;
  criadoEm: string;
  ultimoAcesso?: string;
}

export interface LoggedUser {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  perfil: SistemaUsuario['perfil'];
}

interface DeleteBlockedModalState {
  entityLabel: string;
  entityName: string;
  employees: Employee[];
}

function App() {
  // Histórico de ações do sistema (persistente)
    // Funcionários demitidos (persistente)
    const [dismissedEmployees, setDismissedEmployees] = useState<Employee[]>(() => {
      const stored = localStorage.getItem('dismissedEmployees');
      if (stored) {
        try {
          return JSON.parse(stored) as Employee[];
        } catch {
          localStorage.removeItem('dismissedEmployees');
        }
      }
      return [];
    });

    // Persistir dismissedEmployees
    useEffect(() => {
      localStorage.setItem('dismissedEmployees', JSON.stringify(dismissedEmployees));
    }, [dismissedEmployees]);
    // Função para demitir funcionário
    const handleDismissEmployee = (employeeId: string) => {
      setEmployees((prevEmployees) => {
        const employeeToDismiss = prevEmployees.find(e => e.id === employeeId);
        if (!employeeToDismiss) return prevEmployees;
        const dataDemissao = new Date().toLocaleDateString('pt-BR');
        setDismissedEmployees((prev) => [
          ...prev,
          { ...employeeToDismiss, dataDemissao },
        ]);
        showSuccessToast(`Funcionário \"${employeeToDismiss.nomeCompleto}\" demitido com sucesso.`);
        return prevEmployees.filter(e => e.id !== employeeId);
      });
      setCurrentPage('funcionarios-ativos');
    };
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => {
    const stored = localStorage.getItem('historyEntries');
    if (stored) {
      try {
        return JSON.parse(stored) as HistoryEntry[];
      } catch {
        localStorage.removeItem('historyEntries');
      }
    }
    return [];
  });
  // Função para limpar o histórico manualmente
  const limparHistorico = () => {
    setHistoryEntries([]);
    localStorage.removeItem('historyEntries');
  };

  // Limpeza única para reiniciar os testes de histórico sem afetar gravações futuras.
  useEffect(() => {
    const resetKey = 'historyEntriesResetDone_v2';
    const alreadyReset = localStorage.getItem(resetKey) === 'true';
    if (!alreadyReset) {
      limparHistorico();
      localStorage.setItem(resetKey, 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sempre salvar histórico no localStorage
  useEffect(() => {
    localStorage.setItem('historyEntries', JSON.stringify(historyEntries));
  }, [historyEntries]);
  const hasRenderedPageRef = React.useRef(false)

  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(() => {
    const stored = localStorage.getItem('sistema_usuario_logado')
    if (stored) {
      try { return JSON.parse(stored) as LoggedUser } catch { /* ignore */ }
    }
    return null
  })

  // Inicializa admin padrão se não existir nenhum usuário
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('sistema_usuarios')
      const users: SistemaUsuario[] = stored ? JSON.parse(stored) : []
      if (users.length === 0) {
        const { hashPassword } = await import('./utils/auth')
        const senhaHash = await hashPassword('admin123')
        const admin: SistemaUsuario = {
          id: 'admin-default',
          nome: 'Administrador',
          usuario: 'admin',
          email: 'admin@sistema.com',
          senhaHash,
          perfil: 'admin',
          ativo: true,
          criadoEm: new Date().toISOString(),
        }
        localStorage.setItem('sistema_usuarios', JSON.stringify([admin]))
      }
    }
    init()
  }, [])

  const handleLogin = (user: LoggedUser) => {
    setLoggedUser(user)
    setCurrentPage('dashboard')
    localStorage.setItem('currentPage', 'dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('sistema_usuario_logado')
    setLoggedUser(null)
  }

  const handleUpdateLoggedUser = (user: LoggedUser) => {
    setLoggedUser(user)
  }

  const [profilePermissions, setProfilePermissions] = useState<ProfilePermissions>(() => loadProfilePermissions())
  const [showRoutePulse, setShowRoutePulse] = useState(false)
  const [connectionState, setConnectionState] = useState<'normal' | 'unstable' | 'offline'>(() => {
    if (typeof navigator === 'undefined') return 'normal'
    return navigator.onLine ? 'normal' : 'offline'
  })

  const handleSaveProfilePermissions = (permissions: ProfilePermissions) => {
    setProfilePermissions(permissions)
    saveProfilePermissions(permissions)
    showSuccessToast('Permissoes por perfil atualizadas com sucesso.')
  }

  const canAccessRouteForCurrentUser = (route: string): boolean => {
    if (!loggedUser) return false
    return canAccessPage(route, loggedUser.perfil, profilePermissions)
  }

  const readConnectionState = (): 'normal' | 'unstable' | 'offline' => {
    if (typeof navigator === 'undefined') return 'normal'
    if (!navigator.onLine) return 'offline'

    const connection = (navigator as Navigator & {
      connection?: {
        effectiveType?: string
        saveData?: boolean
        addEventListener?: (type: string, listener: () => void) => void
        removeEventListener?: (type: string, listener: () => void) => void
      }
    }).connection

    if (connection?.saveData) return 'unstable'
    if (connection?.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) {
      return 'unstable'
    }

    return 'normal'
  }

    const [viewingTeamId, setViewingTeamId] = useState<string | null>(null);
    const handleViewTeam = (id: string) => {
      setViewingTeamId(id);
      setCurrentPage('visualizar-equipe');
    };
  const [activeTab, setActiveTab] = useState('controle')
  const [editingShiftCode, setEditingShiftCode] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const hashPage = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''
    if (hashPage) return hashPage
    const storedPage = localStorage.getItem('currentPage');
    return storedPage || 'dashboard';
  });

  useEffect(() => {
    if (currentPage === 'dashboard') {
      setActiveTab('controle')
    }
  }, [currentPage])

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const storedEmployees = localStorage.getItem('employees')
    if (storedEmployees) {
      try {
        return JSON.parse(storedEmployees) as Employee[]
      } catch {
        localStorage.removeItem('employees')
      }
    }
    return []
  })

  const [positions, setPositions] = useState<Position[]>(() => {
    const storedPositions = localStorage.getItem('positions')
    if (storedPositions) {
      try {
        return JSON.parse(storedPositions) as Position[]
      } catch {
        localStorage.removeItem('positions')
      }
    }
    return []
  })

  const [editingPositionId, setEditingPositionId] = useState<string | null>(null)
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)

  // Sempre que mudar para a tela de cadastro-funcionario, pega o perfilFuncionarioId do localStorage
  React.useEffect(() => {
    if (currentPage === 'cadastro-funcionario') {
      const editingId = localStorage.getItem('editingEmployeeId');
      const perfilId = editingId || localStorage.getItem('perfilFuncionarioId');
      if (perfilId) {
        setEditingEmployeeId(perfilId);
      } else {
        setEditingEmployeeId(null);
      }
    }
  }, [currentPage]);
  const [editingFaltaId, setEditingFaltaId] = useState<string | null>(null)
  const [editingAtrasoId, setEditingAtrasoId] = useState<string | null>(null)
  const [editingQuebraId, setEditingQuebraId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [deleteBlockedModal, setDeleteBlockedModal] = useState<DeleteBlockedModalState | null>(null)

  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>(() => {
    const storedUnits = localStorage.getItem('businessUnits')
    if (storedUnits) {
      try {
        return JSON.parse(storedUnits) as BusinessUnit[]
      } catch {
        localStorage.removeItem('businessUnits')
      }
    }
    return []
  })

  const [editingBusinessUnitId, setEditingBusinessUnitId] = useState<string | null>(null)

  const [departments, setDepartments] = useState<Department[]>(() => {
    const storedDepartments = localStorage.getItem('departments')
    if (storedDepartments) {
      try {
        return JSON.parse(storedDepartments) as Department[]
      } catch {
        localStorage.removeItem('departments')
      }
    }
    return []
  })

  const [teams, setTeams] = useState<Team[]>(() => {
    const storedTeams = localStorage.getItem('teams')
    if (storedTeams) {
      try {
        return JSON.parse(storedTeams) as Team[]
      } catch {
        localStorage.removeItem('teams')
      }
    }
    return []
  })

  const [faltas, setFaltas] = useState<Falta[]>(() => {
    const storedFaltas = localStorage.getItem('faltas')
    if (storedFaltas) {
      try {
        return JSON.parse(storedFaltas) as Falta[]
      } catch {
        localStorage.removeItem('faltas')
      }
    }
    return []
  })

  const [atrasos, setAtrasos] = useState<Atraso[]>(() => {
    const stored = localStorage.getItem('atrasos')
    if (stored) {
      try {
        return JSON.parse(stored) as Atraso[]
      } catch {
        localStorage.removeItem('atrasos')
      }
    }
    return []
  })

  const [quebras, setQuebras] = useState<QuebraDeCaixa[]>(() => {
    const stored = localStorage.getItem('quebras')
    if (stored) {
      try {
        const arr = JSON.parse(stored) as any[]
        // migrate old objects with motivo field
        return arr.map(item => ({
          ...item,
          formaPagamento: item.formaPagamento || item.motivo || '',
          valor: item.valor || '',
          tipo: item.tipo || '',
          comprovantes: item.comprovantes || item.comprovante || 0,
          desconto: item.desconto || 0,
          observacao: item.observacao || ''
        })) as QuebraDeCaixa[]
      } catch {
        localStorage.removeItem('quebras')
      }
    }
    return []
  })

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)

  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null)

  const [beneficios, setBeneficios] = useState<Beneficio[]>(() => {
    const stored = localStorage.getItem('beneficios')
    if (stored) {
      try {
        return JSON.parse(stored) as Beneficio[]
      } catch {
        localStorage.removeItem('beneficios')
      }
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees))
  }, [employees])

  useEffect(() => {
    localStorage.setItem('positions', JSON.stringify(positions))
  }, [positions])

  useEffect(() => {
    localStorage.setItem('businessUnits', JSON.stringify(businessUnits))
  }, [businessUnits])

  useEffect(() => {
    localStorage.setItem('departments', JSON.stringify(departments))
  }, [departments])

  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams))
  }, [teams])

  useEffect(() => {
    localStorage.setItem('faltas', JSON.stringify(faltas))
  }, [faltas])

  useEffect(() => {
    localStorage.setItem('atrasos', JSON.stringify(atrasos))
  }, [atrasos])

  useEffect(() => {
    localStorage.setItem('quebras', JSON.stringify(quebras))
  }, [quebras])

  useEffect(() => {
    localStorage.setItem('beneficios', JSON.stringify(beneficios))
  }, [beneficios])

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage)

    const currentState = window.history.state
    const shouldReplace = !currentState || currentState.page !== currentPage
    if (shouldReplace) {
      window.history.pushState({ page: currentPage }, '', `#${currentPage}`)
    }
  }, [currentPage])

  useEffect(() => {
    const resetScrollToTop = () => {
      const appScrollArea = document.querySelector<HTMLElement>('.app-scroll-area')
      appScrollArea?.scrollTo({ top: 0, behavior: 'auto' })
      window.scrollTo({ top: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    const frame = window.requestAnimationFrame(resetScrollToTop)
    const dashboardTimer =
      currentPage === 'dashboard'
        ? window.setTimeout(resetScrollToTop, 220)
        : null

    return () => {
      window.cancelAnimationFrame(frame)
      if (dashboardTimer !== null) {
        window.clearTimeout(dashboardTimer)
      }
    }
  }, [currentPage, activeTab])

  useEffect(() => {
    const onStorage = () => {
      const newPage = localStorage.getItem('currentPage');
      if (newPage && newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    };
    window.addEventListener('storage', onStorage);

    const onPopState = (event: PopStateEvent) => {
      const page = event.state?.page as string | undefined
      if (page && page !== currentPage) {
        setCurrentPage(page)
      }
    }
    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('popstate', onPopState)
    }
  }, [currentPage]);

  useEffect(() => {
    if (!loggedUser) return

    if (!canAccessPage(currentPage, loggedUser.perfil, profilePermissions)) {
      const fallbackPage = getFirstAllowedPage(loggedUser.perfil, profilePermissions)
      setCurrentPage(fallbackPage)
    }
  }, [currentPage, loggedUser, profilePermissions])

  useEffect(() => {
    if (!loggedUser) {
      hasRenderedPageRef.current = false
      setShowRoutePulse(false)
      return
    }

    if (!hasRenderedPageRef.current) {
      hasRenderedPageRef.current = true
      return
    }

    const frame = window.requestAnimationFrame(() => setShowRoutePulse(true))
    const timer = window.setTimeout(() => setShowRoutePulse(false), 450)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [currentPage, loggedUser])

  useEffect(() => {
    const updateConnectionState = () => {
      setConnectionState(readConnectionState())
    }

    updateConnectionState()

    const connection = (navigator as Navigator & {
      connection?: {
        addEventListener?: (type: string, listener: () => void) => void
        removeEventListener?: (type: string, listener: () => void) => void
      }
    }).connection

    window.addEventListener('online', updateConnectionState)
    window.addEventListener('offline', updateConnectionState)
    connection?.addEventListener?.('change', updateConnectionState)

    return () => {
      window.removeEventListener('online', updateConnectionState)
      window.removeEventListener('offline', updateConnectionState)
      connection?.removeEventListener?.('change', updateConnectionState)
    }
  }, [])

  const handleNavigate = (route: string) => {
        if (route === 'resumo-turno') {
          setCurrentPage('resumo-turno');
          return;
        }
    if (route.startsWith('editar-turno-')) {
      const codigo = route.replace('editar-turno-', '');
      setEditingShiftCode(codigo);
      setCurrentPage('editar-turno');
      return;
    }
    if (route === 'Calendário') {
      setCurrentPage('calendario')
      return
    }
    if (route === 'dashboard') {
      setCurrentPage('dashboard')
      return
    }
    if (route.startsWith('perfil-funcionario-')) {
      setCurrentPage(route)
      return
    }
    if (route === 'lancamento-licenca') {
      // Resetar seleção e estado ao entrar na tela de novo lançamento
      localStorage.removeItem('licencaSelecionada');
      localStorage.removeItem('licencaShowAll');
      localStorage.removeItem('tipoLancamento');
      setCurrentPage('lancamento-licenca')
      return
    }
    if (route === 'Funcionários ativos' || route === 'Funcionários' || route === 'funcionarios-ativos') {
      setCurrentPage('funcionarios-ativos')
      return
    }
    if (route === 'Gestores') {
      setCurrentPage('equipes')
      localStorage.setItem('teamsActiveTab', 'gestores')
      return
    }
    if (route === 'Aniversariantes') {
      setCurrentPage('aniversariantes')
      return
    }
    if (route === 'Demitidos') {
      setCurrentPage('demitidos')
      return
    }
    if (route === 'Departamentos' || route === 'departamentos') {
      setCurrentPage('departamentos')
      return
    }
    if (route === 'Equipes' || route === 'equipes') {
      setCurrentPage('equipes')
      return
    }
    if (route === 'cadastro-departamento') {
      setCurrentPage('cadastro-departamento')
      return
    }
    if (route === 'cadastro-equipe') {
      setCurrentPage('cadastro-equipe')
      return
    }
    if (route === 'Dados da empresa') {
      setCurrentPage('dados-empresa')
      return
    }
    if (route === 'Cargos' || route === 'cargos') {
      setCurrentPage('cargos')
      return
    }
    if (route === 'Turnos' || route === 'turnos') {
      setCurrentPage('turnos')
      return
    }
    if (route === 'Cadastro de turno' || route === 'cadastro-turno') {
      setCurrentPage('cadastro-turno')
      return
    }
    if (route === 'cadastro-cargo') {
      setCurrentPage('cadastro-cargo')
      return
    }
    if (route === 'Unidades de negócio' || route === 'unidades-negocio') {
      setCurrentPage('unidades-negocio')
      return
    }
    if (route === 'cadastro-unidade-negocio') {
      setCurrentPage('cadastro-unidade-negocio')
      return
    }
    if (route === 'cadastro-funcionario') {
      localStorage.removeItem('perfilFuncionarioId')
      localStorage.removeItem('editingEmployeeId')
      setEditingEmployeeId(null) // ensure form is blank when adding new
      setCurrentPage('cadastro-funcionario')
      return
    }
    if (route === 'ferias-e-afastamentos' || route === 'Férias e Afastamentos') {
      setCurrentPage('ferias-e-afastamentos')
      return
    }
    if (route === 'Faltas' || route === 'faltas') {
      setCurrentPage('faltas')
      return
    }
    if (route === 'adicionar-falta') {
      setCurrentPage('adicionar-falta')
      return
    }
    if (route.startsWith('editar-falta')) {
      setCurrentPage('editar-falta')
      const urlParams = new URLSearchParams(route.split('?')[1])
      setEditingFaltaId(urlParams.get('id'))
      return
    }
    if (route === 'Atrasos' || route === 'atrasos') {
      setCurrentPage('atrasos')
      return
    }
    if (route === 'adicionar-atraso') {
      setCurrentPage('adicionar-atraso')
      return
    }
    if (route.startsWith('editar-atraso')) {
      setCurrentPage('editar-atraso')
      const urlParams = new URLSearchParams(route.split('?')[1])
      setEditingAtrasoId(urlParams.get('id'))
      return
    }
    if (route === 'Quebra de caixa' || route === 'quebra-de-caixa') {
      setCurrentPage('quebra-de-caixa')
      return
    }
    if (route === 'Ceasa' || route === 'ceasa') {
      setCurrentPage('ceasa')
      return
    }
    if (route === 'ceasa-cadastro-fornecedor') {
      setCurrentPage('ceasa-cadastro-fornecedor')
      return
    }
    if (route === 'ceasa-adicionar-compra') {
      setCurrentPage('ceasa-adicionar-compra')
      return
    }
    if (route === 'adicionar-quebra-de-caixa') {
      setCurrentPage('adicionar-quebra-de-caixa')
      return
    }
    if (route.startsWith('editar-quebra-de-caixa')) {
      setCurrentPage('editar-quebra-de-caixa')
      const urlParams = new URLSearchParams(route.split('?')[1])
      setEditingQuebraId(urlParams.get('id'))
      return
    }
    if (route === 'Benefícios' || route === 'beneficios') {
      setCurrentPage('beneficios')
      return
    }
    if (route === 'Feriados' || route === 'feriados') {
      setCurrentPage('feriados')
      return
    }
    if (route === 'Usuários' || route === 'usuarios') {
      setCurrentPage('usuarios')
      return
    }
    if (route === 'Administradores' || route === 'administradores') {
      setCurrentPage('administradores')
      return
    }
    if (route === 'Permissões de perfil' || route === 'Permissoes de perfil' || route === 'permissoes-perfil') {
      setCurrentPage('permissoes-perfil')
      return
    }
    setCurrentPage('dashboard')
  }

  const showSuccessToast = (message: string) => {
    setToastMessage(message)
  }

  const showDeleteBlockedModal = (entityLabel: string, entityName: string, linkedEmployees: Employee[]) => {
    setDeleteBlockedModal({
      entityLabel,
      entityName,
      employees: linkedEmployees
    })
  }

  const upsertById = <T extends { id: string }>(items: T[], item: T) => {
    const existingIndex = items.findIndex((current) => current.id === item.id)
    if (existingIndex === -1) {
      return [...items, item]
    }

    const nextItems = [...items]
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      ...item
    }
    return nextItems
  }

  useEffect(() => {
    if (!toastMessage) return

    const timer = setTimeout(() => {
      setToastMessage(null)
    }, 3500)

    return () => clearTimeout(timer)
  }, [toastMessage])

  const handleAddEmployee = (employee: Employee) => {
    setEmployees((prevEmployees) => upsertById(prevEmployees, employee))
    showSuccessToast(`Funcionario "${employee.nomeCompleto}" cadastrado com sucesso.`)
    setCurrentPage('funcionarios-ativos')
  }

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees((prevEmployees) => {
      const employeeIndex = prevEmployees.findIndex(e => e.id === updatedEmployee.id)
      if (employeeIndex === -1) {
        return prevEmployees
      }

      const nextEmployees = [...prevEmployees]
      nextEmployees[employeeIndex] = {
        ...prevEmployees[employeeIndex],
        ...updatedEmployee
      }

      return nextEmployees
    })
    setEditingEmployeeId(null)
    // Não redireciona ao editar perfil, só ao cadastrar novo funcionário
  }

  const handleDeleteEmployee = (id: string) => {
    const employeeToDelete = employees.find(e => e.id === id)
    setEmployees((prevEmployees) => prevEmployees.filter(e => e.id !== id))
    showSuccessToast(
      employeeToDelete
        ? `Funcionario "${employeeToDelete.nomeCompleto}" excluido com sucesso.`
        : 'Funcionario excluido com sucesso.'
    )
  }

  const handleEditEmployee = (id: string) => {
    setEditingEmployeeId(id)
    setCurrentPage('cadastro-funcionario')
  }

  const handleAddPosition = (position: Position) => {
    setPositions((prevPositions) => upsertById(prevPositions, position))
    showSuccessToast(`Cargo "${position.nome}" cadastrado com sucesso.`)
  }

  const handleUpdatePosition = (updatedPosition: Position) => {
    setPositions((prevPositions) => 
      prevPositions.map(p => p.id === updatedPosition.id ? updatedPosition : p)
    )
  }

  const handleEditPosition = (id: string) => {
    setEditingPositionId(id)
    setCurrentPage('cadastro-cargo')
  }

  const handleDeletePosition = (id: string) => {
    const positionToDelete = positions.find(p => p.id === id)

    if (positionToDelete) {
      const linkedEmployees = employees.filter(e => e.cargo === positionToDelete.nome)
      if (linkedEmployees.length > 0) {
        showDeleteBlockedModal('cargo', positionToDelete.nome, linkedEmployees)
        return
      }
    }

    setPositions((prevPositions) => prevPositions.filter(p => p.id !== id))
    showSuccessToast(
      positionToDelete
        ? `Cargo "${positionToDelete.nome}" excluido com sucesso.`
        : 'Cargo excluido com sucesso.'
    )
  }

  const handleAddBusinessUnit = (unit: BusinessUnit) => {
    setBusinessUnits((prevUnits) => upsertById(prevUnits, unit))
    showSuccessToast(`Loja "${unit.nomeUnidade}" cadastrada com sucesso.`)
  }

  const handleUpdateBusinessUnit = (updatedUnit: BusinessUnit) => {
    setBusinessUnits((prevUnits) => 
      prevUnits.map(u => u.id === updatedUnit.id ? updatedUnit : u)
    )
  }

  const handleEditBusinessUnit = (id: string) => {
    setEditingBusinessUnitId(id)
    setCurrentPage('cadastro-unidade-negocio')
  }

  const handleDeleteBusinessUnit = (id: string) => {
    const unitToDelete = businessUnits.find(u => u.id === id)

    if (unitToDelete) {
      const linkedEmployees = employees.filter(e => e.loja === unitToDelete.nomeUnidade)
      if (linkedEmployees.length > 0) {
        showDeleteBlockedModal('loja', unitToDelete.nomeUnidade, linkedEmployees)
        return
      }
    }

    setBusinessUnits((prevUnits) => prevUnits.filter(u => u.id !== id))
    showSuccessToast(
      unitToDelete
        ? `Loja "${unitToDelete.nomeUnidade}" excluida com sucesso.`
        : 'Loja excluida com sucesso.'
    )
  }

  const handleAddDepartment = (department: Department) => {
    setDepartments((prevDepartments) => upsertById(prevDepartments, department))
    showSuccessToast(`Departamento "${department.nome}" cadastrado com sucesso.`)
  }

  const handleUpdateDepartment = (updatedDepartment: Department) => {
    setDepartments((prevDepartments) => 
      prevDepartments.map(d => d.id === updatedDepartment.id ? updatedDepartment : d)
    )
  }

  const handleEditDepartment = (id: string) => {
    setEditingDepartmentId(id)
    setCurrentPage('cadastro-departamento')
  }

  const handleDeleteDepartment = (id: string) => {
    const departmentToDelete = departments.find(d => d.id === id)

    if (departmentToDelete) {
      const teamNamesInDepartment = new Set(
        teams
          .filter(t => t.departamentoNome === departmentToDelete.nome)
          .map(t => t.nome)
      )

      const linkedEmployees = employees.filter(e => teamNamesInDepartment.has(e.equipe))
      if (linkedEmployees.length > 0) {
        showDeleteBlockedModal('departamento', departmentToDelete.nome, linkedEmployees)
        return
      }
    }

    setDepartments((prevDepartments) => prevDepartments.filter(d => d.id !== id))
    showSuccessToast(
      departmentToDelete
        ? `Departamento "${departmentToDelete.nome}" excluido com sucesso.`
        : 'Departamento excluido com sucesso.'
    )
  }

  const positionsWithCounts = positions.map((position) => ({
    ...position,
    totalFuncionarios: employees.filter((e) => e.cargo === position.nome).length
  }))

  const syncEmployeesWithTeam = (previousTeam: Team | null, nextTeam: Team) => {
    const previousEmployeeIds = new Set(previousTeam?.employeeIds || [])
    const nextEmployeeIds = new Set(nextTeam.employeeIds || [])

    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) => {
        const wasLinkedToTeam = previousEmployeeIds.has(employee.id) || (previousTeam ? employee.equipe === previousTeam.nome : false)
        const isLinkedToTeam = nextEmployeeIds.has(employee.id)

        if (isLinkedToTeam) {
          return { ...employee, equipe: nextTeam.nome }
        }

        if (wasLinkedToTeam) {
          return { ...employee, equipe: '' }
        }

        return employee
      })
    )
  }

  const handleAddTeam = (team: Team) => {
    syncEmployeesWithTeam(null, team)
    setTeams((prevTeams) => upsertById(prevTeams, team))
    showSuccessToast(`Equipe "${team.nome}" cadastrada com sucesso.`)
    setCurrentPage('equipes')
  }

  const handleUpdateTeam = (updatedTeam: Team) => {
    const previousTeam = teams.find((team) => team.id === updatedTeam.id) || null

    syncEmployeesWithTeam(previousTeam, updatedTeam)
    setTeams((prevTeams) =>
      prevTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t)
    )
    setEditingTeamId(null)
    setCurrentPage('equipes')
  }

  const handleDeleteTeam = (id: string) => {
    const teamToDelete = teams.find(t => t.id === id);

    if (teamToDelete) {
      const linkedEmployeeIds = new Set(teamToDelete.employeeIds || [])
      const linkedEmployees = employees.filter((employee) =>
        linkedEmployeeIds.has(employee.id) || employee.equipe === teamToDelete.nome
      )

      if (linkedEmployees.length > 0) {
        showDeleteBlockedModal('equipe', teamToDelete.nome, linkedEmployees)
        return
      }
    }

    setTeams((prevTeams) => prevTeams.filter(t => t.id !== id));
    showSuccessToast(
      teamToDelete
        ? `Equipe "${teamToDelete.nome}" excluida com sucesso.`
        : 'Equipe excluida com sucesso.'
    )
  }

  // ...existing code...

  // Sincronizar histórico de afastamentos/licenças (FeriasEAfastamentos)
  const licencaSyncInitializedRef = React.useRef(false);
  const knownLancamentosLicencaRef = React.useRef<Set<string>>(new Set());

  const getLancamentoLicencaKey = (lanc: any) => {
    if (lanc?.id) return String(lanc.id);
    const nome = lanc?.employeeName || lanc?.nome || lanc?.colaboradorNome || lanc?.funcionarioNome || lanc?.nomeColaborador || lanc?.nomeFuncionario || '';
    const tipo = lanc?.tipoLicenca || 'Licença';
    const inicio = lanc?.dataInicio || '';
    const termino = lanc?.dataTermino || '';
    return `${nome}-${tipo}-${inicio}-${termino}`;
  };

  useEffect(() => {
    // Sempre que houver alteração nos lançamentos de licença, registrar apenas novos lançamentos.
    const lancamentosRaw = localStorage.getItem('lancamentosLicenca');
    let lancamentos: any[] = [];
    if (lancamentosRaw) {
      try {
        lancamentos = JSON.parse(lancamentosRaw);
      } catch { lancamentos = []; }
    }

    const currentKeys = new Set(lancamentos.map(getLancamentoLicencaKey));
    if (!licencaSyncInitializedRef.current) {
      knownLancamentosLicencaRef.current = currentKeys;
      licencaSyncInitializedRef.current = true;
      return;
    }

    const novosLancamentos = lancamentos.filter(
      (lanc) => !knownLancamentosLicencaRef.current.has(getLancamentoLicencaKey(lanc))
    );

    // Registrar apenas os novos lançamentos detectados.
    lancamentos.forEach((lanc: any) => {
      const lancKey = getLancamentoLicencaKey(lanc);
      if (!novosLancamentos.some((novo) => getLancamentoLicencaKey(novo) === lancKey)) return;

      const periodo = lanc.dataTermino && lanc.dataTermino !== lanc.dataInicio
        ? `${lanc.dataInicio} a ${lanc.dataTermino}`
        : lanc.dataInicio;
      const nomeFuncionario = lanc.employeeName || lanc.nome || lanc.colaboradorNome || lanc.funcionarioNome || lanc.nomeColaborador || lanc.nomeFuncionario || lanc.nome || '';
      registrarHistoricoLicenca({
        entryId: `licenca-cad-${lancKey}`,
        acao: `Cadastrou ${lanc.tipoLicenca || 'Licença'}`,
        usuario: loggedUser?.nome,
        funcionarioNome: nomeFuncionario ? `para ${nomeFuncionario}` : '',
        tipoLicenca: lanc.tipoLicenca || 'Licença',
        dataInicio: lanc.dataInicio,
        dataTermino: lanc.dataTermino,
        detalhes: lanc.observacao ? `Obs: ${lanc.observacao}` : undefined,
        setHistoryEntries,
      });
    });

    knownLancamentosLicencaRef.current = currentKeys;
  }, [localStorage.getItem('lancamentosLicenca')]);

  const handleEditTeam = (id: string) => {
    setEditingTeamId(id)
    setCurrentPage('cadastro-equipe')
  }

  const handleAddFalta = (falta: Falta) => {
    setFaltas((prevFaltas) => upsertById(prevFaltas, falta));
    setHistoryEntries((prev) => [
      {
        id: 'falta-' + falta.id,
        usuario: loggedUser?.nome || 'Usuário',
        acao: 'Adicionou falta',
        alvo: falta.funcionarioNome ? `para ${falta.funcionarioNome.replace(/^para /, '')}` : '',
        tipo: 'falta',
        dataRegistro: new Date().toISOString(),
        dataEvento: falta.data,
        detalhes: falta.motivo ? `Motivo: ${falta.motivo}` : undefined,
      },
      ...prev
    ]);
    showSuccessToast('Registro de falta cadastrado com sucesso.');
    setCurrentPage('faltas');
  };

  const handleDeleteFalta = (id: string) => {
    const faltaToDelete = faltas.find(f => f.id === id);
    setFaltas((prev) => prev.filter(f => f.id !== id));
    if (faltaToDelete) {
      setHistoryEntries((prev) => [
        {
          id: 'falta-del-' + faltaToDelete.id,
          usuario: loggedUser?.nome || 'Usuário',
          acao: 'Excluiu falta',
          alvo: faltaToDelete.funcionarioNome ? `para ${faltaToDelete.funcionarioNome.replace(/^para /, '')}` : '',
          tipo: 'falta',
          dataRegistro: new Date().toISOString(),
          dataEvento: faltaToDelete.data,
          detalhes: faltaToDelete.motivo ? `Motivo: ${faltaToDelete.motivo}` : undefined,
        },
        ...prev
      ]);
    }
    showSuccessToast(
      faltaToDelete
        ? `Falta de "${faltaToDelete.funcionarioNome}" excluida com sucesso.`
        : 'Falta excluida com sucesso.'
    );
  };

  const handleUpdateFalta = (updatedFalta: Falta) => {
    setFaltas((prevFaltas) =>
      prevFaltas.map(f => f.id === updatedFalta.id ? updatedFalta : f)
    )
    setHistoryEntries((prev) => [
      {
        id: 'falta-upd-' + updatedFalta.id + '-' + Date.now(),
        usuario: loggedUser?.nome || 'Usuário',
        acao: 'Editou falta',
        alvo: updatedFalta.funcionarioNome ? `para ${updatedFalta.funcionarioNome.replace(/^para /, '')}` : '',
        tipo: 'falta',
        dataRegistro: new Date().toISOString(),
        dataEvento: updatedFalta.data,
        detalhes: updatedFalta.motivo ? `Motivo: ${updatedFalta.motivo}` : undefined,
      },
      ...prev
    ])
    setEditingFaltaId(null)
    setCurrentPage('faltas')
  }

  const handleAddAtraso = (atraso: Atraso) => {
    setAtrasos((prev) => upsertById(prev, atraso));
    setHistoryEntries((prev) => [
      {
        id: 'atraso-' + atraso.id,
        usuario: loggedUser?.nome || 'Usuário',
        acao: 'Adicionou atraso',
        alvo: atraso.funcionarioNome ? `para ${atraso.funcionarioNome.replace(/^para /, '')}` : '',
        tipo: 'atraso',
        dataRegistro: new Date().toISOString(),
        dataEvento: atraso.data,
        detalhes: atraso.motivo ? `Motivo: ${atraso.motivo}` : undefined,
      },
      ...prev
    ]);
    showSuccessToast('Registro de atraso cadastrado com sucesso.');
    setCurrentPage('atrasos');
  };

  const handleDeleteAtraso = (id: string) => {
    const atrasoToDelete = atrasos.find(a => a.id === id);
    setAtrasos((prev) => prev.filter(a => a.id !== id));
    if (atrasoToDelete) {
      setHistoryEntries((prev) => [
        {
          id: 'atraso-del-' + atrasoToDelete.id,
          usuario: loggedUser?.nome || 'Usuário',
          acao: 'Excluiu atraso',
          alvo: atrasoToDelete.funcionarioNome ? `para ${atrasoToDelete.funcionarioNome.replace(/^para /, '')}` : '',
          tipo: 'atraso',
          dataRegistro: new Date().toISOString(),
          dataEvento: atrasoToDelete.data,
          detalhes: atrasoToDelete.motivo ? `Motivo: ${atrasoToDelete.motivo}` : undefined,
        },
        ...prev
      ]);
    }
    showSuccessToast(
      atrasoToDelete
        ? `Atraso de "${atrasoToDelete.funcionarioNome}" excluido com sucesso.`
        : 'Atraso excluido com sucesso.'
    );
  };

  const handleUpdateAtraso = (updated: Atraso) => {
    setAtrasos((prev) =>
      prev.map(a => a.id === updated.id ? updated : a)
    )
    setHistoryEntries((prev) => [
      {
        id: 'atraso-upd-' + updated.id + '-' + Date.now(),
        usuario: loggedUser?.nome || 'Usuário',
        acao: 'Editou atraso',
        alvo: updated.funcionarioNome ? `para ${updated.funcionarioNome.replace(/^para /, '')}` : '',
        tipo: 'atraso',
        dataRegistro: new Date().toISOString(),
        dataEvento: updated.data,
        detalhes: updated.motivo ? `Motivo: ${updated.motivo}` : undefined,
      },
      ...prev
    ])
    setEditingAtrasoId(null)
    setCurrentPage('atrasos')
  }

  const handleAddQuebra = (quebra: QuebraDeCaixa) => {
    setQuebras((prev) => upsertById(prev, quebra));
    setHistoryEntries((prev) => [
      {
        id: 'quebra-' + quebra.id,
        usuario: loggedUser?.nome || 'Usuário',
        acao: 'Adicionou quebra de caixa',
        alvo: quebra.funcionarioNome ? `para ${quebra.funcionarioNome.replace(/^para /, '')}` : '',
        tipo: 'outro',
        dataRegistro: new Date().toISOString(),
        dataEvento: quebra.data,
        detalhes: quebra.formaPagamento ? `Forma de pagamento: ${quebra.formaPagamento}` : undefined,
      },
      ...prev
    ]);
    showSuccessToast('Registro de quebra de caixa cadastrado com sucesso.');
    setCurrentPage('quebra-de-caixa');
  };

  const handleDeleteQuebra = (id: string) => {
    const quebraToDelete = quebras.find(q => q.id === id);
    setQuebras((prev) => prev.filter(q => q.id !== id));
    if (quebraToDelete) {
      setHistoryEntries((prev) => [
        {
          id: 'quebra-del-' + quebraToDelete.id,
          usuario: loggedUser?.nome || 'Usuário',
          acao: 'Excluiu quebra de caixa',
          alvo: quebraToDelete.funcionarioNome ? `para ${quebraToDelete.funcionarioNome.replace(/^para /, '')}` : '',
          tipo: 'outro',
          dataRegistro: new Date().toISOString(),
          dataEvento: quebraToDelete.data,
          detalhes: quebraToDelete.formaPagamento ? `Forma de pagamento: ${quebraToDelete.formaPagamento}` : undefined,
        },
        ...prev
      ]);
    }
    showSuccessToast(
      quebraToDelete
        ? `Quebra de caixa de "${quebraToDelete.funcionarioNome}" excluida com sucesso.`
        : 'Quebra de caixa excluida com sucesso.'
    );
  };

  const handleUpdateQuebra = (updated: QuebraDeCaixa) => {
    setQuebras((prev) =>
      prev.map(q => q.id === updated.id ? updated : q)
    )
    setHistoryEntries((prev) => [
      {
        id: 'quebra-upd-' + updated.id + '-' + Date.now(),
        usuario: loggedUser?.nome || 'Usuário',
        acao: 'Editou quebra de caixa',
        alvo: updated.funcionarioNome ? `para ${updated.funcionarioNome.replace(/^para /, '')}` : '',
        tipo: 'outro',
        dataRegistro: new Date().toISOString(),
        dataEvento: updated.data,
        detalhes: updated.formaPagamento ? `Forma de pagamento: ${updated.formaPagamento}` : undefined,
      },
      ...prev
    ])
    setEditingQuebraId(null)
    setCurrentPage('quebra-de-caixa')
  }

  const handleAddBeneficio = (beneficio: Beneficio) => {
    setBeneficios((prev) => upsertById(prev, beneficio))
    showSuccessToast(`Benefício "${beneficio.nome}" cadastrado com sucesso.`)
  }

  const handleUpdateBeneficio = (updated: Beneficio) => {
    setBeneficios((prev) => prev.map(b => b.id === updated.id ? updated : b))
    showSuccessToast(`Benefício "${updated.nome}" atualizado com sucesso.`)
  }

  const handleDeleteBeneficio = (id: string) => {
    const item = beneficios.find(b => b.id === id)
    setBeneficios((prev) => prev.filter(b => b.id !== id))
    showSuccessToast(
      item ? `Benefício "${item.nome}" excluído com sucesso.` : 'Benefício excluído com sucesso.'
    )
  }

  const handleToggleBeneficio = (id: string) => {
    setBeneficios((prev) =>
      prev.map(b => b.id === id ? { ...b, ativo: !b.ativo } : b)
    )
  }

  const handleGlobalEnterNavigation = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.key !== 'Enter') return

    const target = event.target as HTMLElement | null
    if (!target) return

    if (target instanceof HTMLTextAreaElement) return
    if (target instanceof HTMLButtonElement) return

    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return

    if (target instanceof HTMLInputElement) {
      const blockedTypes = new Set(['button', 'submit', 'reset', 'checkbox', 'radio', 'file'])
      if (blockedTypes.has(target.type)) return
    }

    const root = target.closest('form, [role="dialog"], main, body') ?? document
    const focusableElements = Array.from(
      root.querySelectorAll<HTMLElement>(
        'input:not([disabled]):not([type="hidden"]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      if (element === target) return true
      return element.offsetParent !== null
    })

    const currentIndex = focusableElements.indexOf(target)
    if (currentIndex === -1) return

    const next = focusableElements.slice(currentIndex + 1).find((element) => !element.hasAttribute('disabled'))
    if (!next) return

    event.preventDefault()
    setTimeout(() => next.focus(), 0)
  }

  if (!loggedUser) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50" onKeyDownCapture={handleGlobalEnterNavigation}>
      <SystemMotionFeedback showRoutePulse={showRoutePulse} connectionState={connectionState} />
      {deleteBlockedModal && (
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
                    Nao foi possivel excluir o(a) {deleteBlockedModal.entityLabel} "{deleteBlockedModal.entityName}" porque ha funcionario(s) vinculado(s).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteBlockedModal(null)}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fechar"
              >
                Fechar
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="mb-3 text-sm font-medium text-gray-800">
                Funcionarios vinculados ({deleteBlockedModal.employees.length})
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
                    {deleteBlockedModal.employees.map((employee) => (
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

      {toastMessage && (
        <div className="fixed right-5 top-5 z-[90] w-full max-w-sm animate-fadeIn">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-green-800">Operacao concluida</p>
                <p className="text-sm text-green-700">{toastMessage}</p>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="rounded p-1 text-green-700 hover:bg-green-100"
                aria-label="Fechar notificacao"
              >
                X
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
        canAccessRoute={canAccessRouteForCurrentUser}
      />
      
      <div className="app-scroll-area h-screen overflow-y-auto">
        <Header 
          onMenuClick={() => setMenuOpen(!menuOpen)} 
          loggedUser={loggedUser} 
          onLogout={handleLogout}
          onUpdateLoggedUser={handleUpdateLoggedUser}
          onLogoClick={() => handleNavigate('dashboard')}
        />

        {/* Dashboard com Navigation fixa e conteúdo com transição */}
        {currentPage === 'dashboard' && (
          <>
            <div className="w-full bg-white border-b shadow-sm z-20 sticky top-0 left-0">
              <div className="container mx-auto px-4">
                <div className="flex justify-center gap-8 border-b">
                  <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
              </div>
            </div>

            <SwitchTransition mode="out-in">
              <CSSTransition
                key={activeTab}
                timeout={180}
                classNames="dashboard-tab"
                unmountOnExit
              >
                <div className="page-transition-wrapper container mx-auto px-4 py-8">
                  {/* Promo Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <PromoCards />
                  </div>

                  {/* Status, Tasks e Histórico */}
                  <div>
                    {activeTab === 'controle' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StatusCard />
                        <PendingTasks />
                      </div>
                    )}
                    {activeTab === 'historico' && (
                      <div className="mt-6">
                        <HistoryList entries={historyEntries} onClearHistory={limparHistorico} />
                      </div>
                    )}
                  </div>
                </div>
              </CSSTransition>
            </SwitchTransition>
          </>
        )}

        <SwitchTransition mode="out-in">
          <CSSTransition
            key={currentPage}
            timeout={220}
            classNames="page-transition"
            unmountOnExit
          >
            <div className="page-transition-wrapper">
              {currentPage === 'funcionarios-ativos' && (
                <ActiveEmployees 
                  onNavigate={handleNavigate} 
                  employees={employees}
                  onDeleteEmployee={handleDeleteEmployee}
                  onEditEmployee={handleEditEmployee}
                />
              )}
              {/* Perfil do funcionário */}
              {currentPage.startsWith('perfil-funcionario-') && (() => {
                const id = currentPage.replace('perfil-funcionario-', '');
                const funcionario = employees.find(e => e.id === id) || null;
                return <PerfilFuncionario key={funcionario?.id ?? 'perfil-funcionario'} funcionario={funcionario} onUpdateEmployee={handleUpdateEmployee} onDismissEmployee={handleDismissEmployee} />;
              })()}
              {currentPage === 'ferias-e-afastamentos' && (
                <FeriasEAfastamentos onNovoLancamento={() => setCurrentPage('lancamento-licenca')} />
              )}
              {currentPage === 'lancamento-licenca' && (
                <LancamentoLicenca />
              )}
              {currentPage === 'lancamento-individual-ou-massa' && (
                <LancamentoIndividualOuMassa />
              )}
              {currentPage === 'lancamento-individual' && (
                <LancamentoIndividual onSuccess={showSuccessToast} />
              )}
              {currentPage === 'lancamento-massa' && (
                <LancamentoIndividual mode="massa" onSuccess={showSuccessToast} />
              )}
              {currentPage === 'calendario' && (
                <Calendar />
              )}
        {currentPage === 'cadastro-funcionario' && (
          <EmployeeRegistration 
            onNavigate={handleNavigate} 
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            editingEmployee={editingEmployeeId ? employees.find(e => e.id === editingEmployeeId) || null : null}
            businessUnits={businessUnits}
            employees={employees}
          />
        )}
        {currentPage === 'aniversariantes' && <Birthdays employees={employees} />}
        {currentPage === 'demitidos' && <DismissedEmployees employees={dismissedEmployees} />}
        {currentPage === 'departamentos' && <Departments onNavigate={handleNavigate} departments={departments} onDeleteDepartment={handleDeleteDepartment} onEditDepartment={handleEditDepartment} />}
        {currentPage === 'equipes' && (
          <Teams 
            onNavigate={handleNavigate} 
            teams={teams}
            employees={employees}
            onViewTeam={handleViewTeam}
            onEditTeam={handleEditTeam}
            onDeleteTeam={handleDeleteTeam}
            initialTab={(() => {
              const tab = localStorage.getItem('teamsActiveTab');
              return tab === 'gestores' || tab === 'gerenciar' ? tab : undefined;
            })()}
          />
        )}
        {currentPage === 'visualizar-equipe' && viewingTeamId && (
          <TeamView
            team={teams.find(t => t.id === viewingTeamId)}
            employees={employees}
            departments={departments}
            businessUnits={businessUnits}
            onBack={() => handleNavigate('equipes')}
          />
        )}
        {currentPage === 'cadastro-departamento' && (
          <DepartmentCreate 
            onNavigate={(route) => {
              setEditingDepartmentId(null)
              handleNavigate(route)
            }} 
            businessUnits={businessUnits}
            onAddDepartment={handleAddDepartment}
            onUpdateDepartment={handleUpdateDepartment}
            editingDepartment={editingDepartmentId ? departments.find(d => d.id === editingDepartmentId) : undefined}
          />
        )}
        {currentPage === 'dados-empresa' && <CompanyData />}
        {currentPage === 'cargos' && <Positions positions={positionsWithCounts} onNavigate={handleNavigate} onDeletePosition={handleDeletePosition} onEditPosition={handleEditPosition} />}
        {currentPage === 'cadastro-cargo' && (
          <PositionCreate 
            onNavigate={(route) => {
              setEditingPositionId(null)
              handleNavigate(route)
            }} 
            onAddPosition={handleAddPosition}
            onUpdatePosition={handleUpdatePosition}
            editingPosition={editingPositionId ? positions.find(p => p.id === editingPositionId) : undefined}
            positions={positions}
          />
        )}
        {currentPage === 'unidades-negocio' && (
          <BusinessUnits 
            businessUnits={businessUnits} 
            employees={employees}
            onNavigate={handleNavigate} 
            onDeleteBusinessUnit={handleDeleteBusinessUnit} 
            onEditBusinessUnit={handleEditBusinessUnit} 
          />
        )}
        {currentPage === 'cadastro-unidade-negocio' && (
          <BusinessUnitCreate 
            onNavigate={(route) => {
              setEditingBusinessUnitId(null)
              handleNavigate(route)
            }} 
            onAddBusinessUnit={handleAddBusinessUnit}
            onUpdateBusinessUnit={handleUpdateBusinessUnit}
            editingBusinessUnit={editingBusinessUnitId ? businessUnits.find(u => u.id === editingBusinessUnitId) : undefined}
          />
        )}
        {currentPage === 'turnos' && (
          <Shifts onNavigate={handleNavigate} />
        )}
        {currentPage === 'cadastro-turno' && (
          <ShiftRegistration onNavigate={handleNavigate} />
        )}
        {currentPage === 'editar-turno' && (
          <ShiftRegistration
            onNavigate={handleNavigate}
            editingShift={editingShiftCode ? (JSON.parse(localStorage.getItem('turnos') || '[]').find((t:any) => t.codigo === editingShiftCode) || null) : null}
          />
        )}
        {currentPage === 'resumo-turno' && (
          <div className="bg-white rounded-lg shadow p-8 max-w-6xl mx-auto mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Resumo do Turno</h2>
            <p className="text-gray-600">Você pulou a etapa de horários porque o turno não é fixo.</p>
          </div>
        )}
        {currentPage === 'cadastro-equipe' && (
          <TeamCreate 
            onNavigate={(route) => {
              setEditingTeamId(null)
              handleNavigate(route)
            }}
            departments={departments}
            businessUnits={businessUnits}
            employees={employees}
            onAddTeam={handleAddTeam}
            onUpdateTeam={handleUpdateTeam}
            editingTeam={editingTeamId ? teams.find(t => t.id === editingTeamId) || null : null}
          />
        )}
        {currentPage === 'faltas' && (
          <Faltas 
            employees={employees}
            faltas={faltas}
            positions={positions}
            departments={departments}
            teams={teams}
            businessUnits={businessUnits}
            onNavigate={handleNavigate}
            onDeleteFalta={handleDeleteFalta}
          />
        )}
        {currentPage === 'adicionar-falta' && (
          <AdicionarFalta
            onNavigate={handleNavigate}
            onAddFalta={handleAddFalta}
            employees={employees}
          />
        )}
        {currentPage === 'editar-falta' && (
          <AdicionarFalta
            onNavigate={handleNavigate}
            onAddFalta={handleAddFalta}
            onUpdateFalta={handleUpdateFalta}
            employees={employees}
            editingFalta={editingFaltaId ? faltas.find(f => f.id === editingFaltaId) || null : null}
          />
        )}
        {currentPage === 'atrasos' && (
          <Atrasos
            employees={employees}
            atrasos={atrasos}
            positions={positions}
            departments={departments}
            teams={teams}
            businessUnits={businessUnits}
            onNavigate={handleNavigate}
            onDeleteAtraso={handleDeleteAtraso}
          />
        )}
        {currentPage === 'adicionar-atraso' && (
          <AdicionarAtraso
            onNavigate={handleNavigate}
            onAddAtraso={handleAddAtraso}
            employees={employees}
          />
        )}
        {currentPage === 'editar-atraso' && (
          <AdicionarAtraso
            onNavigate={handleNavigate}
            onAddAtraso={handleAddAtraso}
            onUpdateAtraso={handleUpdateAtraso}
            employees={employees}
            editingAtraso={editingAtrasoId ? atrasos.find(a => a.id === editingAtrasoId) || null : null}
          />
        )}
        {currentPage === 'quebra-de-caixa' && (
          <QuebraDeCaixa
            employees={employees}
            quebras={quebras}
            positions={positions}
            departments={departments}
            teams={teams}
            businessUnits={businessUnits}
            onNavigate={handleNavigate}
            onDeleteQuebra={handleDeleteQuebra}
          />
        )}
        {currentPage === 'ceasa' && (
          <CeasaAnalytics
            businessUnits={businessUnits}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'ceasa-cadastro-fornecedor' && (
          <CeasaSupplierCreate onNavigate={handleNavigate} />
        )}
        {currentPage === 'ceasa-adicionar-compra' && (
          <CeasaPurchaseCreate
            onNavigate={handleNavigate}
            businessUnits={businessUnits}
          />
        )}
        {currentPage === 'adicionar-quebra-de-caixa' && (
          <AdicionarQuebraDeCaixa
            onNavigate={handleNavigate}
            onAddQuebra={handleAddQuebra}
            employees={employees}
          />
        )}
        {currentPage === 'editar-quebra-de-caixa' && (
          <AdicionarQuebraDeCaixa
            onNavigate={handleNavigate}
            onAddQuebra={handleAddQuebra}
            onUpdateQuebra={handleUpdateQuebra}
            employees={employees}
            editingQuebra={editingQuebraId ? quebras.find(q => q.id === editingQuebraId) || null : null}
          />
        )}
        {currentPage === 'beneficios' && (
          <Beneficios
            beneficios={beneficios}
            onAddBeneficio={handleAddBeneficio}
            onUpdateBeneficio={handleUpdateBeneficio}
            onDeleteBeneficio={handleDeleteBeneficio}
          />
        )}
        {currentPage === 'feriados' && (
          <Feriados />
        )}
        {currentPage === 'usuarios' && (
          <Usuarios mode="usuarios" loggedUser={loggedUser as LoggedUser | null} setLoggedUser={setLoggedUser as (user: LoggedUser) => void} />
        )}
        {currentPage === 'administradores' && (
          <Administradores loggedUser={loggedUser as LoggedUser | null} setLoggedUser={setLoggedUser as (user: LoggedUser) => void} />
        )}
        {currentPage === 'permissoes-perfil' && loggedUser?.perfil === 'admin' && (
          <PermissoesPerfis
            permissions={profilePermissions}
            onSave={handleSaveProfilePermissions}
          />
        )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    {/* Estilos da transição */}
    <style>{`
      .page-transition-enter {
        opacity: 0;
        transform: translate3d(0, 10px, 0) scale(0.995);
      }
      .page-transition-enter-active {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
        transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1), transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .page-transition-exit {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }
      .page-transition-exit-active {
        opacity: 0;
        transform: translate3d(0, -8px, 0) scale(0.995);
        transition: opacity 180ms ease, transform 180ms ease;
      }
      .dashboard-tab-enter {
        opacity: 0;
        transform: translate3d(0, 8px, 0);
      }
      .dashboard-tab-enter-active {
        opacity: 1;
        transform: translate3d(0, 0, 0);
        transition: opacity 180ms ease, transform 180ms ease;
      }
      .dashboard-tab-exit {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }
      .dashboard-tab-exit-active {
        opacity: 0;
        transform: translate3d(0, -6px, 0);
        transition: opacity 150ms ease, transform 150ms ease;
      }
    `}</style>
    </div>
  )
}

export default App
