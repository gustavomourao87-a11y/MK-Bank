const state = {
  view: "dashboard",
  transactionFilter: "todos",
  search: "",
  cardLocked: false,
  showBalance: true,
  theme: localStorage.getItem("mk-theme") || "light",
  authenticated: sessionStorage.getItem("mk-authenticated") === "true",
};

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const navItems = [
  { id: "dashboard", label: "Painel", icon: "⌂" },
  { id: "pix", label: "Pix e TED", icon: "◆" },
  { id: "payments", label: "Pagamentos", icon: "▣", badge: "3" },
  { id: "cards", label: "Cartoes", icon: "◧" },
  { id: "investments", label: "Investimentos", icon: "↗" },
  { id: "loans", label: "Credito", icon: "$" },
  { id: "statements", label: "Extrato", icon: "≡" },
  { id: "support", label: "Atendimento", icon: "?" },
  { id: "settings", label: "Seguranca", icon: "⚙" },
];

const account = {
  holder: "Marina Ribeiro",
  agency: "0001",
  number: "48291-7",
  balance: 42850.9,
  income: 18240,
  expenses: 11980.45,
  limit: 24000,
  usedLimit: 8740.3,
  score: 928,
};

const transactions = [
  { id: 1, title: "Salario MK Tecnologia", category: "Receita", type: "entrada", date: "Hoje, 09:12", value: 14200, icon: "↑" },
  { id: 2, title: "Pix para Rafael Lima", category: "Pix", type: "saida", date: "Hoje, 08:44", value: -320, icon: "◆" },
  { id: 3, title: "Cartao final 3092", category: "Cartao", type: "saida", date: "Ontem, 20:18", value: -189.9, icon: "◧" },
  { id: 4, title: "Reserva automatica", category: "Investimento", type: "saida", date: "Ontem, 10:02", value: -1500, icon: "↗" },
  { id: 5, title: "Cashback MK Platinum", category: "Beneficio", type: "entrada", date: "Seg, 17:40", value: 84.65, icon: "%" },
  { id: 6, title: "Condominio Aurora", category: "Pagamento", type: "saida", date: "Seg, 11:05", value: -990.3, icon: "▣" },
  { id: 7, title: "Aplicacao CDB 118% CDI", category: "Investimento", type: "saida", date: "Sex, 16:22", value: -3000, icon: "↗" },
  { id: 8, title: "Transferencia recebida", category: "Receita", type: "entrada", date: "Sex, 14:01", value: 750, icon: "↑" },
];

const investments = [
  { name: "CDB MK Liquidez diaria", value: 18500, yield: "+112,40 este mes", risk: "Baixo", pct: 72 },
  { name: "Tesouro Selic 2029", value: 12420.5, yield: "+84,12 este mes", risk: "Baixo", pct: 58 },
  { name: "Fundo MK Global Tech", value: 8200, yield: "+2,8% em 12 meses", risk: "Medio", pct: 41 },
  { name: "Previdencia MK Futuro", value: 27310.9, yield: "+9,4% em 12 meses", risk: "Longo prazo", pct: 86 },
];

const bills = [
  { name: "Energia", due: "Vence hoje", value: 236.72, status: "Pendente" },
  { name: "Internet fibra", due: "27 mai", value: 129.9, status: "Agendado" },
  { name: "Seguro residencial", due: "30 mai", value: 88.4, status: "Pendente" },
];

const contacts = ["Ana Paula", "Bruno Mendes", "Carla Nogueira", "Rafael Lima", "Victor Prado"];
const spendingBars = [42, 58, 36, 70, 54, 88, 63, 45];

const views = {
  dashboard: renderDashboard,
  pix: renderPix,
  payments: renderPayments,
  cards: renderCards,
  investments: renderInvestments,
  loans: renderLoans,
  statements: renderStatements,
  support: renderSupport,
  settings: renderSettings,
};

