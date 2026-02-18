import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('Fluxo de transações', () => {
  it('exibe dashboard após login simulado', async () => {
    // Simulação: mock do usuário autenticado
    // Aqui você pode mockar o ApiService para retornar um usuário
    // Exemplo:
    // jest.spyOn(ApiService, 'getCurrentUser').mockResolvedValue({ user: { id: '1', name: 'Teste' } });
    // ...
    // render(<App />);
    // await waitFor(() => expect(screen.getByText(/Dashboard/i)).toBeInTheDocument());
  });

  it('permite adicionar uma transação (mock)', async () => {
    // Simule o login e navegue até a tela de transações
    // Preencha o formulário e envie
    // Verifique se a transação aparece na lista
  });
});

// Adicione outros testes para cartões, categorias, orçamento, etc.
