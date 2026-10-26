// Simula uma chamada ao servidor para exercitar os estados de envio.
// Regras da simulação:
//  - e-mail contendo "erro@"  -> falha com mensagem do servidor
//  - e-mail contendo "lento@" -> demora 3 segundos
//  - senha incorreta no login -> use "Senha@123"

export function simulateRequest(kind, payload, { signal } = {}) {
  const email = String(payload.email ?? '').toLowerCase();
  const delay = email.includes('lento@') ? 3000 : 900;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (email.includes('erro@')) {
        reject(new Error('O servidor simulado recusou o pedido. Tente novamente.'));
      } else if (kind === 'login' && payload.password !== 'Senha@123') {
        reject(
          new Error(
            'E-mail ou senha incorretos. (Dica: a senha da demonstração é Senha@123.)',
          ),
        );
      } else {
        resolve({ ok: true, email });
      }
    }, delay);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Envio cancelado.', 'AbortError'));
    });
  });
}