const content = document.querySelector("#content");
const viewTitle = document.querySelector("#viewTitle");
const navList = document.querySelector("#navList");
const modal = document.querySelector("#modal");
const modalTitle = document.querySelector("#modalTitle");
const modalKicker = document.querySelector("#modalKicker");
const modalBody = document.querySelector("#modalBody");
const toast = document.querySelector("#toast");
const sidebar = document.querySelector(".sidebar");
const backdrop = document.querySelector("#mobileBackdrop");
const loginForm = document.querySelector("#loginForm");
const demoLogin = document.querySelector("#demoLogin");
const passwordToggle = document.querySelector("#passwordToggle");
const loginPassword = document.querySelector("#loginPassword");

function init() {
  document.documentElement.dataset.theme = state.theme;
  syncAuthState();
  document.querySelector("#todayLabel").textContent = dateFmt.format(new Date());
  renderNav();
  render();
  bindGlobalEvents();
}

function renderNav() {
  navList.innerHTML = navItems
    .map(
      (item) => `
        <button class="nav-item ${state.view === item.id ? "active" : ""}" type="button" data-view="${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ""}
        </button>
      `,
    )
    .join("");
}

function render() {
  const nav = navItems.find((item) => item.id === state.view);
  viewTitle.textContent = nav.label;
  renderNav();
  content.innerHTML = views[state.view]();
  bindViewEvents();
}

function renderDashboard() {
  return `
    <div class="grid dashboard-grid">
      <div class="grid">
        ${balanceCard()}
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Acoes rapidas</h2>
              <span class="muted">Operacoes mais usadas na sua rotina</span>
            </div>
          </div>
          <div class="quick-actions">
            ${quickAction("pix", "◆", "Pix")}
            ${quickAction("payments", "▣", "Pagar boleto")}
            ${quickAction("cards", "◧", "Cartao virtual")}
            ${quickAction("investments", "↗", "Investir")}
            ${quickAction("loans", "$", "Credito")}
            ${quickAction("support", "?", "Atendimento")}
          </div>
        </section>
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Movimentacoes recentes</h2>
              <span class="muted">Ultimas entradas e saidas da conta</span>
            </div>
            <button class="secondary-button" type="button" data-view="statements">Ver extrato</button>
          </div>
          <div class="transaction-list">${transactionRows(transactions.slice(0, 5))}</div>
        </section>
      </div>

      <aside class="grid">
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>MK Platinum</h2>
              <span class="muted">Final 3092</span>
            </div>
            <button class="icon-button" type="button" data-action="toggle-card">${state.cardLocked ? "🔒" : "●"}</button>
          </div>
          ${creditCard()}
        </section>
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Saude financeira</h2>
              <span class="muted">Score interno MK</span>
            </div>
            <strong>${account.score}</strong>
          </div>
          ${metric("Gastos do mes", money.format(account.expenses), 61)}
          ${metric("Uso do limite", money.format(account.usedLimit), 36)}
          ${metric("Meta reserva", "83% concluida", 83)}
        </section>
        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>Proximos vencimentos</h2>
              <span class="muted">Contas monitoradas</span>
            </div>
          </div>
          <div class="timeline">
            ${bills.map((bill) => timelineItem(bill.name, `${bill.due} • ${money.format(bill.value)}`, bill.status === "Pendente" ? "warn" : "info")).join("")}
          </div>
        </section>
      </aside>
    </div>
  `;
}

