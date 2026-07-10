import React, { useState, useEffect, useRef } from 'react';

import { formatCPF, formatDateTime, formatPIS, focusNext, handleKeyDown } from '../utils/formatters';
import { Employee, Position, Team, BusinessUnit } from '../App';
import Select from '../components/Select';
import DatePicker from '../components/DatePicker';
import { Search } from 'lucide-react';

interface EmployeeRegistrationProps {
  onNavigate?: (route: string) => void;
  onAddEmployee?: (employee: Employee) => void;
  onUpdateEmployee?: (employee: Employee) => void;
  editingEmployee?: Employee | null;
  businessUnits?: BusinessUnit[];
  employees?: Employee[];
}

const ensureCurrentOption = (
  options: { label: string; value: string }[],
  currentValue: string,
  currentLabel = currentValue
) => {
  if (!currentValue || options.some((option) => option.value === currentValue)) {
    return options;
  }

  return [...options, { label: currentLabel, value: currentValue }];
};

const EmployeeRegistration: React.FC<EmployeeRegistrationProps> = ({ 
  onNavigate, 
  onAddEmployee,
  onUpdateEmployee,
  editingEmployee,
  businessUnits = [],
  employees = []
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Refs para navegação entre inputs
  const matriculaRef = useRef<HTMLInputElement>(null);
  const nomeRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const cpfRef = useRef<HTMLInputElement>(null);
  const generoRef = useRef<HTMLButtonElement>(null);
  const dataNascimentoRef = useRef<HTMLInputElement>(null);
  const cltRef = useRef<HTMLButtonElement>(null);
  const pisRef = useRef<HTMLInputElement>(null);
  const nextStepButtonRef = useRef<HTMLButtonElement>(null);
  const dataAdmissaoRef = useRef<HTMLInputElement>(null);
  const lojaRef = useRef<HTMLButtonElement>(null);
  const equipeRef = useRef<HTMLButtonElement>(null);
  const cargoRef = useRef<HTMLButtonElement>(null);
  const turnoRef = useRef<HTMLButtonElement>(null);
  const criarDiasRef = useRef<HTMLInputElement>(null);
  const finishButtonRef = useRef<HTMLButtonElement>(null);
  
  const [formData, setFormData] = useState({
    matricula: '',
    nomeCompleto: '',
    email: '',
    cpf: '',
    genero: '',
    dataNascimento: '',
    isCLT: '',
    pis: '',
    dataAdmissao: '',
    equipe: '',
    cargo: '',
    turno: '',
    criarDiasApartirDe: '03/02/2026',
    loja: ''
  });

  const [cargoOptions, setCargoOptions] = useState<{ label: string; value: string }[]>([
    { label: 'Selecione', value: '' }
  ]);

  const [teamOptions, setTeamOptions] = useState<{ label: string; value: string }[]>([
    { label: 'Selecione', value: '' }
  ]);

  const [turnoOptions, setTurnoOptions] = useState<{ label: string; value: string }[]>([
    { label: 'Selecione', value: '' }
  ]);

  const [lojaOptions, setLojaOptions] = useState<{ label: string; value: string }[]>([
    { label: 'Selecione', value: '' }
  ]);

  // Carregar turnos cadastrados
  useEffect(() => {
    let nextOptions = [{ label: 'Selecione', value: '' }];
    const storedTurnos = localStorage.getItem('turnos');
    if (storedTurnos) {
      try {
        const turnos = JSON.parse(storedTurnos);
        nextOptions = [
          { label: 'Selecione', value: '' },
          ...turnos.map((t) => ({ label: t.nome, value: t.nome }))
        ];
      } catch {
        localStorage.removeItem('turnos');
      }
    }

    setTurnoOptions(ensureCurrentOption(nextOptions, editingEmployee?.turno || ''));
  }, [editingEmployee]);

  // atualizar lista de lojas sempre que businessUnits mudar
  useEffect(() => {
    const nextOptions = [{ label: 'Selecione', value: '' }];
    const optionValues = new Set<string>();

    const companyDataStr = localStorage.getItem('companyData');
    if (companyDataStr) {
      try {
        const companyData = JSON.parse(companyDataStr);
        const companyName = companyData.nomeEmpresa || companyData.razaoSocial || 'Empresa Principal';

        if (companyName && !optionValues.has(companyName)) {
          optionValues.add(companyName);
          nextOptions.push({ label: companyName, value: companyName });
        }
      } catch {}
    }

    businessUnits.forEach((unit) => {
      if (!unit.nomeUnidade || optionValues.has(unit.nomeUnidade)) {
        return;
      }

      optionValues.add(unit.nomeUnidade);
      nextOptions.push({ label: unit.nomeUnidade, value: unit.nomeUnidade });
    });

    setLojaOptions(ensureCurrentOption(nextOptions, editingEmployee?.loja || ''));
  }, [businessUnits, editingEmployee]);

  // Carregar dados do funcionário em edição ou gerar matrícula ao criar novo
  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        matricula: editingEmployee.matricula,
        nomeCompleto: editingEmployee.nomeCompleto,
        email: editingEmployee.email,
        cpf: editingEmployee.cpf,
        genero: editingEmployee.genero || '',
        dataNascimento: editingEmployee.dataNascimento || '',
        isCLT: editingEmployee.isCLT || '',
        pis: editingEmployee.pis || '',
        dataAdmissao: editingEmployee.dataAdmissao || '03/02/2026',
        equipe: editingEmployee.equipe || '',
        cargo: editingEmployee.cargo || '',
        turno: editingEmployee.turno || '',
        criarDiasApartirDe: editingEmployee.criarDiasApartirDe || '03/02/2026',
        loja: editingEmployee.loja || ''
      });
      setCurrentStep(1);
      setErrors((prev) => ({
        ...prev,
        nomeCompleto: false,
        email: false,
        cpf: false,
        genero: false,
        dataNascimento: false,
        isCLT: false,
        dataAdmissao: false,
        equipe: false,
        cargo: false,
        turno: false,
        criarDiasApartirDe: false,
        loja: false
      }));
    } else {
      // new record: auto-generate sequential matricula and clear form
      const next = employees.length + 1;
      setFormData({
        matricula: String(next).padStart(2, '0'),
        nomeCompleto: '',
        email: '',
        cpf: '',
        genero: '',
        dataNascimento: '',
        isCLT: '',
        pis: '',
        dataAdmissao: '03/02/2026',
        equipe: '',
        cargo: '',
        turno: '',
        criarDiasApartirDe: '03/02/2026',
        loja: ''
      });
      setCurrentStep(1);
      setErrors((prev) => ({
        ...prev,
        nomeCompleto: false,
        email: false,
        cpf: false,
        genero: false,
        dataNascimento: false,
        isCLT: false,
        dataAdmissao: false,
        equipe: false,
        cargo: false,
        turno: false,
        criarDiasApartirDe: false,
        loja: false
      }));
    }
  }, [editingEmployee, employees]);

  useEffect(() => {
    const storedPositions = localStorage.getItem('positions');
    let nextOptions = [{ label: 'Selecione', value: '' }];
    if (storedPositions) {
      try {
        const positions = JSON.parse(storedPositions) as Position[];
        nextOptions = [
          { label: 'Selecione', value: '' },
          ...positions.map((p) => ({ label: p.nome, value: p.nome }))
        ];
      } catch {
        localStorage.removeItem('positions');
      }
    }

    setCargoOptions(ensureCurrentOption(nextOptions, editingEmployee?.cargo || ''));
  }, [editingEmployee]);

  useEffect(() => {
    const storedTeams = localStorage.getItem('teams');
    let nextOptions = [{ label: 'Selecione', value: '' }];
    if (storedTeams) {
      try {
        const teams = JSON.parse(storedTeams) as Team[];
        nextOptions = [
          { label: 'Selecione', value: '' },
          ...teams.map((t) => ({ label: t.nome, value: t.nome }))
        ];
      } catch {
        localStorage.removeItem('teams');
      }
    }

    setTeamOptions(ensureCurrentOption(nextOptions, editingEmployee?.equipe || ''));
  }, [editingEmployee]);

  const [errors, setErrors] = useState<{
    nomeCompleto: boolean;
    email: boolean | string;
    cpf: boolean;
    genero: boolean;
    dataNascimento: boolean;
    isCLT: boolean;
    loja: boolean; // kept for UI but not validated
    dataAdmissao: boolean;
    equipe: boolean;
    cargo: boolean;
    turno: boolean;
    criarDiasApartirDe: boolean;
  }>({
    nomeCompleto: false,
    email: false,
    cpf: false,
    genero: false,
    dataNascimento: false,
    isCLT: false,
    loja: false,
    dataAdmissao: false,
    equipe: false,
    cargo: false,
    turno: false,
    criarDiasApartirDe: false
  });

  const handleNext = () => {
    if (currentStep === 1) {
      // Validação dos campos obrigatórios da etapa 1
      let emailError: boolean | string = false;
      if (!formData.email) {
        emailError = 'required';
      } else if (!formData.email.includes('@')) {
        emailError = 'invalid';
      }

      // apenas campos da etapa 1 devem ser verificados aqui;
      // os campos da etapa 2 já são validados em handleFinish
      const step1Errors = {
        nomeCompleto: !formData.nomeCompleto,
        email: emailError,
        cpf: !formData.cpf,
        genero: !formData.genero,
        dataNascimento: !formData.dataNascimento,
        isCLT: !formData.isCLT,
        loja: false // mantenho mas não conta para validação
      };

      // mescla com quaisquer erros já existentes de etapas posteriores
      setErrors((prev) => ({ ...prev, ...step1Errors }));

      if (Object.values(step1Errors).some(error => error)) {
        return;
      }
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = () => {
    // Validação dos campos obrigatórios da etapa 2
    const finishErrors = {
      dataAdmissao: !formData.dataAdmissao,
      loja: !formData.loja, // now required
      equipe: !formData.equipe,
      cargo: !formData.cargo,
      turno: !formData.turno,
      criarDiasApartirDe: !formData.criarDiasApartirDe
    };
    if (Object.values(finishErrors).some(error => error)) {
      setErrors((prev) => ({ ...prev, ...finishErrors }));
      return;
    }
    const now = new Date();
    const dateTime = formatDateTime(now);
    if (editingEmployee && onUpdateEmployee) {
      // Atualizar funcionário existente
      const updatedEmployee: Employee = {
        ...editingEmployee,
        matricula: formData.matricula,
        nomeCompleto: formData.nomeCompleto,
        email: formData.email,
        cpf: formData.cpf,
        genero: formData.genero,
        dataNascimento: formData.dataNascimento,
        isCLT: formData.isCLT,
        pis: formData.isCLT === 'sim' ? formData.pis : '',
        dataAdmissao: formData.dataAdmissao,
        equipe: formData.equipe,
        cargo: formData.cargo,
        turno: formData.turno,
        loja: formData.loja
      };
      onUpdateEmployee(updatedEmployee);
    } else if (onAddEmployee) {
      // Criar novo funcionário
      const newEmployee: Employee = {
        id: Date.now().toString(),
        matricula: formData.matricula,
        nomeCompleto: formData.nomeCompleto,
        email: formData.email,
        cpf: formData.cpf,
        genero: formData.genero,
        dataNascimento: formData.dataNascimento,
        isCLT: formData.isCLT,
        pis: formData.isCLT === 'sim' ? formData.pis : '',
        dataAdmissao: formData.dataAdmissao,
        equipe: formData.equipe,
        cargo: formData.cargo,
        turno: formData.turno,
        ultimoAcesso: dateTime,
        ultimoRegistro: dateTime,
        criarDiasApartirDe: formData.criarDiasApartirDe,
        loja: formData.loja
      };
      onAddEmployee(newEmployee);
    }
  };

  const handleCpfInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCPF(e.target.value);
    setFormData({...formData, cpf: value});
    setErrors({...errors, cpf: false});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {editingEmployee ? 'Editar funcionário' : 'Cadastro de funcionário'}
        </h1>
        
        {/* Steps Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            className={`flex items-center gap-3 px-6 py-3 rounded-lg focus:outline-none transition ${currentStep === 1 ? 'bg-white shadow' : 'bg-gray-200 cursor-pointer'}`}
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(1)}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 1 ? 'bg-gray-800 text-white' : 'bg-gray-400 text-gray-700'}`}>
              1
            </div>
            <span className="text-gray-900 font-medium">Dados cadastrais</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-3 px-6 py-3 rounded-lg focus:outline-none transition ${currentStep === 2 ? 'bg-white shadow' : 'bg-gray-200'} ${Boolean(formData.nomeCompleto) && Boolean(formData.email) && Boolean(formData.cpf) && Boolean(formData.genero) && Boolean(formData.dataNascimento) && Boolean(formData.isCLT) ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            disabled={currentStep === 2 || !(Boolean(formData.nomeCompleto) && Boolean(formData.email) && Boolean(formData.cpf) && Boolean(formData.genero) && Boolean(formData.dataNascimento) && Boolean(formData.isCLT))}
            onClick={() => {
              if (Boolean(formData.nomeCompleto) && Boolean(formData.email) && Boolean(formData.cpf) && Boolean(formData.genero) && Boolean(formData.dataNascimento) && Boolean(formData.isCLT)) {
                setCurrentStep(2)
              }
            }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep === 2 ? 'bg-gray-800 text-white' : 'bg-gray-400 text-gray-700'}`}>
              2
            </div>
            <span className="text-gray-900 font-medium">Jornada</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">1. Dados cadastrais</h2>
              <p className="text-gray-500 mb-8">Preencha os dados base para o cadastro</p>

              <div className="grid grid-cols-4 gap-6">
                {/* Código da matrícula */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Código da matrícula <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={matriculaRef}
                    type="text"
                    value={formData.matricula}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 cursor-not-allowed"
                  />
                </div>

                {/* Nome completo */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Nome completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nomeRef}
                    type="text"
                    placeholder="Digite"
                    value={formData.nomeCompleto}
                    onChange={(e) => {
                      setFormData({...formData, nomeCompleto: e.target.value});
                      setErrors({...errors, nomeCompleto: false});
                    }}
                    onKeyDown={(e) => handleKeyDown(e, emailRef)}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500"
                  />
                  {errors.nomeCompleto && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    placeholder="Digite"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      setErrors({...errors, email: false});
                    }}
                    onKeyDown={(e) => handleKeyDown(e, cpfRef)}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500"
                  />
                  {errors.email === 'required' && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                  {errors.email === 'invalid' && <p className="text-red-500 text-xs mt-1">O e-mail precisa ser válido</p>}
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    CPF <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={cpfRef}
                    type="text"
                    placeholder="Digite"
                    value={formData.cpf}
                    onChange={handleCpfInput}
                    onKeyDown={(e) => handleKeyDown(e, generoRef)}
                    maxLength={14}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500"
                  />
                  {errors.cpf && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {/* Gênero */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Gênero <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.genero}
                    onChange={(value) => {
                      setFormData({...formData, genero: String(value)});
                      setErrors({...errors, genero: false});
                    }}
                    buttonRef={generoRef}
                    nextRef={dataNascimentoRef}
                    options={[
                      { label: 'Selecione', value: '' },
                      { label: 'Masculino', value: 'masculino' },
                      { label: 'Feminino', value: 'feminino' },
                      { label: 'Outro', value: 'outro' }
                    ]}
                  />
                  {errors.genero && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {/* Data de nascimento */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Data de nascimento <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    ref={dataNascimentoRef}
                    value={formData.dataNascimento}
                    onChange={(value) => setFormData({...formData, dataNascimento: value})}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900"
                    openOnFocus
                    enterSelectsToday
                    nextRef={cltRef}
                    error={errors.dataNascimento}
                  />
                  {errors.dataNascimento && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {/* O funcionário é CLT? */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    O funcionário é CLT? <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.isCLT}
                    onChange={(value) => {
                      setFormData({...formData, isCLT: String(value)});
                      setErrors({...errors, isCLT: false});
                      if (String(value) === 'sim') {
                        focusNext(pisRef.current);
                      } else {
                        focusNext(nextStepButtonRef.current);
                      }
                    }}
                    buttonRef={cltRef}
                    options={[
                      { label: 'Selecione', value: '' },
                      { label: 'Sim', value: 'sim' },
                      { label: 'Não', value: 'nao' }
                    ]}
                  />
                  {errors.isCLT && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {formData.isCLT === 'sim' && (
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      PIS
                    </label>
                    <input
                      ref={pisRef}
                      type="text"
                      value={formData.pis}
                      onChange={(e) => {
                        // Permite digitação livre, aplica formatação apenas a números
                        const value = e.target.value;
                        const formatted = formatPIS(value);
                        setFormData({ ...formData, pis: formatted });
                      }}
                      onKeyDown={(e) => handleKeyDown(e, nextStepButtonRef)}
                      placeholder="Digite"
                      maxLength={14}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900"
                    />
                  </div>
                )}
              </div>

              {/* Botão Próximo */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => onNavigate?.('Funcionários ativos')}
                  className="bg-white border border-gray-300 text-gray-700 px-12 py-3 rounded font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  ref={nextStepButtonRef}
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-3 rounded font-medium"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">2. Jornada e Ponto</h2>
              <p className="text-gray-500 mb-8">Configure as informações relacionadas a jornada e marcação de ponto</p>

              <div className="grid grid-cols-4 gap-6">
                {/* Data de admissão */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Data de admissão <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    ref={dataAdmissaoRef}
                    value={formData.dataAdmissao}
                    onChange={(value) => setFormData({...formData, dataAdmissao: value})}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900"
                    enterSelectsToday
                    nextRef={lojaRef}
                  />
                  {errors.dataAdmissao && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {/* Loja do funcionário */}
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Loja <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.loja}
                    onChange={(value) => {
                      setFormData({...formData, loja: String(value)});
                      setErrors((prev) => ({ ...prev, loja: false }));
                    }}
                    buttonRef={lojaRef}
                    nextRef={equipeRef}
                    options={lojaOptions}
                  />
                  {errors.loja && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {/* Equipe */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 text-sm">
                      Equipe <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('cadastro-equipe')}
                      className="text-indigo-600 text-xs font-semibold hover:underline"
                    >
                      Cadastrar
                    </button>
                  </div>
                  <Select
                    value={formData.equipe}
                    onChange={(value) => setFormData({...formData, equipe: String(value)})}
                    buttonRef={equipeRef}
                    nextRef={cargoRef}
                    options={teamOptions}
                  />
                  {errors.equipe && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {/* Cargo */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 text-sm">
                      Cargo <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('cadastro-cargo')}
                      className="text-indigo-600 text-xs font-semibold hover:underline"
                    >
                      Cadastrar
                    </button>
                  </div>
                  <Select
                    value={formData.cargo}
                    onChange={(value) => setFormData({...formData, cargo: String(value)})}
                    buttonRef={cargoRef}
                    nextRef={turnoRef}
                    options={cargoOptions}
                  />
                  {errors.cargo && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {/* Turno */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-700 text-sm">
                      Turno <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('cadastro-turno')}
                      className="text-indigo-600 text-xs font-semibold hover:underline"
                    >
                      Cadastrar
                    </button>
                  </div>
                  <Select
                    value={formData.turno}
                    onChange={(value) => setFormData({...formData, turno: String(value)})}
                    buttonRef={turnoRef}
                    nextRef={criarDiasRef}
                    options={turnoOptions}
                  />
                  {errors.turno && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>

                {/* Criar dias no sistema a partir de */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <label className="block text-gray-700 text-sm">
                      Criar dias no sistema a partir de: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                        ⚠️ Atenção: Esta data não poderá ser modificada após criar o funcionário
                      </div>
                    </div>
                  </div>
                  <DatePicker
                    ref={criarDiasRef}
                    value={formData.criarDiasApartirDe || '03/02/2026'}
                    onChange={(value) => setFormData({...formData, criarDiasApartirDe: value})}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-900"
                    enterSelectsToday
                    nextRef={finishButtonRef}
                    disabled={!!editingEmployee}
                  />
                  {errors.criarDiasApartirDe && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório</p>}
                </div>
              </div>

              {/* Botões */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-white border border-gray-300 text-gray-700 px-12 py-3 rounded font-medium hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  ref={finishButtonRef}
                  onClick={handleFinish}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-3 rounded font-medium"
                >
                  Finalizar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
