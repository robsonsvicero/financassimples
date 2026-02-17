# Finanças$imples

Um gerenciador de finanças pessoais moderno e minimalista, com controle de cartões de crédito, orçamento e dicas financeiras via IA.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral de receitas, despesas e saldo.
- **Transações**: Adicione receitas e despesas (fixas/variáveis).
- **Cartões de Crédito**: Gerencie limites, datas de fechamento e faturas agregadas.
- **Orçamento**: Defina metas de gastos por categoria.
- **Relatórios**: Extrato detalhado por período.
- **IA**: Dicas financeiras geradas pelo Google Gemini.
- **Autenticação**: Login por Email/Senha ou Google.

## 🛠️ Instalação Local (VS Code)

Siga os passos abaixo para rodar o projeto no seu computador.

### 1. Pré-requisitos
- Tenha o [Node.js](https://nodejs.org/) instalado.

### 2. Instalar Dependências
Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo chamado `.env.local` na raiz do projeto e adicione suas chaves. 
Você vai precisar de uma connection string do [MongoDB no Railway](https://railway.app/) e uma do [Google AI Studio](https://aistudio.google.com/).

```env
VITE_MONGODB_URI=sua_connection_string_do_mongodb
VITE_MONGODB_DB=financassimples
VITE_GEMINI_API_KEY=sua_chave_gemini_api
```

### 4. Configurar o Banco de Dados (MongoDB)
Crie um projeto no Railway, adicione um plugin MongoDB e copie a connection string para o arquivo .env.local.

Não é necessário criar tabelas manualmente, pois o MongoDB é NoSQL e as coleções são criadas automaticamente ao inserir dados.
  user_id uuid references auth.users not null,
  description text not null,
  amount numeric not null,
  date date not null,
  due_date date,
  type text check (type in ('INCOME', 'EXPENSE')),
  expense_type text check (expense_type in ('FIXED', 'VARIABLE')),
  category_id text not null,
  payment_method text not null,
  credit_card_id uuid references public.credit_cards(id) on delete set null,
  installment_total integer,
  installment_current integer,
  parent_id text,
  is_paid boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Orçamentos (Budgets)
create table public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  category_id text not null,
  amount numeric not null,
  month text not null, -- Formato YYYY-MM
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category_id, month)
);

-- Trigger para criar perfil automaticamente ao cadastrar usuário
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Políticas de Segurança (RLS)
alter table public.profiles enable row level security;
alter table public.credit_cards enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own cards" on credit_cards for select using (auth.uid() = user_id);
create policy "Users can insert own cards" on credit_cards for insert with check (auth.uid() = user_id);
create policy "Users can update own cards" on credit_cards for update using (auth.uid() = user_id);
create policy "Users can delete own cards" on credit_cards for delete using (auth.uid() = user_id);

create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

create policy "Users can view own budgets" on budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on budgets for update using (auth.uid() = user_id);
```

### 5. Rodar o Projeto
No terminal, execute:

```bash
npm run dev
```
O projeto estará disponível em `http://localhost:5173`.

---

## ☁️ Como Fazer Deploy (Colocar no ar)

A maneira mais fácil é usando a **Vercel** ou **Netlify**. Exemplo com Vercel:

1.  Crie um repositório no GitHub e suba este código.
2.  Crie uma conta na [Vercel](https://vercel.com).
3.  Clique em **"Add New Project"** e importe seu repositório.
4.  Nas configurações de **Environment Variables** do projeto na Vercel, adicione:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `VITE_GEMINI_API_KEY`
5.  Clique em **Deploy**.

Pronto! Seu app estará online.