function renderPix() {
  return `
    <div class="grid two-grid">
      <section class="form-panel">
        <div class="panel-head">
          <div>
            <h2>Enviar Pix</h2>
            <span class="muted">Transferencia instantanea com comprovante</span>
          </div>
        </div>
        <form class="form-grid" data-form="pix">
          ${field("Chave Pix", "pixKey", "email, CPF, telefone ou aleatoria")}
          ${selectField("Contato salvo", "contact", contacts)}
          ${field("Valor", "amount", "0,00", "number")}
          ${field("Descricao", "description", "Opcional")}
          <div class="field full">
            <label>Conta de origem</label>
            <select name="from"><option>Conta corrente MK - ${account.number}</option><option>Reserva MK Liquidez</option></select>
          </div>
          <div class="form-actions field full">
            <button class="secondary-button" type="button" data-action="open-key-manager">Minhas chaves</button>
            <button class="primary-button" type="submit">Enviar Pix</button>
          </div>
        </form>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Area Pix</h2>
            <span class="muted">Limites, chaves e favoritos</span>
          </div>
        </div>
        ${metric("Limite diurno disponivel", money.format(14800), 74)}
        ${metric("Limite noturno disponivel", money.format(2200), 44)}
        <div class="notice">Chave principal: marina.ribeiro@email.com</div>
        <div class="timeline">
          ${timelineItem("Pix copia e cola", "Cole um codigo para pagar imediatamente", "info")}
          ${timelineItem("Pix agendado", "2 agendamentos ativos para junho", "warn")}
          ${timelineItem("Pix recorrente", "Aluguel configurado todo dia 05", "")}
        </div>
      </section>
    </div>
  `;
}

function renderPayments() {
  return `
    <div class="grid two-grid">
      <section class="form-panel">
        <div class="panel-head">
          <div>
            <h2>Pagar boleto</h2>
            <span class="muted">Leitura por codigo de barras ou digitacao</span>
          </div>
        </div>
        <form class="form-grid" data-form="payment">
          <div class="field full">
            <label>Codigo de barras</label>
            <input name="barcode" inputmode="numeric" placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000" />
          </div>
          ${field("Valor", "amount", "0,00", "number")}
          ${field("Data de pagamento", "date", "", "date")}
          <div class="field full">
            <label>Categoria</label>
            <select name="category"><option>Moradia</option><option>Servicos</option><option>Impostos</option><option>Educacao</option></select>
          </div>
          <div class="form-actions field full">
            <button class="secondary-button" type="button" data-action="scan-boleto">Ler boleto</button>
            <button class="primary-button" type="submit">Confirmar pagamento</button>
          </div>
        </form>
      </section>
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Contas a vencer</h2>
            <span class="muted">Agenda inteligente MK</span>
          </div>
        </div>
        <div class="transaction-list">
          ${bills.map((bill) => row("▣", bill.name, `${bill.due} • ${bill.status}`, -bill.value)).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCards() {
  return `
    <div class="grid dashboard-grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Cartao MK Platinum</h2>
            <span class="muted">Controle total para compras fisicas e online</span>
          </div>
        </div>
        ${creditCard()}
        <div class="grid three-grid" style="margin-top:18px">
          <div class="mini-panel">${metric("Fatura atual", money.format(3528.76), 44)}</div>
          <div class="mini-panel">${metric("Limite disponivel", money.format(account.limit - account.usedLimit), 64)}</div>
          <div class="mini-panel">${metric("Cashback acumulado", money.format(428.2), 78)}</div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Preferencias</h2>
            <span class="muted">Ajustes aplicados em tempo real</span>
          </div>
        </div>
        ${setting("Cartao bloqueado", state.cardLocked, "toggle-card")}
        ${setting("Compra internacional", true, "toggle-demo")}
        ${setting("Aprovar online por biometria", true, "toggle-demo")}
        ${setting("Cartao virtual rotativo", false, "toggle-demo")}
        <div class="form-actions">
          <button class="primary-button" type="button" data-action="virtual-card">Gerar virtual</button>
        </div>
      </section>
    </div>
  `;
}

function renderInvestments() {
  return `
    <div class="grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Carteira consolidada</h2>
            <span class="muted">Patrimonio, rentabilidade e distribuicao</span>
          </div>
          <button class="primary-button" type="button" data-action="invest-now">Aplicar agora</button>
        </div>
        <div class="grid three-grid">
          <div class="mini-panel">${metric("Total investido", money.format(66431.4), 81)}</div>
          <div class="mini-panel">${metric("Rendimento mes", money.format(596.72), 68)}</div>
          <div class="mini-panel">${metric("Perfil", "Moderado", 52)}</div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Produtos na carteira</h2>
            <span class="muted">Posicoes atualizadas</span>
          </div>
        </div>
        <div class="transaction-list">
          ${investments.map((item) => investmentRow(item)).join("")}
        </div>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>Evolucao patrimonial</h2><span class="muted">Ultimos 8 meses</span></div>
        ${chart(spendingBars.map((v) => v + 8))}
      </section>
    </div>
  `;
}

function renderLoans() {
  return `
    <div class="grid two-grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Credito pre-aprovado</h2>
            <span class="muted">Simule antes de contratar</span>
          </div>
        </div>
        <div class="grid">
          ${loanRow("Emprestimo pessoal", 55000, "a partir de 1,89% a.m.", 80)}
          ${loanRow("Financiamento veicular", 128000, "ate 60 meses", 64)}
          ${loanRow("Home equity", 420000, "garantia de imovel", 47)}
        </div>
      </section>
      <section class="form-panel">
        <div class="panel-head">
          <div>
            <h2>Simulador</h2>
            <span class="muted">Oferta personalizada pelo score MK</span>
          </div>
        </div>
        <form class="form-grid" data-form="loan">
          ${field("Valor desejado", "amount", "50000", "number")}
          ${field("Parcelas", "installments", "24", "number")}
          <div class="field full">
            <label>Finalidade</label>
            <select name="goal"><option>Organizar vida financeira</option><option>Reforma</option><option>Veiculo</option><option>Negocio</option></select>
          </div>
          <div class="notice field full">Parcela estimada: <strong>R$ 2.624,18</strong> com CET simulado de 2,14% a.m.</div>
          <div class="form-actions field full"><button class="primary-button" type="submit">Solicitar proposta</button></div>
        </form>
      </section>
    </div>
  `;
}

function renderStatements() {
  const filtered = getFilteredTransactions();
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Extrato completo</h2>
          <span class="muted">${filtered.length} lancamentos encontrados</span>
        </div>
        <button class="secondary-button" type="button" data-action="export-statement">Exportar OFX</button>
      </div>
      <div class="tabs">
        ${["todos", "entrada", "saida"].map((type) => `<button class="chip ${state.transactionFilter === type ? "active" : ""}" type="button" data-filter="${type}">${labelFilter(type)}</button>`).join("")}
      </div>
      <div class="transaction-list">${filtered.length ? transactionRows(filtered) : `<div class="row"><span class="muted">Nenhum lancamento encontrado.</span></div>`}</div>
    </section>
  `;
}

