// ...existing code...
import React, { useEffect, useState } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import Header from './components/Header'
import Calendar from './pages/Calendar'
import LancamentoLicenca from './pages/LancamentoLicenca'
import LancamentoIndividualOuMassa from './pages/LancamentoIndividualOuMassa'
import Navigation from './components/Navigation'
import PromoCards from './components/PromoCards'
import StatusCard from './components/StatusCard'
import PendingTasks from './components/PendingTasks'
import Sidebar from './components/Sidebar'
import ActiveEmployees from './pages/ActiveEmployees'
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
  unidadeNegocio: string;
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

function App() {
    const [viewingTeamId, setViewingTeamId] = useState<string | null>(null);
    const handleViewTeam = (id: string) => {
      setViewingTeamId(id);
      setCurrentPage('visualizar-equipe');
    };
  const [activeTab, setActiveTab] = useState('controle')
  const [editingShiftCode, setEditingShiftCode] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const storedPage = localStorage.getItem('currentPage');
    return storedPage || 'dashboard';
  });
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
  const [editingFaltaId, setEditingFaltaId] = useState<string | null>(null)

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

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)

  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null)

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
    localStorage.setItem('currentPage', currentPage)
    console.log('App currentPage:', currentPage)
  }, [currentPage])

  // Atualiza a tela ao mudar currentPage via localStorage
  useEffect(() => {
    const onStorage = () => {
      const newPage = localStorage.getItem('currentPage');
      if (newPage && newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [currentPage]);

  const handleNavigate = (route: string) => {
        if (route === 'resumo-turno') {
          setCurrentPage('resumo-turno');
          return;
        }
    console.log('App handleNavigate:', route)
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
    if (route === 'lancamento-licenca') {
      // Resetar seleção e estado ao entrar na tela de novo lançamento
      localStorage.removeItem('licencaSelecionada');
      localStorage.removeItem('licencaShowAll');
      localStorage.removeItem('tipoLancamento');
      setCurrentPage('lancamento-licenca')
      return
    }
    if (route === 'Funcionários ativos' || route === 'Funcionários') {
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
    setCurrentPage('dashboard')
  }

  const handleAddEmployee = (employee: Employee) => {
    setEmployees((prevEmployees) => [...prevEmployees, employee])
    setCurrentPage('funcionarios-ativos')
  }

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees((prevEmployees) => 
      prevEmployees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e)
    )
    setEditingEmployeeId(null)
    setCurrentPage('funcionarios-ativos')
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prevEmployees) => prevEmployees.filter(e => e.id !== id))
  }

  const handleEditEmployee = (id: string) => {
    setEditingEmployeeId(id)
    setCurrentPage('cadastro-funcionario')
  }

  const handleAddPosition = (position: Position) => {
    setPositions((prevPositions) => [...prevPositions, position])
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
    setPositions((prevPositions) => prevPositions.filter(p => p.id !== id))
  }

  const handleAddBusinessUnit = (unit: BusinessUnit) => {
    setBusinessUnits((prevUnits) => [...prevUnits, unit])
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
    setBusinessUnits((prevUnits) => prevUnits.filter(u => u.id !== id))
  }

  const handleAddDepartment = (department: Department) => {
    setDepartments((prevDepartments) => [...prevDepartments, department])
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
    setDepartments((prevDepartments) => prevDepartments.filter(d => d.id !== id))
  }

  const positionsWithCounts = positions.map((position) => ({
    ...position,
    totalFuncionarios: employees.filter((e) => e.cargo === position.nome).length
  }))

  const handleAddTeam = (team: Team) => {
    setTeams((prevTeams) => [...prevTeams, team])
    setCurrentPage('equipes')
  }

  const handleUpdateTeam = (updatedTeam: Team) => {
    setTeams((prevTeams) =>
      prevTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t)
    )
    setEditingTeamId(null)
    setCurrentPage('equipes')
  }

  const handleDeleteTeam = (id: string) => {
    // Limpar campo equipe dos funcionários
    const teamToDelete = teams.find(t => t.id === id);
    if (teamToDelete) {
      setEmployees((prevEmployees) => prevEmployees.map(e =>
        e.equipe === teamToDelete.nome ? { ...e, equipe: '' } : e
      ));
    }
    setTeams((prevTeams) => prevTeams.filter(t => t.id !== id));
  }

  // ...existing code...

  const handleEditTeam = (id: string) => {
    setEditingTeamId(id)
    setCurrentPage('cadastro-equipe')
  }

  const handleAddFalta = (falta: Falta) => {
    setFaltas((prevFaltas) => [...prevFaltas, falta])
    setCurrentPage('faltas')
  }

  const handleUpdateFalta = (updatedFalta: Falta) => {
    setFaltas((prevFaltas) =>
      prevFaltas.map(f => f.id === updatedFalta.id ? updatedFalta : f)
    )
    setEditingFaltaId(null)
    setCurrentPage('faltas')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavigate}
      />
      
      <div>
        <Header onMenuClick={() => setMenuOpen(!menuOpen)} />
        
        {currentPage === 'dashboard' && (
          <div className="container mx-auto px-4 py-8">
            {/* Navigation Tabs */}
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Promo Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PromoCards />
            </div>

            {/* Status and Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusCard />
              <PendingTasks />
            </div>
          </div>
        )}

        {currentPage === 'funcionarios-ativos' && (
          <ActiveEmployees 
            onNavigate={handleNavigate} 
            employees={employees}
            onDeleteEmployee={handleDeleteEmployee}
            onEditEmployee={handleEditEmployee}
          />
        )}
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={currentPage}
            timeout={400}
            classNames="fade-slide"
          >
            <div>
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
                <LancamentoIndividual />
              )}
            </div>
          </CSSTransition>
                </SwitchTransition>
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
          />
        )}
        {currentPage === 'aniversariantes' && <Birthdays employees={employees} />}
        {currentPage === 'demitidos' && <DismissedEmployees />}
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
            onNavigate={handleNavigate}
            onDeleteFalta={(id) => setFaltas((prev) => prev.filter(f => f.id !== id))}
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
      </div>
    {/* Estilos da transição */}
    <style>{`
      .fade-slide-enter {
        opacity: 0;
        transform: translateY(30px);
      }
      .fade-slide-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 400ms, transform 400ms;
      }
      .fade-slide-exit {
        opacity: 1;
        transform: translateY(0);
      }
      .fade-slide-exit-active {
        opacity: 0;
        transform: translateY(-30px);
        transition: opacity 400ms, transform 400ms;
      }
    `}</style>
    </div>
  )
}

export default App
