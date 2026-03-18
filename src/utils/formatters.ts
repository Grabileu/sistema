// Formata PIS/PASEP: 000.00000.00-0
export const formatPIS = (value: string): string => {
  let numbers = value.replace(/\D/g, '');
  if (numbers.length > 3 && numbers.length <= 8) {
    numbers = numbers.slice(0, 3) + '.' + numbers.slice(3);
  } else if (numbers.length > 8 && numbers.length <= 10) {
    numbers = numbers.slice(0, 3) + '.' + numbers.slice(3, 8) + '.' + numbers.slice(8);
  } else if (numbers.length > 10) {
    numbers = numbers.slice(0, 3) + '.' + numbers.slice(3, 8) + '.' + numbers.slice(8, 10) + '-' + numbers.slice(10, 11);
  }
  return numbers;
};
// Funções de formatação para uso em todo o site

export const formatCPF = (value: string): string => {
  let numbers = value.replace(/\D/g, ''); // Remove tudo que não é número
  
  // Aplica a formatação: 000.000.000-00
  if (numbers.length > 3 && numbers.length <= 6) {
    numbers = numbers.slice(0, 3) + '.' + numbers.slice(3);
  } else if (numbers.length > 6 && numbers.length <= 9) {
    numbers = numbers.slice(0, 3) + '.' + numbers.slice(3, 6) + '.' + numbers.slice(6);
  } else if (numbers.length > 9) {
    numbers = numbers.slice(0, 3) + '.' + numbers.slice(3, 6) + '.' + numbers.slice(6, 9) + '-' + numbers.slice(9, 11);
  }
  
  return numbers;
};

export const formatCNPJ = (value: string): string => {
  let numbers = value.replace(/\D/g, ''); // Remove tudo que não é número
  
  // Aplica a formatação: 00.000.000/0000-00
  if (numbers.length > 2 && numbers.length <= 5) {
    numbers = numbers.slice(0, 2) + '.' + numbers.slice(2);
  } else if (numbers.length > 5 && numbers.length <= 8) {
    numbers = numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5);
  } else if (numbers.length > 8 && numbers.length <= 12) {
    numbers = numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5, 8) + '/' + numbers.slice(8);
  } else if (numbers.length > 12) {
    numbers = numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5, 8) + '/' + numbers.slice(8, 12) + '-' + numbers.slice(12, 14);
  }
  
  return numbers;
};

export const formatPhone = (value: string): string => {
  let numbers = value.replace(/\D/g, ''); // Remove tudo que não é número
  
  // Aplica a formatação: (00) 00000-0000 ou (00) 0000-0000
  if (numbers.length <= 10) {
    // Formato: (00) 0000-0000
    if (numbers.length > 2 && numbers.length <= 6) {
      numbers = '(' + numbers.slice(0, 2) + ') ' + numbers.slice(2);
    } else if (numbers.length > 6) {
      numbers = '(' + numbers.slice(0, 2) + ') ' + numbers.slice(2, 6) + '-' + numbers.slice(6, 10);
    } else if (numbers.length > 0) {
      numbers = '(' + numbers;
    }
  } else {
    // Formato: (00) 00000-0000
    numbers = '(' + numbers.slice(0, 2) + ') ' + numbers.slice(2, 7) + '-' + numbers.slice(7, 11);
  }
  
  return numbers;
};

export const formatDate = (value: string): string => {
  // Se já está no formato DD/MM/AAAA, retorna como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

  let numbers = value.replace(/\D/g, ''); // Remove tudo que não é número

  // Aplica a formatação: DD/MM/AAAA
  if (numbers.length > 2 && numbers.length <= 4) {
    numbers = numbers.slice(0, 2) + '/' + numbers.slice(2);
  } else if (numbers.length > 4) {
    numbers = numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
  }

  return numbers;
};

// ---------------------------------------------------------------------------
// Utilitários numéricos / financeiros
// ---------------------------------------------------------------------------

export const safeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim()
    const parsed = Number(normalized)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

export const toCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export const toPercent = (value: number): string => `${value.toFixed(2)}%`

// ---------------------------------------------------------------------------
// Utilitários de data
// ---------------------------------------------------------------------------

/** Normaliza data para DD/MM/AAAA. Aceita DD/MM/AAAA e AAAA-MM-DD. */
export const normalizeDate = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) return ''
  const raw = value.trim()
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-')
    return `${day}/${month}/${year}`
  }
  return raw
}