function renderSupport() {
  return `
    <div class="grid two-grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Central de atendimento</h2>
            <span class="muted">Canais prioritarios MK Bank</span>
          </div>
        </div>
        ${supportRow("Chat seguro", "Resposta media de 2 minutos", "Abrir chat")}
        ${supportRow("Contestacao de compra", "Cartao final 3092", "Iniciar")}
        ${supportRow("Consultoria financeira", "Agenda com Aline Costa", "Agendar")}
        ${supportRow("Emergencia 24h", "Bloqueios e seguranca", "Ligar")}
      </section>
      <section class="form-panel">
        <div class="panel-head">
          <div>
            <h2>Novo chamado</h2>
            <span class="muted">Protocolo gerado automaticamente</span>
          </div>
        </div>
        <form class="form-grid" data-form="support">
          <div class="field full"><label>Assunto</label><input name="subject" placeholder="Descreva em poucas palavras" /></div>
          <div class="field full"><label>Categoria</label><select name="category"><option>Cartoes</option><option>Conta</option><option>Pix</option><option>Investimentos</option></select></div>
          <div class="field full"><label>Mensagem</label><input name="message" placeholder="Conte o que aconteceu" /></div>
          <div class="form-actions field full"><button class="primary-button" type="submit">Enviar chamado</button></div>
        </form>
      </section>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="grid two-grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Seguranca</h2>
            <span class="muted">Camadas de protecao da conta</span>
          </div>
        </div>
        ${setting("Biometria facial", true, "toggle-demo")}
        ${setting("Token no app", true, "toggle-demo")}
        ${setting("Aviso de transacao por SMS", false, "toggle-demo")}
        ${setting("Modo viagem", false, "toggle-demo")}
      </section>
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>Dispositivos</h2>
            <span class="muted">Acessos autorizados</span>
          </div>
        </div>
        ${supportRow("Notebook pessoal", "Sao Paulo • ativo agora", "Confiavel")}
        ${supportRow("iPhone 15", "Ultimo acesso hoje 08:12", "Confiavel")}
        ${supportRow("Chrome Windows", "Ultimo acesso 18 mai", "Remover")}
      </section>
    </div>
  `;
}

