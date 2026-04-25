// Opções para selects bancários
export const FORMA_PAGAMENTO_OPTIONS = [
  { label: 'Salário', value: 'salario' },
  { label: 'Bolsa', value: 'bolsa' },
  { label: 'Pagamento por Hora', value: 'hora' },
  { label: 'Comissão', value: 'comissao' },
];
export const MODALIDADE_OPTIONS = [
  { label: 'Nenhum', value: '' },
  { label: 'Pessoa Física', value: 'pf' },
  { label: 'Pessoa Jurídica', value: 'pj' },
];
export const TIPO_CONTA_OPTIONS = [
  { label: 'Nenhum', value: '' },
  { label: 'Conta Corrente', value: 'corrente' },
  { label: 'Conta Poupança', value: 'poupanca' },
];
export const BANCO_OPTIONS = [
  { label: 'Banco do Brasil', value: '001' },
  { label: 'Caixa Econômica', value: '104' },
  { label: 'Bradesco', value: '237' },
  { label: 'Itaú', value: '341' },
  { label: 'Santander', value: '033' },
  { label: 'Nubank', value: '260' },
  { label: 'Outros', value: 'outros' },
];
export const TIPO_CHAVE_OPTIONS = [
  { label: 'CPF', value: 'cpf' },
  { label: 'CNPJ', value: 'cnpj' },
  { label: 'E-mail', value: 'email' },
  { label: 'Celular', value: 'celular' },
  { label: 'Aleatória', value: 'aleatoria' },
];
// Opções centralizadas para todos os selects do sistema

export const COR_RACA_OPTIONS = [
  { label: 'Nenhum', value: '' },
  { label: 'Indígena', value: 'indigena' },
  { label: 'Branca', value: 'branca' },
  { label: 'Preta', value: 'preta' },
  { label: 'Amarela', value: 'amarela' },
  { label: 'Parda', value: 'parda' },
];

export const GENERO_OPTIONS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Feminino', value: 'feminino' },
  { label: 'Outros', value: 'outros' },
];

export const ESTADO_CIVIL_OPTIONS = [
  { label: 'Nenhum', value: '' },
  { label: 'Solteiro(a)', value: 'solteiro' },
  { label: 'Casado(a)', value: 'casado' },
  { label: 'Viuvo(a)', value: 'viuvo' },
  { label: 'Divorciado(a)', value: 'divorciado' },
  { label: 'União Estável', value: 'uniaoestavel' },
  { label: 'Separado(a)', value: 'separado' },
];

export const CATEGORIA_CNH_OPTIONS = [
  { label: 'Nenhum', value: '' },
  { label: 'ACC', value: 'acc' },
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'C', value: 'c' },
  { label: 'D', value: 'd' },
  { label: 'E', value: 'e' },
];

export const ESCOLARIDADE_OPTIONS = [
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
];

export const NECESSIDADE_ESPECIAL_OPTIONS = [
  { label: 'Não', value: 'não' },
  { label: 'Sim', value: 'sim' },
];

export const TIPO_NECESSIDADE_OPTIONS = [
  { label: 'Físico', value: 'fisico' },
  { label: 'Visual', value: 'visual' },
  { label: 'Auditiva', value: 'auditiva' },
  { label: 'Mental', value: 'mental' },
  { label: 'Intelectual', value: 'intelectual' },
];

export const VINCULO_OPTIONS = [
  { label: 'Selecione', value: '' },
  { label: 'Carteira Assinada (CLT)', value: 'clt' },
  { label: 'Contrato PJ', value: 'pj' },
  { label: 'Jovem Aprendiz', value: 'jovem_aprendiz' },
  { label: 'Estágio', value: 'estagio' },
  { label: 'Trabalhador autônomo', value: 'autonomo' },
  { label: 'Empregado doméstico', value: 'empregado_domestico' },
  { label: 'Trabalho voluntário', value: 'voluntario' },
  { label: 'Trabalho eventual', value: 'eventual' },
  { label: 'Trabalhador avulso', value: 'avulso' },
  { label: 'Temporário', value: 'temporario' },
  { label: 'Sócio', value: 'socio' },
  { label: 'Diretor estatutário', value: 'diretor_estatutario' },
  { label: 'Trabalhador rural', value: 'rural' },
  { label: 'Teletrabalho (Home Office)', value: 'home_office' },
];

export const PRIMEIRO_EMPREGO_OPTIONS = [
  { label: 'Não', value: 'não' },
  { label: 'Sim', value: 'sim' },
];

export const CARGO_CONFIANCA_OPTIONS = PRIMEIRO_EMPREGO_OPTIONS;
export const SEGURO_DESEMPREGO_OPTIONS = PRIMEIRO_EMPREGO_OPTIONS;
export const APOSENTADO_OPTIONS = PRIMEIRO_EMPREGO_OPTIONS;

export const FREQUENCIA_PAGAMENTO_OPTIONS = [
  { label: 'Selecione', value: '' },
  { label: 'Semanal', value: 'semanal' },
  { label: 'Quinzenal', value: 'quinzenal' },
  { label: 'Mensal', value: 'mensal' },
  { label: 'Semestral', value: 'semestral' },
  { label: 'Anual', value: 'anual' },
  { label: 'Variável', value: 'variavel' },
];

export const ESTABILIDADE_OPTIONS = [
  { label: 'Nenhum', value: '' },
  { label: 'Acidente de trabalho', value: 'acidente_trabalho' },
  { label: 'Período gestacional', value: 'periodo_gestacional' },
  { label: 'Acordo coletivo', value: 'acordo_coletivo' },
  { label: 'Eleitos para CIPA', value: 'eleitos_cipa' },
  { label: 'Dirigentes sindicais', value: 'dirigentes_sindicais' },
  { label: 'Diretores de cooperativa', value: 'diretores_cooperativa' },
];
