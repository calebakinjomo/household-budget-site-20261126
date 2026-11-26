// Hearth & Ledger — state: loads the sample month, keeps every change in
// localStorage (this browser only, no network), and computes the totals every
// view reads from. All money is stored as integer cents to avoid float drift.

import { CATEGORIES, GOALS, MONTH, SAVINGS_TARGET, TRANSACTIONS } from './data.js';

const STORAGE_KEY = 'hearth-ledger-v1';

function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

function fromCents(cents) {
  return cents / 100;
}

function cloneSample() {
  return {
    version: 1,
    transactions: TRANSACTIONS.map((t) => ({ ...t })),
    budgets: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.budget])),
    goals: GOALS.map((g) => ({ ...g })),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSample();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.transactions)) return cloneSample();
    // A saved state is only trusted whole: a missing budgets map or goals
    // list (e.g. from a hand-edited or older save) would crash every view
    // that reads them, so fall back to the sample values for those parts.
    if (!parsed.budgets || typeof parsed.budgets !== 'object') {
      parsed.budgets = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.budget]));
    }
    if (!Array.isArray(parsed.goals)) parsed.goals = GOALS.map((g) => ({ ...g }));
    return parsed;
  } catch {
    return cloneSample();
  }
}

export const state = loadState();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the page still works for this visit.
  }
}

export function resetToSample() {
  const fresh = cloneSample();
  state.transactions = fresh.transactions;
  state.budgets = fresh.budgets;
  state.goals = fresh.goals;
  save();
}

export function money(amount) {
  return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function moneyShort(amount) {
  const n = Number(amount);
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return '$' + n.toFixed(0);
}

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: 'Income', color: '#4e7d5b' };
}

export function budgetFor(id) {
  return state.budgets[id] ?? 0;
}

export function setBudget(id, amount) {
  state.budgets[id] = Math.max(0, Math.round(Number(amount) * 100) / 100);
  save();
}

// --- computed totals (all derived from the transactions, so every edit flows through) ---

export function incomeTotal() {
  return fromCents(state.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + toCents(t.amount), 0));
}

export function spentTotal() {
  return fromCents(state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + toCents(t.amount), 0));
}

export function spentByCategory() {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of state.transactions) {
    if (t.type === 'expense' && out[t.category] !== undefined) out[t.category] += t.amount;
  }
  for (const k of Object.keys(out)) out[k] = Math.round(out[k] * 100) / 100;
  return out;
}

export function plannedTotal() {
  return CATEGORIES.reduce((sum, c) => sum + budgetFor(c.id), 0);
}

export function leftToSpend() {
  return Math.round((incomeTotal() - spentTotal() - SAVINGS_TARGET) * 100) / 100;
}

export function savingsRate() {
  const income = incomeTotal();
  return income > 0 ? (SAVINGS_TARGET / income) * 100 : 0;
}

export function dailySpending() {
  // One bar per day of the month so far: [{ day, spent }], day 1..dayToday.
  const days = Array.from({ length: MONTH.dayToday }, (_, i) => ({ day: i + 1, spent: 0 }));
  for (const t of state.transactions) {
    if (t.type !== 'expense') continue;
    const day = Number(t.date.slice(8, 10));
    if (day >= 1 && day <= MONTH.dayToday) days[day - 1].spent += t.amount;
  }
  for (const d of days) d.spent = Math.round(d.spent * 100) / 100;
  return days;
}

export function projectedMonthEnd() {
  // Straight-line projection from the daily average so far.
  const spent = spentTotal();
  const avg = spent / MONTH.dayToday;
  return Math.round(avg * MONTH.daysInMonth * 100) / 100;
}

export function biggestExpense() {
  const expenses = state.transactions.filter((t) => t.type === 'expense');
  if (!expenses.length) return null;
  return expenses.reduce((a, b) => (b.amount > a.amount ? b : a));
}

// --- transactions: add / edit / delete ---

function nextId() {
  let n = state.transactions.length + 1;
  while (state.transactions.some((t) => t.id === 't' + String(n).padStart(2, '0'))) n += 1;
  return 't' + String(n).padStart(2, '0');
}

export function addTransaction({ date, description, category, amount, type }) {
  const tx = {
    id: nextId(),
    date,
    description: description.trim(),
    category: type === 'income' ? 'income' : category,
    amount: Math.round(Number(amount) * 100) / 100,
    type,
  };
  state.transactions.push(tx);
  state.transactions.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  save();
  return tx;
}

export function updateTransaction(id, { date, description, category, amount, type }) {
  const tx = state.transactions.find((t) => t.id === id);
  if (!tx) return null;
  tx.date = date;
  tx.description = description.trim();
  tx.category = type === 'income' ? 'income' : category;
  tx.amount = Math.round(Number(amount) * 100) / 100;
  tx.type = type;
  state.transactions.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  save();
  return tx;
}

export function deleteTransaction(id) {
  const i = state.transactions.findIndex((t) => t.id === id);
  if (i === -1) return false;
  state.transactions.splice(i, 1);
  save();
  return true;
}

// --- savings goals: add funds, create, edit, delete ---

export function goalById(id) {
  return state.goals.find((g) => g.id === id);
}

export function addToGoal(id, amount) {
  const goal = goalById(id);
  if (!goal) return null;
  goal.saved = Math.round((goal.saved + Number(amount)) * 100) / 100;
  save();
  return goal;
}

export function addGoal({ name, target, saved, note }) {
  const goal = {
    id: 'g' + Date.now().toString(36),
    name: name.trim(),
    target: Math.round(Number(target) * 100) / 100,
    saved: Math.round(Number(saved || 0) * 100) / 100,
    note: (note || '').trim(),
  };
  state.goals.push(goal);
  save();
  return goal;
}

export function deleteGoal(id) {
  const i = state.goals.findIndex((g) => g.id === id);
  if (i === -1) return false;
  state.goals.splice(i, 1);
  save();
  return true;
}

export function totalSaved() {
  return Math.round(state.goals.reduce((s, g) => s + g.saved, 0) * 100) / 100;
}

export function totalGoalTarget() {
  return Math.round(state.goals.reduce((s, g) => s + g.target, 0) * 100) / 100;
}
