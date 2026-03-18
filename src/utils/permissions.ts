import type { SistemaUsuario } from '../App'

export type Perfil = SistemaUsuario['perfil']

export type PermissionKey =
  | 'dashboard'
  | 'calendario'
  | 'funcionarios'
  | 'aniversariantes'
  | 'demitidos'
  | 'departamentos'
  | 'cargos'
  | 'equipes'
  | 'turnos'
  | 'espelho_ponto'
  | 'historico_ponto'
  | 'folha_pagamento'
  | 'regras_ponto'
  | 'ferias_afastamentos'
  | 'faltas'
  | 'atrasos'
  | 'quebra_caixa'
  | 'ceasa'
  | 'relatorio_geral'
  | 'relatorio_faltas'
  | 'relatorio_ferias_afastamentos'
  | 'relatorio_quebra_caixa'
  | 'relatorio_ceasa'
  | 'beneficios'
  | 'feriados'
  | 'dados_empresa'
  | 'lojas'
  | 'configuracoes'
  | 'usuarios'
  | 'administradores'
  | 'permissoes_perfil'

export type ProfilePermissions = Record<Perfil, Record<PermissionKey, boolean>>

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  dashboard: 'Dashboard',
  calendario: 'Calendario',
  funcionarios: 'Funcionarios',
  aniversariantes: 'Aniversariantes',
  demitidos: 'Demitidos',
  departamentos: 'Departamentos',
  cargos: 'Cargos',
  equipes: 'Equipes',
  turnos: 'Turnos',
  espelho_ponto: 'Espelho de ponto',
  historico_ponto: 'Historico de ponto',
  folha_pagamento: 'Folha de pagamento',
  regras_ponto: 'Regras do ponto',
  ferias_afastamentos: 'Ferias e Afastamentos',
  faltas: 'Faltas',
  atrasos: 'Atrasos',
  quebra_caixa: 'Quebra de caixa',
  ceasa: 'Ceasa',
  relatorio_geral: 'Relatorio geral',
  relatorio_faltas: 'Relatorio de faltas',
  relatorio_ferias_afastamentos: 'Relatorio de ferias e afastamentos',
  relatorio_quebra_caixa: 'Relatorio de quebra de caixa',
  relatorio_ceasa: 'Relatorio de Ceasa',
  beneficios: 'Beneficios',
  feriados: 'Feriados',
  dados_empresa: 'Dados da empresa',
  lojas: 'Lojas',
  configuracoes: 'Configuracoes',
  usuarios: 'Usuarios',
  administradores: 'Administradores',
  permissoes_perfil: 'Permissoes por perfil',
}

export const PERMISSION_GROUPS: Array<{ title: string; keys: PermissionKey[] }> = [
  {
    title: 'Visao Geral',
    keys: ['dashboard', 'calendario'],
  },
  {
    title: 'Departamento Pessoal',
    keys: ['funcionarios', 'aniversariantes', 'demitidos', 'departamentos', 'cargos', 'equipes', 'turnos'],
  },
  {
    title: 'Controle de Jornada',
    keys: ['espelho_ponto', 'historico_ponto', 'folha_pagamento', 'regras_ponto'],
  },
  {
    title: 'Lancamentos Operacionais',
    keys: ['ferias_afastamentos', 'faltas', 'atrasos', 'quebra_caixa', 'ceasa'],
  },
  {
    title: 'Relatorios',
    keys: ['relatorio_geral', 'relatorio_faltas', 'relatorio_ferias_afastamentos', 'relatorio_quebra_caixa', 'relatorio_ceasa'],
  },
  {
    title: 'Beneficios',
    keys: ['beneficios', 'feriados'],
  },
  {
    title: 'Administrativo',
    keys: ['dados_empresa', 'lojas', 'configuracoes', 'usuarios', 'administradores', 'permissoes_perfil'],
  },
]

