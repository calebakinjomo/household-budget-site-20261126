// Hearth & Ledger — the five pages. Each page reads its numbers from store.js,
// so adding, editing or deleting a transaction updates every total at once.

import { CATEGORIES, MONTH, SAVINGS_TARGET } from './data.js';
import {
  addGoal, addToGoal, addTransaction, biggestExpense, budgetFor, categoryById,
  dailySpending, deleteGoal, deleteTransaction, goalById, incomeTotal,
  leftToSpend, money, plannedTotal, projectedMonthEnd, resetToSample,
  savingsRate, setBudget, spentByCategory, spentTotal, state, totalGoalTarget,
  totalSaved, updateTransaction,
} from './store.js';
import { dailyChart, donutChart } from './charts.js';

const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');

// Filters on the Transactions page, kept while the user stays on the page.
const txFilter = { search: '', category: 'all', type: 'all' };

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(iso) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, d] = iso.split('-').map(Number);
  return `${months[m - 1]} ${d}`;
}

function pct(n) {
  return `${Math.round(n)}%`;
}

// ---------- shared bits ----------

function categoryBar(id) {
  const cat = categoryById(id);
  const spent = spentByCategory()[id] || 0;
  const budget = budgetFor(id);
  const ratio = budget > 0 ? spent / budget : 0;
  const over = spent - budget;
  const barClass = over > 0 ? 'coral' : ratio >= 0.85 ? 'gold' : 'sage';
  const pill = over > 0
    ? `<span class="pill over">${money(over)} over</span>`
    : ratio >= 1
      ? `<span class="pill near">Fully used</span>`
      : ratio >= 0.85
        ? `<span class="pill near">${money(budget - spent)} left</span>`
        : `<span class="pill on-track">${money(budget - spent)} left</span>`;
  return `<div class="cat-row">
    <div class="cat-top">
      <span class="cat-name"><span class="cat-dot" style="background:${cat.color}"></span>${esc(cat.name)}</span>
      <span class="cat-fig">${money(spent)} <span class="hide-sm">of ${money(budget)}</span> ${pill}</span>
    </div>
    <div class="bar ${barClass}" role="img" aria-label="${esc(cat.name)}: ${money(spent)} spent of ${money(budget)} budgeted"><span style="width:${Math.min(100, ratio * 100).toFixed(1)}%"></span></div>
    <div class="cat-meta"><span>${pct(ratio * 100)} of budget used</span><span>${money(budget - spent)} ${over > 0 ? 'over' : 'remaining'}</span></div>
  </div>`;
}

function transactionRows(list) {
  if (!list.length) return `<tr><td colspan="5" class="empty">No transactions match. Try clearing the filters.</td></tr>`;
  return list.map((t) => {
    const cat = t.type === 'income' ? { name: 'Income', color: '#4e7d5b' } : categoryById(t.category);
    const amount = t.type === 'income'
      ? `<span class="amt-in">+${money(t.amount)}</span>`
      : `<span class="amt-out">&minus;${money(t.amount)}</span>`;
    return `<tr>
      <td>${fmtDate(t.date)}</td>
      <td>${esc(t.description)}</td>
      <td><span class="cat-dot" style="background:${cat.color}"></span>${esc(cat.name)}</td>
      <td class="num">${amount}</td>
      <td class="row-actions">
        <button class="btn ghost small" data-action="edit-tx" data-id="${t.id}">Edit</button>
        <button class="btn danger small" data-action="delete-tx" data-id="${t.id}">Delete</button>
      </td>
    </tr>`;
  }).join('');
}

// Newest first; same-date ties break by id so the order is stable
// (the Transactions page sorts by date only and keeps insertion order).
function recentTransactions(n) {
  return [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1))
    .slice(0, n);
}

// ---------- Dashboard ----------

