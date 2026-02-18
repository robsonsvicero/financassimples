// Cartões de crédito
export async function getCards() {
  const res = await fetch(`${BACKEND_URL}/api/cards`, { credentials: 'include' });
  if (!res.ok) throw new Error('Erro ao buscar cartões');
  return res.json();
}

export async function addCard(data: any) {
  const res = await fetch(`${BACKEND_URL}/api/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao adicionar cartão');
  return res.json();
}

export async function updateCard(id: string, data: any) {
  const res = await fetch(`${BACKEND_URL}/api/cards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao atualizar cartão');
  return res.json();
}

export async function deleteCard(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/cards/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Erro ao deletar cartão');
}

// Categorias
export async function getCategories() {
  const res = await fetch(`${BACKEND_URL}/api/categories`, { credentials: 'include' });
  if (!res.ok) throw new Error('Erro ao buscar categorias');
  return res.json();
}

export async function addCategory(data: any) {
  const res = await fetch(`${BACKEND_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao adicionar categoria');
  return res.json();
}

export async function updateCategory(id: string, data: any) {
  const res = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao atualizar categoria');
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Erro ao deletar categoria');
}

// Orçamentos
export async function getBudgets() {
  const res = await fetch(`${BACKEND_URL}/api/budgets`, { credentials: 'include' });
  if (!res.ok) throw new Error('Erro ao buscar orçamentos');
  return res.json();
}

export async function addBudget(data: any) {
  const res = await fetch(`${BACKEND_URL}/api/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao adicionar orçamento');
  return res.json();
}

export async function updateBudget(id: string, data: any) {
  const res = await fetch(`${BACKEND_URL}/api/budgets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao atualizar orçamento');
  return res.json();
}

export async function deleteBudget(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/budgets/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Erro ao deletar orçamento');
}
// services/api.mongo.ts
// Serviço centralizado para chamadas REST ao backend MongoDB

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://robsonsvicero.net';

export async function login(email: string, password: string) {
  const res = await fetch(`${BACKEND_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Falha no login');
  return res.json();
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${BACKEND_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) throw new Error('Falha no cadastro');
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
    credentials: 'include'
  });
  if (!res.ok) return null;
  return res.json();
}

export async function logout() {
  await fetch(`${BACKEND_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });
}

// Exemplo de CRUD para transações
export async function getTransactions() {
  const res = await fetch(`${BACKEND_URL}/api/transactions`, { credentials: 'include' });
  if (!res.ok) throw new Error('Erro ao buscar transações');
  return res.json();
}

export async function addTransaction(data: any) {
  const res = await fetch(`${BACKEND_URL}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao adicionar transação');
  return res.json();
}

export async function updateTransaction(id: string, data: any) {
  const res = await fetch(`${BACKEND_URL}/api/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao atualizar transação');
  return res.json();
}

export async function deleteTransaction(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/transactions/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Erro ao deletar transação');
}

// Repita o padrão acima para cartões, categorias, orçamentos, usuários etc.

// Usuários (admin)
export async function getUsers() {
  const res = await fetch(`${BACKEND_URL}/api/users`, { credentials: 'include' });
  if (!res.ok) throw new Error('Erro ao buscar usuários');
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`${BACKEND_URL}/api/users/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Erro ao deletar usuário');
}

// Reset de senha
export async function resetPassword(token: string, password: string) {
  const res = await fetch(`${BACKEND_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  if (!res.ok) throw new Error('Erro ao redefinir senha');
}