export const DEFAULT_PROFILE_PERMISSIONS: ProfilePermissions = {
  admin: {
    dashboard: true,
    calendario: true,
    funcionarios: true,
    aniversariantes: true,
    demitidos: true,
    departamentos: true,
    cargos: true,
    equipes: true,
    turnos: true,
    espelho_ponto: true,
    historico_ponto: true,
    folha_pagamento: true,
    regras_ponto: true,
    ferias_afastamentos: true,
    faltas: true,
    atrasos: true,
    quebra_caixa: true,
    ceasa: true,
    relatorio_geral: true,
    relatorio_faltas: true,
    relatorio_ferias_afastamentos: true,
    relatorio_quebra_caixa: true,
    relatorio_ceasa: true,
    beneficios: true,
    feriados: true,
    dados_empresa: true,
    lojas: true,
    configuracoes: true,
    usuarios: true,
    administradores: true,
    permissoes_perfil: true,
  },
  rh: {
    dashboard: true,
    calendario: true,
    funcionarios: true,
    aniversariantes: true,
    demitidos: true,
    departamentos: true,
    cargos: true,
    equipes: true,
    turnos: true,
    espelho_ponto: true,
    historico_ponto: true,
    folha_pagamento: true,
    regras_ponto: true,
    ferias_afastamentos: true,
    faltas: true,
    atrasos: true,
    quebra_caixa: true,
    ceasa: false,
    relatorio_geral: true,
    relatorio_faltas: true,
    relatorio_ferias_afastamentos: true,
    relatorio_quebra_caixa: true,
    relatorio_ceasa: false,
    beneficios: true,
    feriados: true,
    dados_empresa: true,
    lojas: true,
    configuracoes: true,
    usuarios: true,
    administradores: false,
    permissoes_perfil: false,
  },
  gestor: {
    dashboard: true,
    calendario: true,
    funcionarios: true,
    aniversariantes: true,
    demitidos: true,
    departamentos: false,
    cargos: false,
    equipes: true,
    turnos: false,
    espelho_ponto: false,
    historico_ponto: false,
    folha_pagamento: false,
    regras_ponto: false,
    ferias_afastamentos: true,
    faltas: true,
    atrasos: true,
    quebra_caixa: true,
    ceasa: true,
    relatorio_geral: false,
    relatorio_faltas: false,
    relatorio_ferias_afastamentos: false,
    relatorio_quebra_caixa: false,
    relatorio_ceasa: false,
    beneficios: true,
    feriados: true,
    dados_empresa: false,
    lojas: false,
    configuracoes: false,
    usuarios: false,
    administradores: false,
    permissoes_perfil: false,
  },
  colaborador: {
    dashboard: true,
    calendario: true,
    funcionarios: false,
    aniversariantes: false,
    demitidos: false,
    departamentos: false,
    cargos: false,
    equipes: false,
    turnos: false,
    espelho_ponto: false,
    historico_ponto: false,
    folha_pagamento: false,
    regras_ponto: false,
    ferias_afastamentos: false,
    faltas: false,
    atrasos: false,
    quebra_caixa: false,
    ceasa: false,
    relatorio_geral: false,
    relatorio_faltas: false,
    relatorio_ferias_afastamentos: false,
    relatorio_quebra_caixa: false,
    relatorio_ceasa: false,
    beneficios: true,
    feriados: true,
    dados_empresa: false,
    lojas: false,
    configuracoes: false,
    usuarios: false,
    administradores: false,
    permissoes_perfil: false,
  },
}

export const PERMISSIONS_STORAGE_KEY = 'sistema_permissoes_perfil'

export function mergeWithDefaults(input: Partial<ProfilePermissions> | null | undefined): ProfilePermissions {
  const next: ProfilePermissions = JSON.parse(JSON.stringify(DEFAULT_PROFILE_PERMISSIONS))
  if (!input) return next

  const perfis: Perfil[] = ['admin', 'rh', 'gestor', 'colaborador']
  for (const perfil of perfis) {
    const incoming = input[perfil]
    if (!incoming) continue

    for (const key of Object.keys(DEFAULT_PROFILE_PERMISSIONS[perfil]) as PermissionKey[]) {
      const value = incoming[key]
      if (typeof value === 'boolean') {
        next[perfil][key] = value
      }
    }
  }

  // Regras fixas: admin sempre possui estas permissoes
  next.admin.administradores = true
  next.admin.permissoes_perfil = true

  return next
}

