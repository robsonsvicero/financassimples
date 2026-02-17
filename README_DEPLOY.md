# Como publicar seu projeto React + API MongoDB

## 1. Frontend (Hostinger)
1. Rode `npm run build` na raiz do projeto.
2. Faça upload do conteúdo da pasta `dist` para o seu domínio na Hostinger (inclua o `.htaccess` para SPA).

## 2. Backend (Railway, Render, etc.)
1. Faça deploy da pasta `backend/` em um serviço Node.js (Railway, Render, Vercel, etc.).
2. Configure as variáveis de ambiente:
   - `MONGODB_URI` (string de conexão do MongoDB Atlas)
   - `MONGODB_DB` (nome do banco, ex: financassimples)
   - `PORT` (porta, ex: 3000)
3. O backend ficará disponível em uma URL (ex: https://mongodb-production-dab3.up.railway.app)

## 3. Integração
- No frontend, altere a constante `BACKEND_URL` em `services/api.mongo.ts` para a URL do backend publicado.
- O frontend irá consumir a API via fetch normalmente.

## Observações
- Nunca coloque código de acesso ao MongoDB no frontend!
- O backend pode ser expandido com autenticação, rotas extras, etc.