/** Converte string DD/MM/AAAA → Date (hora 00:00). Retorna null se inválida. */
export const parseDateBR = (value: string): Date | null => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null
  const [day, month, year] = value.split('/')
  const parsed = new Date(`${year}-${month}-${day}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

/**
 * Converte string de data para Date.
 * Formatos aceitos: DD/MM/AAAA, AAAA-MM-DD, ou qualquer formato válido do JS.
 */
export const parseDateString = (value: string): Date | null => {
  const raw = value.trim()
  if (!raw) return null

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split('/')
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getTime())) return date
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-')
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    if (!isNaN(date.getTime())) return date
  }

  const fallback = new Date(raw)
  if (!isNaN(fallback.getTime())) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate())
  }

  return null
}

// ---------------------------------------------------------------------------
// Opções de seleção reutilizáveis
// ---------------------------------------------------------------------------

/** Gera as opções de loja para um <Select>, com a unidade principal em destaque. */
export const buildStoreOptions = (
  businessUnits: Array<{ nomeUnidade?: string; nome?: string; unidadePrincipal?: boolean }>,
  companyData: { nomeEmpresa?: string; razaoSocial?: string } | null | undefined,
  firstLabel = 'Todas'
): Array<{ label: string; value: string }> => {
  const principalUnit = businessUnits.find((unit) => unit.unidadePrincipal)
  const principalStoreName = principalUnit
    ? principalUnit.nomeUnidade || principalUnit.nome || ''
    : companyData?.nomeEmpresa || companyData?.razaoSocial || ''

  const allStoreNames = new Set<string>()
  businessUnits.forEach((unit) => {
    const storeName = unit.nomeUnidade || unit.nome || ''
    if (storeName) allStoreNames.add(storeName)
  })

  const options: Array<{ label: string; value: string }> = [{ label: firstLabel, value: '' }]

  if (principalStoreName) {
    options.push({ label: `${principalStoreName} (Principal)`, value: principalStoreName })
    allStoreNames.delete(principalStoreName)
  }

  Array.from(allStoreNames)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .forEach((storeName) => options.push({ label: storeName, value: storeName }))

  return options
}

/** Gera as opções de funcionário para um <Select>. */
export const buildEmployeeOptions = (
  employees: Array<{ id: string; nomeCompleto: string }>
): Array<{ label: string; value: string }> => [
  { label: 'Selecione', value: '' },
  ...employees.map((emp) => ({ label: emp.nomeCompleto, value: emp.id })),
]

// ---------------------------------------------------------------------------
// Utilitários de teclado / foco
// ---------------------------------------------------------------------------

/** Foca o elemento após o próximo tick (necessário para elementos controlados). */
export const focusNext = (element?: HTMLElement | null): void => {
  if (!element) return
  setTimeout(() => element.focus(), 0)
}

/**
 * Handler de keydown: ao pressionar Enter, foca o próximo campo referenciado.
 * Compatível com qualquer evento de teclado React e qualquer RefObject.
 */
export const handleKeyDown = (
  event: { key: string; preventDefault(): void },
  nextRef?: { current: HTMLElement | null | undefined }
): void => {
  if (event.key === 'Enter') {
    event.preventDefault()
    focusNext(nextRef?.current)
  }
}

export const formatDateTime = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const formatCEP = (value: string): string => {
  let numbers = value.replace(/\D/g, ''); // Remove tudo que não é número
  
  // Aplica a formatação: 00000-000
  if (numbers.length > 5) {
    numbers = numbers.slice(0, 5) + '-' + numbers.slice(5, 8);
  }
  
  return numbers;
};

export const formatRG = (value: string): string => {
  let numbers = value.replace(/\D/g, ''); // Remove tudo que não é número
  
  // Aplica a formatação: 00.000.000-0
  if (numbers.length > 2 && numbers.length <= 5) {
    numbers = numbers.slice(0, 2) + '.' + numbers.slice(2);
  } else if (numbers.length > 5 && numbers.length <= 8) {
    numbers = numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5);
  } else if (numbers.length > 8) {
    numbers = numbers.slice(0, 2) + '.' + numbers.slice(2, 5) + '.' + numbers.slice(5, 8) + '-' + numbers.slice(8, 9);
  }
  
  return numbers;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatNumber = (value: string): string => {
  return value.replace(/\D/g, ''); // Remove tudo que não é número
};

// Validação de CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[\D]/g, '');
  if (cnpj.length !== 14) return false;
  if (/^([0-9])\1+$/.test(cnpj)) return false;
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  return true;
}