function renderDashboard() {
  const income = incomeTotal();
  const spent = spentTotal();
  const planned = plannedTotal();
  const left = leftToSpend();
  const rate = savingsRate();
  const byCat = spentByCategory();
  const sortedCats = [...CATEGORIES].sort((a, b) => (byCat[b.id] || 0) - (byCat[a.id] || 0));
  const goals = state.goals;
  const savedPct = totalGoalTarget() > 0 ? (totalSaved() / totalGoalTarget()) * 100 : 0;

  app.innerHTML = `
  <div class="page-head">
    <h1>November at a glance</h1>
    <p class="lede">The Okafors have ${money(left)} left to spend after this month's savings — with four days still to go.</p>
  </div>

  <div class="grid grid-4" style="margin-bottom:16px">
    <section class="card stat"><div class="label">Income in</div><div class="value">${money(income)}</div><p class="note">Two paydays, Nov 1</p></section>
    <section class="card stat"><div class="label">Spent so far</div><div class="value">${money(spent)}</div><p class="note">of ${money(planned)} planned &middot; ${pct((spent / planned) * 100)} used</p></section>
    <section class="card stat ${left < 0 ? 'warn' : 'good'}"><div class="label">Left to spend</div><div class="value">${money(left)}</div><p class="note">After ${money(SAVINGS_TARGET)} set aside for savings</p></section>
    <section class="card stat"><div class="label">Savings rate</div><div class="value">${rate.toFixed(1)}%</div><p class="note">${money(SAVINGS_TARGET)} a month into the goals</p></section>
  </div>

  <div class="grid grid-main">
    <div class="grid" style="gap:16px">
      <section class="card">
        <div class="card-head"><h2>Spending through the month</h2><a class="link" href="#/insights">See insights</a></div>
        <p class="sub">Daily spending (bars) and the running total (gold line), Nov 1&ndash;25.</p>
        <div class="chart-wrap">${dailyChart(dailySpending())}</div>
        <p class="hint">Nov 1 is the month's tallest bar — the $1,450 rent lands that day. The gold line is the running total.</p>
      </section>
      <section class="card">
        <div class="card-head"><h2>Recent transactions</h2><a class="link" href="#/transactions">All transactions</a></div>
        <table>
          <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th></tr></thead>
          <tbody>${transactionRows(recentTransactions(8)).replace(/<td class="row-actions">[\s\S]*?<\/td>/g, '')}</tbody>
        </table>
      </section>
    </div>
    <div class="grid" style="gap:16px">
      <section class="card">
        <div class="card-head"><h2>Budgets</h2><a class="link" href="#/budgets">Manage budgets</a></div>
        <p class="sub">One category is over budget this month.</p>
        ${sortedCats.slice(0, 6).map((c) => categoryBar(c.id)).join('')}
      </section>
      <section class="card">
        <div class="card-head"><h2>Savings goals</h2><a class="link" href="#/goals">All goals</a></div>
        <p class="sub">${money(totalSaved())} saved toward ${money(totalGoalTarget())} &middot; ${pct(savedPct)} there.</p>
        ${goals.slice(0, 3).map((g) => {
          const p = g.target > 0 ? (g.saved / g.target) * 100 : 0;
          return `<div class="cat-row"><div class="cat-top"><span class="cat-name">${esc(g.name)}</span><span class="cat-fig">${money(g.saved)} of ${money(g.target)}</span></div>
          <div class="bar sage"><span style="width:${Math.min(100, p).toFixed(1)}%"></span></div>
          <div class="cat-meta"><span>${pct(p)} saved</span><span>${money(g.target - g.saved)} to go</span></div></div>`;
        }).join('')}
      </section>
    </div>
  </div>
  <p style="margin-top:18px"><button class="btn secondary small" data-action="reset-sample">Reset to the sample month</button>
  <span class="hint"> &nbsp;Changes are saved in this browser only. Reset restores the Okafors' original November figures.</span></p>`;
}

// ---------- Transactions ----------

