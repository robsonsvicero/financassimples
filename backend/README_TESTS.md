# Testes Automatizados - Finanças$imples

## Como rodar os testes

1. Instale as dependências de teste:
   ```bash
   npm install --save-dev jest supertest
   ```
2. Adicione ao seu package.json:
   ```json
   "scripts": {
     "test": "jest"
   }
   ```
3. Execute:
   ```bash
   npm test
   ```

## O que está coberto
- Testes básicos de autenticação (cadastro e login)
- Fácil de expandir para outras rotas

## Recomendações
- Adicione testes para todas as rotas críticas antes de publicar em produção.
- Use CI/CD para rodar os testes automaticamente a cada push.
