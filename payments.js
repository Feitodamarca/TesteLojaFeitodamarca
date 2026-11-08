/* Adaptador de pagamentos — NÃO simula aprovação.
 *
 * Enquanto nenhum gateway estiver configurado, startCheckout() sempre rejeita com
 * code 'NOT_CONFIGURED'. Para integrar Stripe ou Mercado Pago:
 *
 *   1. Crie um endpoint no servidor (ex.: Supabase Edge Function) que recebe os IDs
 *      dos produtos, BUSCA OS PREÇOS NO BANCO (nunca confie no preço vindo do navegador),
 *      cria a sessão de pagamento no gateway e devolve a URL de checkout.
 *   2. Registre o gateway abaixo:
 *        FDM.payments.configure({ provider: 'stripe', endpoint: 'https://.../create-checkout' });
 *   3. Confirme o pagamento via webhook no servidor e só então libere os downloads.
 */
(function () {
  const F = (window.FDM = window.FDM || {});
  const cfg = { provider: null, endpoint: null };

  F.payments = {
    configure(c) { cfg.provider = c.provider || null; cfg.endpoint = c.endpoint || null; },
    isConfigured() { return !!(cfg.provider && cfg.endpoint); },
    async startCheckout({ productIds, email }) {
      if (!this.isConfigured()) {
        const err = new Error('Gateway de pagamento não configurado.');
        err.code = 'NOT_CONFIGURED';
        throw err;
      }
      const res = await fetch(cfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds, email })
      });
      if (!res.ok) throw new Error('Falha ao iniciar o pagamento.');
      const data = await res.json();
      if (!data.url || !/^https:\/\//.test(data.url)) throw new Error('Resposta inválida do gateway.');
      window.location.assign(data.url); // redireciona ao checkout hospedado
    }
  };
})();
