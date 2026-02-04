import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import LancamentoLicenca from './pages/LancamentoLicenca'
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
import Teams from './pages/Teams'
import TeamCreate from './pages/TeamCreate'
import FeriasEAfastamentos from './pages/FeriasEAfastamentos'
import BusinessUnitCreate from './pages/BusinessUnitCreate'
import Shifts from './pages/Shifts'
import ShiftRegistration from './pages/ShiftRegistration'

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
  totalFuncionarios: number;
  totalGestores: number;
  criadoEm: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('controle')
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<string>(() => {
    return localStorage.getItem('currentPage') || 'dashboard';
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
    localStorage.setItem('currentPage', currentPage)
  }, [currentPage])

  const handleNavigate = (route: string) => {
    if (route === 'dashboard') {
      setCurrentPage('dashboard')
      return
    }
    if (route === 'lancamento-licenca') {
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
    setTeams((prevTeams) => prevTeams.filter(t => t.id !== id))
  }

  const handleViewTeam = (id: string) => {
    setEditingTeamId(id)
    setCurrentPage('cadastro-equipe')
  }

  const handleEditTeam = (id: string) => {
    setEditingTeamId(id)
    setCurrentPage('cadastro-equipe')
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
        {currentPage === 'ferias-e-afastamentos' && (
          <FeriasEAfastamentos onNovoLancamento={() => setCurrentPage('lancamento-licenca')} />
        )}
        {currentPage === 'lancamento-licenca' && (
          <LancamentoLicenca />
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
            initialTab={localStorage.getItem('teamsActiveTab') || undefined}
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
      </div>
    </div>
  )
}

export default App
