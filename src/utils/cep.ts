// Função utilitária para buscar dados de endereço pelo CEP usando a API ViaCEP
export async function buscarEnderecoPorCep(cep: string) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return null;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.erro) return null;
    return {
      endereco: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
      pais: 'Brasil',
    };
  } catch {
    return null;
  }
}
