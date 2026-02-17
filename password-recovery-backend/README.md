# Backend de Recuperação de Senha

Este backend fornece endpoints para:
- Solicitar recuperação de senha (envia e-mail com token)
- Redefinir senha usando o token

## Variáveis de ambiente necessárias

- `MONGODB_URI` — String de conexão do MongoDB (mesmo banco do app)
- `MONGODB_DB` — Nome do banco
- `SMTP_HOST` — Servidor SMTP
- `SMTP_PORT` — Porta SMTP
- `SMTP_USER` — Usuário do e-mail
- `SMTP_PASS` — Senha do e-mail
- `APP_URL` — URL do frontend para montar o link de redefinição

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor:
   ```bash
   npm start
   ```

## Endpoints

- `POST /forgot-password` — Recebe `{ email }` e envia e-mail com link/token
- `POST /reset-password` — Recebe `{ token, password }` e redefine a senha
