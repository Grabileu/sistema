// Máscara para celular (formato brasileiro: (99) 99999-9999)
export function maskCelular(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

// Máscara para telefone fixo (formato brasileiro: (99) 9999-9999)
export function maskTelefone(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 14);
}

// Máscara para WhatsApp (igual ao celular)
export function maskWhatsapp(value: string) {
  return maskCelular(value);
}
// Funções de máscara reutilizáveis

export function maskPISPasep(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{5})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{5})\.(\d{2})(\d)/, "$1.$2.$3-$4")
    .slice(0, 14);
}

export function maskCarteiraTrabalho(value: string) {
  const onlyNums = value.replace(/\D/g, "");
  if (onlyNums.length <= 2) return onlyNums;
  if (onlyNums.length <= 7) return onlyNums.replace(/(\d{2})(\d{0,5})/, "$1.$2");
  return onlyNums.slice(0, 7).replace(/(\d{2})(\d{0,5})/, "$1.$2");
}