function balanceCard() {
  const balance = state.showBalance ? money.format(account.balance) : "R$ ••••••";
  return `
    <section class="balance-card">
      <div class="account-head">
        <div>
          <span class="card-label">Conta corrente</span>
          <div class="account-number">Ag ${account.agency} • CC ${account.number}</div>
        </div>
        <button class="icon-button" type="button" data-action="toggle-balance" aria-label="Mostrar ou ocultar saldo">${state.showBalance ? "◉" : "◎"}</button>
      </div>
      <div>
        <span class="card-label">Saldo disponivel</span>
        <div class="balance-value">${balance}</div>
      </div>
      <div class="balance-foot">
        <div><span>Entradas</span><strong>${money.format(account.income)}</strong></div>
        <div><span>Saidas</span><strong>${money.format(account.expenses)}</strong></div>
        <div><span>Limite</span><strong>${money.format(account.limit)}</strong></div>
      </div>
    </section>
  `;
}

function creditCard() {
  return `
    <div class="mk-card">
      <div class="card-toolbar">
        <strong>MK Bank</strong>
        <span>${state.cardLocked ? "Bloqueado" : "Ativo"}</span>
      </div>
      <div class="card-chip"></div>
      <div>
        <div class="card-number">5482 •••• •••• 3092</div>
        <div class="card-toolbar">
          <span>Marina Ribeiro</span>
          <span>09/31</span>
        </div>
      </div>
    </div>
  `;
}

function quickAction(view, icon, label) {
  return `<button class="chip" type="button" data-view="${view}"><span>${icon}</span>${label}</button>`;
}

function metric(label, value, pct) {
  return `
    <div class="metric">
      <div><span class="muted">${label}</span><strong>${value}</strong></div>
      <div style="width:38%"><div class="progress"><span style="width:${pct}%"></span></div></div>
    </div>
  `;
}

function transactionRows(items) {
  return items.map((item) => row(item.icon, item.title, `${item.category} • ${item.date}`, item.value)).join("");
}

function row(icon, title, subtitle, value) {
  const positive = value > 0;
  return `
    <div class="row">
      <div class="row-icon">${icon}</div>
      <div class="row-main"><strong>${title}</strong><span class="muted">${subtitle}</span></div>
      <div class="amount ${positive ? "positive" : "negative"}">${positive ? "+" : ""}${money.format(value)}</div>
    </div>
  `;
}

function field(label, name, placeholder, type = "text") {
  return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" placeholder="${placeholder}" /></div>`;
}

function selectField(label, name, options) {
  return `<div class="field"><label>${label}</label><select name="${name}">${options.map((option) => `<option>${option}</option>`).join("")}</select></div>`;
}

function timelineItem(title, description, type) {
  return `<div class="timeline-item"><span class="status-dot ${type}"></span><div><strong>${title}</strong><br><span class="muted">${description}</span></div></div>`;
}

function setting(label, active, action) {
  return `
    <div class="setting-row">
      <div class="support-main"><strong>${label}</strong><span class="muted">${active ? "Ativado" : "Desativado"}</span></div>
      <button class="chip ${active ? "active" : ""}" type="button" data-action="${action}">${active ? "ON" : "OFF"}</button>
    </div>
  `;
}