function filteredTransactions() {
  const q = txFilter.search.trim().toLowerCase();
  return state.transactions.filter((t) => {
    if (txFilter.category !== 'all' && t.category !== txFilter.category) return false;
    if (txFilter.type !== 'all' && t.type !== txFilter.type) return false;
    if (q && !t.description.toLowerCase().includes(q) && !categoryById(t.category).name.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function renderTransactions() {
  const list = filteredTransactions();
  const expenses = list.filter((t) => t.type === 'expense');
  const income = list.filter((t) => t.type === 'income');
  const expTotal = expenses.reduce((s, t) => s + t.amount, 0);
  const incTotal = income.reduce((s, t) => s + t.amount, 0);

  app.innerHTML = `
  <div class="page-head">
    <h1>Transactions</h1>
    <p class="lede">Every dollar in and out for November. Add, edit or delete anything — the totals, bars and charts update straight away.</p>
  </div>
  <div class="toolbar">
    <input type="search" id="tx-search" placeholder="Search descriptions or categories" value="${esc(txFilter.search)}" aria-label="Search transactions" style="max-width:260px">
    <select id="tx-category" aria-label="Filter by category" style="max-width:200px">
      <option value="all">All categories</option>
      ${CATEGORIES.map((c) => `<option value="${c.id}" ${txFilter.category === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
    </select>
    <select id="tx-type" aria-label="Filter by type" style="max-width:160px">
      <option value="all" ${txFilter.type === 'all' ? 'selected' : ''}>Income &amp; spending</option>
      <option value="expense" ${txFilter.type === 'expense' ? 'selected' : ''}>Spending only</option>
      <option value="income" ${txFilter.type === 'income' ? 'selected' : ''}>Income only</option>
    </select>
    <span class="spacer"></span>
    <button class="btn" data-action="add-tx">+ Add transaction</button>
  </div>
  <section class="card">
    <p class="sub" style="margin-bottom:10px">${list.length} shown &middot; ${expenses.length} expenses totalling ${money(expTotal)} &middot; ${income.length} paydays totalling ${money(incTotal)}</p>
    <div style="overflow-x:auto">
    <table>
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>${transactionRows(list)}</tbody>
    </table>
    </div>
  </section>`;

  document.getElementById('tx-search').addEventListener('input', (e) => { txFilter.search = e.target.value; renderTransactionsKeepFocus('tx-search'); });
  document.getElementById('tx-category').addEventListener('change', (e) => { txFilter.category = e.target.value; renderTransactions(); });
  document.getElementById('tx-type').addEventListener('change', (e) => { txFilter.type = e.target.value; renderTransactions(); });
}

function renderTransactionsKeepFocus(id) {
  const pos = document.getElementById(id);
  const start = pos ? pos.selectionStart : 0;
  renderTransactions();
  const el = document.getElementById(id);
  if (el) { el.focus(); el.setSelectionRange(start, start); }
}

// ---------- Budgets ----------

function renderBudgets() {
  const byCat = spentByCategory();
  const planned = plannedTotal();
  const spent = spentTotal();
  const overCats = CATEGORIES.filter((c) => (byCat[c.id] || 0) > budgetFor(c.id));

  app.innerHTML = `
  <div class="page-head">
    <h1>Budgets</h1>
    <p class="lede">${money(spent)} spent of ${money(planned)} planned. ${overCats.length ? `${overCats.map((c) => esc(c.name)).join(' and ')} ${overCats.length > 1 ? 'are' : 'is'} over budget — tap Edit budget to adjust a limit.` : 'Every category is inside its budget.'}</p>
  </div>
  <div class="grid grid-3">
    ${CATEGORIES.map((c) => {
      const s = byCat[c.id] || 0;
      const b = budgetFor(c.id);
      const ratio = b > 0 ? s / b : 0;
      const over = s - b;
      const barClass = over > 0 ? 'coral' : ratio >= 0.85 ? 'gold' : 'sage';
      return `<section class="card" data-cat="${c.id}">
        <div class="card-head"><h3><span class="cat-dot" style="background:${c.color}"></span>${esc(c.name)}</h3>
        ${over > 0 ? '<span class="pill over">Over budget</span>' : ratio >= 1 ? '<span class="pill near">Fully used</span>' : ratio >= 0.85 ? '<span class="pill near">Nearly there</span>' : '<span class="pill on-track">On track</span>'}</div>
        <p style="font-size:26px;font-weight:800;margin:8px 0 2px;font-variant-numeric:tabular-nums">${money(s)} <span style="font-size:15px;color:var(--muted);font-weight:600">of ${money(b)}</span></p>
        <div class="bar ${barClass}"><span style="width:${Math.min(100, ratio * 100).toFixed(1)}%"></span></div>
        <p class="hint" style="margin-top:8px">${over > 0 ? `${money(over)} over the limit` : `${money(b - s)} left &middot; ${pct(ratio * 100)} used`}</p>
        <div class="budget-edit" style="margin-top:10px">
          <button class="btn secondary small" data-action="edit-budget" data-id="${c.id}">Edit budget</button>
        </div>
      </section>`;
    }).join('')}
  </div>`;
}

// ---------- Savings goals ----------

function renderGoals() {
  const saved = totalSaved();
  const target = totalGoalTarget();
  const overall = target > 0 ? (saved / target) * 100 : 0;

  app.innerHTML = `
  <div class="page-head">
    <h1>Savings goals</h1>
    <p class="lede">${money(saved)} saved toward ${money(target)} across ${state.goals.length} goals — ${pct(overall)} of the way there. The family sets aside ${money(SAVINGS_TARGET)} a month automatically: $300 to the emergency fund, $150 each to the holiday and the car, $100 to college.</p>
  </div>
  <div class="toolbar"><span class="spacer"></span><button class="btn" data-action="add-goal">+ New goal</button></div>
  <div class="grid grid-2">
    ${state.goals.map((g) => {
      const p = g.target > 0 ? (g.saved / g.target) * 100 : 0;
      const done = g.saved >= g.target;
      return `<section class="card goal-card">
        <div class="goal-top"><h3>${esc(g.name)}</h3><span class="goal-fig">${money(g.saved)} / ${money(g.target)}</span></div>
        <div class="bar ${done ? 'sage' : ''}"><span style="width:${Math.min(100, p).toFixed(1)}%"></span></div>
        <div class="goal-meta"><span>${pct(p)} saved</span><span>${done ? 'Goal reached!' : `${money(g.target - g.saved)} to go`}</span></div>
        <p class="hint">${esc(g.note || '')}</p>
        <div class="goal-actions">
          <button class="btn small" data-action="add-funds" data-id="${g.id}">Add funds</button>
          <button class="btn danger small" data-action="delete-goal" data-id="${g.id}">Delete goal</button>
        </div>
      </section>`;
    }).join('')}
  </div>
  ${state.goals.length === 0 ? '<p class="empty">No goals yet — add your first one above.</p>' : ''}`;
}

// ---------- Insights ----------

function renderInsights() {
  const byCat = spentByCategory();
  const slices = CATEGORIES.map((c) => ({ name: c.name, value: byCat[c.id] || 0, color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  const spent = spentTotal();
  const avg = spent / MONTH.dayToday;
  const projected = projectedMonthEnd();
  const planned = plannedTotal();
  const big = biggestExpense();
  const top = slices[0];

  app.innerHTML = `
  <div class="page-head">
    <h1>Insights</h1>
    <p class="lede">Where November's money actually went — and what to do about it before the month ends.</p>
  </div>
  <div class="grid grid-main">
    <section class="card">
      <h2>Where the money went</h2>
      <p class="sub">Share of ${money(spent)} spent so far, Nov 1&ndash;25.</p>
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center">
        <div>${donutChart(slices)}</div>
        <div class="legend" style="flex:1;min-width:200px">
          ${slices.map((s) => `<span><span class="cat-dot" style="background:${s.color}"></span>${esc(s.name)} — ${money(s.value)} (${pct((s.value / spent) * 100)})</span>`).join('')}
        </div>
      </div>
    </section>
    <section class="card">
      <h2>The numbers that matter</h2>
      <div class="kv"><span>Daily average spend</span><b>${money(avg)}</b></div>
      <div class="kv"><span>Projected month-end spend</span><b>${money(projected)}</b></div>
      <div class="kv"><span>Planned for the month</span><b>${money(planned)}</b></div>
      <div class="kv"><span>Biggest single expense</span><b>${big ? `${esc(big.description)} — ${money(big.amount)}` : '—'}</b></div>
      <div class="kv"><span>Biggest category</span><b>${top ? `${esc(top.name)} — ${money(top.value)}` : '—'}</b></div>
      <div class="kv"><span>Days left in November</span><b>${MONTH.daysInMonth - MONTH.dayToday} days</b></div>
      <div class="kv"><span>Left to spend</span><b>${money(leftToSpend())}</b></div>
    </section>
  </div>
  <section class="card" style="margin-top:16px">
    <h2>What to do next</h2>
    <div class="tip"><strong>Dining out is ${money((byCat.dining || 0) - budgetFor('dining'))} over budget</strong> with four days left. One home-cooked dinner instead of a takeaway brings it back in line.</div>
    <div class="tip">At the current pace the month ends around <strong>${money(projected)}</strong> — ${projected > planned ? `${money(projected - planned)} over the ${money(planned)} plan` : `${money(planned - projected)} under the plan`}. Groceries are the lever: ${money(budgetFor('groceries') - (byCat.groceries || 0))} of the grocery budget is still unspent.</div>
    <div class="tip"><strong>${money(SAVINGS_TARGET)} a month is going to the goals</strong> — that's a ${savingsRate().toFixed(1)}% savings rate. Keeping it up reaches the emergency fund in about ${Math.ceil((8000 - (goalById('emergency')?.saved || 0)) / 300)} more months.</div>
    <div class="tip">Subscriptions total <strong>${money(byCat.subscriptions || 0)}</strong> a month across six small charges. The magazine app ($7.99) hasn't been opened in weeks — cancelling it saves $96 a year.</div>
  </section>`;
}

// ---------- modals ----------

function openModal(html) {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="backdrop"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  const first = modalRoot.querySelector('input, select, textarea, button');
  if (first) first.focus();
}

function closeModal() {
  modalRoot.innerHTML = '';
}

function transactionForm(tx) {
  const isEdit = !!tx;
  const t = tx || { date: '2026-11-26', description: '', category: 'groceries', amount: '', type: 'expense' };
  openModal(`
    <h2>${isEdit ? 'Edit transaction' : 'Add a transaction'}</h2>
    <p class="sub">${isEdit ? 'Change anything — the totals update as soon as you save.' : 'It joins November\'s list and every total updates straight away.'}</p>
    <form id="tx-form" data-id="${tx ? tx.id : ''}">
      <p class="form-error" id="tx-error"></p>
      <div class="form-grid">
        <div class="field"><label for="f-date">Date</label><input id="f-date" name="date" type="date" value="${esc(t.date)}" min="2026-11-01" max="2026-11-30" required></div>
        <div class="field"><label for="f-amount">Amount ($)</label><input id="f-amount" name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" value="${t.amount}" placeholder="0.00" required></div>
        <div class="field full"><label for="f-desc">Description</label><input id="f-desc" name="description" type="text" value="${esc(t.description)}" placeholder="e.g. FreshMart weekly shop" maxlength="80" required></div>
        <div class="field"><label for="f-type">Type</label>
          <select id="f-type" name="type">
            <option value="expense" ${t.type === 'expense' ? 'selected' : ''}>Spending</option>
            <option value="income" ${t.type === 'income' ? 'selected' : ''}>Income</option>
          </select></div>
        <div class="field"><label for="f-cat">Category</label>
          <select id="f-cat" name="category">
            ${CATEGORIES.map((c) => `<option value="${c.id}" ${t.category === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          </select></div>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn secondary" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn">${isEdit ? 'Save changes' : 'Add transaction'}</button>
      </div>
    </form>`);
  const typeSel = document.getElementById('f-type');
  const catSel = document.getElementById('f-cat');
  const syncCat = () => { catSel.disabled = typeSel.value === 'income'; };
  typeSel.addEventListener('change', syncCat);
  syncCat();
  document.getElementById('tx-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const err = document.getElementById('tx-error');
    if (!data.description.trim()) { err.textContent = 'Give the transaction a short description.'; return; }
    if (!(Number(data.amount) > 0)) { err.textContent = 'Enter an amount above $0.'; return; }
    if (!data.date) { err.textContent = 'Pick a date in November.'; return; }
    if (isEdit) updateTransaction(tx.id, data);
    else addTransaction(data);
    closeModal();
    route();
  });
}

function confirmDelete(tx) {
  openModal(`
    <h2>Delete this transaction?</h2>
    <p class="sub">${esc(tx.description)} — ${money(tx.amount)} on ${fmtDate(tx.date)}. The totals will update straight away.</p>
    <div class="modal-actions">
      <button class="btn secondary" data-action="close-modal">Keep it</button>
      <button class="btn" data-action="confirm-delete-tx" data-id="${tx.id}" style="background:var(--coral)">Delete</button>
    </div>`);
}

function addFundsForm(goal) {
  openModal(`
    <h2>Add funds to ${esc(goal.name)}</h2>
    <p class="sub">${money(goal.saved)} saved of ${money(goal.target)} so far.</p>
    <form id="funds-form" data-id="${goal.id}">
      <p class="form-error" id="funds-error"></p>
      <div class="field"><label for="funds-amount">Amount to add ($)</label><input id="funds-amount" name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0.00" required></div>
      <div class="modal-actions">
        <button type="button" class="btn secondary" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn">Add funds</button>
      </div>
    </form>`);
  document.getElementById('funds-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(new FormData(e.target).get('amount'));
    if (!(amount > 0)) { document.getElementById('funds-error').textContent = 'Enter an amount above $0.'; return; }
    addToGoal(goal.id, amount);
    closeModal();
    route();
  });
}

function newGoalForm() {
  openModal(`
    <h2>Start a new savings goal</h2>
    <p class="sub">Give it a name and a target — you can add funds to it any time.</p>
    <form id="goal-form">
      <p class="form-error" id="goal-error"></p>
      <div class="field"><label for="g-name">Goal name</label><input id="g-name" name="name" type="text" placeholder="e.g. New sofa" maxlength="60" required></div>
      <div class="form-grid">
        <div class="field"><label for="g-target">Target ($)</label><input id="g-target" name="target" type="number" min="1" step="0.01" inputmode="decimal" placeholder="0.00" required></div>
        <div class="field"><label for="g-saved">Already saved ($)</label><input id="g-saved" name="saved" type="number" min="0" step="0.01" inputmode="decimal" value="0"></div>
      </div>
      <div class="field"><label for="g-note">Why this goal? (optional)</label><input id="g-note" name="note" type="text" placeholder="e.g. For the living room" maxlength="100"></div>
      <div class="modal-actions">
        <button type="button" class="btn secondary" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn">Create goal</button>
      </div>
    </form>`);
  document.getElementById('goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (!data.name.trim()) { document.getElementById('goal-error').textContent = 'Give the goal a name.'; return; }
    if (!(Number(data.target) > 0)) { document.getElementById('goal-error').textContent = 'Set a target above $0.'; return; }
    addGoal(data);
    closeModal();
    route();
  });
}

function confirmDeleteGoal(goal) {
  openModal(`
    <h2>Delete “${esc(goal.name)}”?</h2>
    <p class="sub">${money(goal.saved)} saved toward ${money(goal.target)} will be removed with it.</p>
    <div class="modal-actions">
      <button class="btn secondary" data-action="close-modal">Keep it</button>
      <button class="btn" data-action="confirm-delete-goal" data-id="${goal.id}" style="background:var(--coral)">Delete goal</button>
    </div>`);
}

function budgetEditForm(cat) {
  const card = document.querySelector(`[data-cat="${cat.id}"] .budget-edit`);
  if (!card) return;
  card.innerHTML = `
    <form class="budget-form" data-id="${cat.id}" style="display:flex;gap:8px;align-items:center">
      <label for="budget-input-${cat.id}" style="margin:0">New budget $</label>
      <input id="budget-input-${cat.id}" name="amount" type="number" min="0" step="1" value="${budgetFor(cat.id)}" style="max-width:110px" required>
      <button type="submit" class="btn small">Save</button>
      <button type="button" class="btn ghost small" data-action="cancel-budget-edit">Cancel</button>
    </form>`;
  card.querySelector('input').focus();
  card.querySelector('input').select();
  card.querySelector('.budget-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number(new FormData(e.target).get('amount'));
    if (!(amount >= 0)) return;
    setBudget(cat.id, amount);
    route();
  });
}

// ---------- routing & global events ----------

const ROUTES = {
  '': renderDashboard,
  'transactions': renderTransactions,
  'budgets': renderBudgets,
  'goals': renderGoals,
  'insights': renderInsights,
};

export function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const render = ROUTES[hash] || renderDashboard;
  closeModal();
  render();
  document.querySelectorAll('.site-nav a').forEach((a) => {
    a.classList.toggle('active', (a.dataset.route || '') === (ROUTES[hash] ? hash : ''));
  });
  window.scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  const backdrop = e.target.closest('[data-action="backdrop"]');
  if (backdrop && e.target === backdrop) { closeModal(); return; }
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (action === 'close-modal') closeModal();
  else if (action === 'add-tx') transactionForm(null);
  else if (action === 'edit-tx') {
    const tx = state.transactions.find((t) => t.id === el.dataset.id);
    if (tx) transactionForm(tx);
  } else if (action === 'delete-tx') {
    const tx = state.transactions.find((t) => t.id === el.dataset.id);
    if (tx) confirmDelete(tx);
  } else if (action === 'confirm-delete-tx') {
    deleteTransaction(el.dataset.id);
    closeModal();
    route();
  } else if (action === 'reset-sample') {
    resetToSample();
    route();
  } else if (action === 'edit-budget') {
    budgetEditForm(categoryById(el.dataset.id));
  } else if (action === 'cancel-budget-edit') {
    route();
  } else if (action === 'add-funds') {
    const goal = goalById(el.dataset.id);
    if (goal) addFundsForm(goal);
  } else if (action === 'add-goal') {
    newGoalForm();
  } else if (action === 'delete-goal') {
    const goal = goalById(el.dataset.id);
    if (goal) confirmDeleteGoal(goal);
  } else if (action === 'confirm-delete-goal') {
    deleteGoal(el.dataset.id);
    closeModal();
    route();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
