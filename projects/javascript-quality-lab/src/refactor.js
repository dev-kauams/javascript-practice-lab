// Refatoração de código duplicado.
//
// Fluxo recomendado: 1) escreva testes que descrevem o comportamento ATUAL,
// 2) refatore, 3) rode os mesmos testes. Se continuam verdes, o comportamento foi preservado.

/* ---------- ANTES: três funções quase idênticas (copiar e colar) ---------- */
export const legacy = {
  formatClient(person) {
    if (!person || !person.firstName) return 'Cliente sem nome';
    const last = person.lastName ? ' ' + person.lastName : '';
    return 'Cliente: ' + person.firstName.trim() + last.trimEnd();
  },
  formatSupplier(person) {
    if (!person || !person.firstName) return 'Fornecedor sem nome';
    const last = person.lastName ? ' ' + person.lastName : '';
    return 'Fornecedor: ' + person.firstName.trim() + last.trimEnd();
  },
  formatEmployee(person) {
    if (!person || !person.firstName) return 'Funcionário sem nome';
    const last = person.lastName ? ' ' + person.lastName : '';
    return 'Funcionário: ' + person.firstName.trim() + last.trimEnd();
  },
};

/* ---------- DEPOIS: uma função parametrizada + uma tabela de papéis ---------- */
const ROLES = { client: 'Cliente', supplier: 'Fornecedor', employee: 'Funcionário' };

export function formatPerson(person, role) {
  const label = ROLES[role];
  if (!label) throw new RangeError(`Papel desconhecido: ${role}`);
  if (!person?.firstName) return `${label} sem nome`;
  const fullName = [person.firstName.trim(), person.lastName?.trim()]
    .filter(Boolean)
    .join(' ');
  return `${label}: ${fullName}`;
}

export const refactored = {
  formatClient: (person) => formatPerson(person, 'client'),
  formatSupplier: (person) => formatPerson(person, 'supplier'),
  formatEmployee: (person) => formatPerson(person, 'employee'),
};