export function loadProfilePermissions(): ProfilePermissions {
  const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY)
  if (!stored) return mergeWithDefaults(null)

  try {
    return mergeWithDefaults(JSON.parse(stored) as Partial<ProfilePermissions>)
  } catch {
    return mergeWithDefaults(null)
  }
}

export function saveProfilePermissions(permissions: ProfilePermissions): void {
  const normalized = mergeWithDefaults(permissions)
  localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(normalized))
}

export function getRoutePermissionKey(page: string): PermissionKey | null {
  const routeMap: Record<string, PermissionKey> = {
    Dashboard: 'dashboard',
    dashboard: 'dashboard',
    Calendário: 'calendario',
    calendario: 'calendario',

    Funcionários: 'funcionarios',
    'funcionarios-ativos': 'funcionarios',
    'cadastro-funcionario': 'funcionarios',
    Aniversariantes: 'aniversariantes',
    aniversariantes: 'aniversariantes',
    Demitidos: 'demitidos',
    demitidos: 'demitidos',

    departamentos: 'departamentos',
    'cadastro-departamento': 'departamentos',

    cargos: 'cargos',
    'cadastro-cargo': 'cargos',

    equipes: 'equipes',
    'cadastro-equipe': 'equipes',
    'visualizar-equipe': 'equipes',

    turnos: 'turnos',
    'espelho-de-ponto': 'espelho_ponto',
    'historico-de-ponto': 'historico_ponto',
    'folha-de-pagamento': 'folha_pagamento',
    'regras-do-ponto': 'regras_ponto',
    'cadastro-turno': 'turnos',
    'editar-turno': 'turnos',
    'resumo-turno': 'turnos',

    'ferias-e-afastamentos': 'ferias_afastamentos',
    'lancamento-licenca': 'ferias_afastamentos',
    'lancamento-individual-ou-massa': 'ferias_afastamentos',
    'lancamento-individual': 'ferias_afastamentos',
    faltas: 'faltas',
    'adicionar-falta': 'faltas',
    'editar-falta': 'faltas',
    atrasos: 'atrasos',
    'adicionar-atraso': 'atrasos',
    'editar-atraso': 'atrasos',
    'quebra-de-caixa': 'quebra_caixa',
    'adicionar-quebra-de-caixa': 'quebra_caixa',
    'editar-quebra-de-caixa': 'quebra_caixa',

    ceasa: 'ceasa',
    'ceasa-cadastro-fornecedor': 'ceasa',
    'ceasa-adicionar-compra': 'ceasa',
    'relatorio-geral': 'relatorio_geral',
    'relatorio-faltas': 'relatorio_faltas',
    'relatorio-ferias-e-afastamentos': 'relatorio_ferias_afastamentos',
    'relatorio-quebra-de-caixa': 'relatorio_quebra_caixa',
    'relatorio-ceasa': 'relatorio_ceasa',

    beneficios: 'beneficios',
    feriados: 'feriados',

    'Dados da empresa': 'dados_empresa',
    'dados-empresa': 'dados_empresa',
    'unidades-negocio': 'lojas',
    'cadastro-unidade-negocio': 'lojas',
    configuracoes: 'configuracoes',

    usuarios: 'usuarios',
    administradores: 'administradores',
    'permissoes-perfil': 'permissoes_perfil',
  }

  return routeMap[page] ?? null
}

export function canAccessPage(page: string, perfil: Perfil, permissions: ProfilePermissions): boolean {
  if (perfil === 'admin') return true

  const key = getRoutePermissionKey(page)
  if (!key) return true

  if (key === 'permissoes_perfil') {
    return false
  }

  return Boolean(permissions[perfil]?.[key])
}

export function getFirstAllowedPage(perfil: Perfil, permissions: ProfilePermissions): string {
  const preferredPages = [
    'dashboard',
    'calendario',
    'funcionarios-ativos',
    'ferias-e-afastamentos',
    'beneficios',
  ]

  for (const page of preferredPages) {
    if (canAccessPage(page, perfil, permissions)) return page
  }

  return 'dashboard'
}
