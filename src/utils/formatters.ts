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
  let numbers = value.replace(/\D/g, ''); // Remove tudo que não é número
  
  // Aplica a formatação: DD/MM/AAAA
  if (numbers.length > 2 && numbers.length <= 4) {
    numbers = numbers.slice(0, 2) + '/' + numbers.slice(2);
  } else if (numbers.length > 4) {
    numbers = numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8);
  }
  
  return numbers;
};

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