function investmentRow(item) {
  return `
    <div class="investment-row">
      <div class="row-icon">↗</div>
      <div class="investment-main"><strong>${item.name}</strong><span class="muted">${item.risk} • ${item.yield}</span></div>
      <div class="amount">${money.format(item.value)}</div>
      <div style="width:120px"><div class="progress"><span style="width:${item.pct}%"></span></div></div>
    </div>
  `;
}

function loanRow(name, value, detail, pct) {
  return `
    <div class="loan-row">
      <div class="row-icon">$</div>
      <div class="loan-main"><strong>${name}</strong><span class="muted">${detail}</span></div>
      <div class="amount">${money.format(value)}</div>
      <button class="secondary-button" type="button" data-action="simulate-loan">Simular</button>
    </div>
    <div class="progress"><span style="width:${pct}%"></span></div>
  `;
}

function supportRow(title, subtitle, action) {
  return `
    <div class="support-row">
      <div class="row-icon">?</div>
      <div class="support-main"><strong>${title}</strong><span class="muted">${subtitle}</span></div>
      <button class="secondary-button" type="button" data-action="support-action">${action}</button>
    </div>
  `;
}

function chart(values) {
  return `<div class="chart">${values.map((value, index) => `<div class="bar" style="height:${value}%">${index + 1}</div>`).join("")}</div>`;
}

function labelFilter(type) {
  return { todos: "Todos", entrada: "Entradas", saida: "Saidas" }[type];
}

function getFilteredTransactions() {
  const term = state.search.trim().toLowerCase();
  return transactions.filter((item) => {
    const matchesType = state.transactionFilter === "todos" || item.type === state.transactionFilter;
    const matchesSearch = !term || `${item.title} ${item.category} ${item.date}`.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });
}

function bindGlobalEvents() {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
  });

  demoLogin.addEventListener("click", () => login(true));

  passwordToggle.addEventListener("click", () => {
    const showing = loginPassword.type === "text";
    loginPassword.type = showing ? "password" : "text";
    passwordToggle.textContent = showing ? "◎" : "◉";
  });

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      state.view = viewButton.dataset.view;
      closeMobileMenu();
      render();
      return;
    }

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action) handleAction(action);
  });

  document.querySelector("#globalSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    if (state.view !== "statements") state.view = "statements";
    render();
    document.querySelector("#globalSearch").focus();
  });

  document.querySelector("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = state.theme;
    localStorage.setItem("mk-theme", state.theme);
  });

  document.querySelector("#menuButton").addEventListener("click", () => {
    sidebar.classList.add("open");
    backdrop.classList.add("open");
  });

  backdrop.addEventListener("click", closeMobileMenu);
  document.querySelector("#closeModal").addEventListener("click", () => modal.close());
}

function bindViewEvents() {
  content.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleForm(form.dataset.form);
      form.reset();
    });
  });

  content.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.transactionFilter = button.dataset.filter;
      render();
    });
  });
}

function handleAction(action) {
  const map = {
    "toggle-card": () => {
      state.cardLocked = !state.cardLocked;
      showToast(state.cardLocked ? "Cartao MK Platinum bloqueado." : "Cartao MK Platinum desbloqueado.");
      render();
    },
    "toggle-balance": () => {
      state.showBalance = !state.showBalance;
      render();
    },
    "open-profile": () => openModal("Perfil", "Marina Ribeiro", profileModal()),
    "open-support": () => {
      state.view = "support";
      render();
    },
    "open-key-manager": () => openModal("Pix", "Minhas chaves", keysModal()),
    "scan-boleto": () => showToast("Leitor de boleto simulado ativado."),
    "virtual-card": () => openModal("Cartoes", "Cartao virtual", virtualCardModal()),
    "invest-now": () => openModal("Investimentos", "Aplicacao rapida", investModal()),
    "simulate-loan": () => {
      state.view = "loans";
      render();
    },
    "support-action": () => showToast("Solicitacao encaminhada para a central MK."),
    "export-statement": () => showToast("Extrato OFX gerado em modo demonstracao."),
    "toggle-demo": () => showToast("Preferencia atualizada em modo demonstracao."),
    "forgot-password": () => showToast("Enviamos as instrucoes de recuperacao para o e-mail cadastrado."),
    logout: () => logout(),
  };

  if (map[action]) map[action]();
}

