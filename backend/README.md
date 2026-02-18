# Backend - Finanças$imples

Este backend unifica todas as rotas da aplicação, incluindo API principal e recuperação de senha.

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` (baseie-se no `.env.example`).
3. Inicie o servidor:
   ```bash
   npm start
   ```

## Variáveis de ambiente necessárias

- `MONGODB_URI` — String de conexão do MongoDB Atlas
- `MONGODB_DB` — Nome do banco
- `PORT` — Porta do backend (ex: 3001)
- `SMTP_HOST` — Servidor SMTP
- `SMTP_PORT` — Porta SMTP
- `SMTP_USER` — Usuário do e-mail
- `SMTP_PASS` — Senha do e-mail
- `APP_URL` — URL do frontend para montar o link de redefinição

## Endpoints principais

- `/api/transactions`, `/api/categories`, etc — API principal
- `POST /api/forgot-password` — Recebe `{ email }` e envia e-mail com link/token
- `POST /api/reset-password` — Recebe `{ token, password }` e redefine a senha

## Deploy

- Suba o backend em Railway, Render ou similar.
- O frontend (Vite/React) deve consumir os endpoints do backend.
- Configure as variáveis de ambiente no painel do serviço de hospedagem.

---

Dúvidas? Abra uma issue ou consulte a documentação do projeto.