function handleForm(formType) {
  const messages = {
    pix: "Pix enviado com autenticacao MK Token.",
    payment: "Pagamento agendado com sucesso.",
    loan: "Proposta enviada para analise instantanea.",
    support: "Chamado aberto. Protocolo MK-2026-0517.",
  };
  showToast(messages[formType] || "Operacao registrada.");
}

function openModal(kicker, title, html) {
  modalKicker.textContent = kicker;
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modal.showModal();
}

function profileModal() {
  return `
    <div class="grid">
      <div class="notice"><strong>Cliente MK Prime</strong><br><span class="muted">Conta aberta desde 2021, score ${account.score}, gerente dedicada.</span></div>
      ${metric("Relacionamento", "5 anos", 92)}
      ${metric("Produtos ativos", "8 produtos", 76)}
      ${metric("Seguranca", "Alta", 88)}
      <div class="form-actions"><button class="danger-button" type="button" data-action="logout">Sair da conta</button></div>
    </div>
  `;
}

function keysModal() {
  return `
    <div class="transaction-list">
      ${infoRow("◆", "E-mail", "marina.ribeiro@email.com")}
      ${infoRow("◆", "Celular", "(11) 98888-2044")}
      ${infoRow("◆", "Chave aleatoria", "6f31-904a-mkbank-2026")}
    </div>
  `;
}

function infoRow(icon, title, subtitle) {
  return `
    <div class="row">
      <div class="row-icon">${icon}</div>
      <div class="row-main"><strong>${title}</strong><span class="muted">${subtitle}</span></div>
      <button class="secondary-button" type="button" data-action="toggle-demo">Gerenciar</button>
    </div>
  `;
}

function virtualCardModal() {
  return `
    ${creditCard()}
    <div class="notice" style="margin-top:16px">CVV temporario: <strong>724</strong> • valido por 15 minutos.</div>
  `;
}

function investModal() {
  return `
    <form class="form-grid" data-form="invest">
      ${field("Valor", "amount", "1000", "number")}
      <div class="field"><label>Produto</label><select><option>CDB MK Liquidez diaria</option><option>Tesouro Selic 2029</option><option>Fundo MK Global Tech</option></select></div>
      <div class="form-actions field full"><button class="primary-button" type="button" onclick="document.querySelector('#modal').close()">Confirmar aplicacao</button></div>
    </form>
  `;
}

function syncAuthState() {
  document.body.classList.toggle("is-authenticated", state.authenticated);
}

function login(isDemo = false) {
  const user = document.querySelector("#loginUser").value.trim();
  const password = loginPassword.value.trim();

  if (!isDemo && (!user || password.length < 4)) {
    showToast("Informe CPF ou e-mail e uma senha com pelo menos 4 caracteres.");
    return;
  }

  state.authenticated = true;
  sessionStorage.setItem("mk-authenticated", "true");
  syncAuthState();
  showToast(isDemo ? "Acesso demo liberado. Bem-vinda ao MK Bank." : "Login aprovado com MK Token.");
  render();
}

function logout() {
  state.authenticated = false;
  sessionStorage.removeItem("mk-authenticated");
  syncAuthState();
  if (modal.open) modal.close();
  closeMobileMenu();
  showToast("Sessao encerrada com seguranca.");
}

function closeMobileMenu() {
  sidebar.classList.remove("open");
  backdrop.classList.remove("open");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

init();
