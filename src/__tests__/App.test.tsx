import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('Fluxo de autenticação', () => {
  it('exibe tela de login por padrão', () => {
    render(<App />);
    expect(screen.getByText(/Bem-vindo de volta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('permite alternar para cadastro', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Criar Agora/i }));
    expect(screen.getByText(/Crie sua conta/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cadastrar/i })).toBeInTheDocument();
  });

  it('exibe erro se tentar logar sem preencher', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/Erro ao fazer login/i)).toBeInTheDocument();
    });
  });
});

// Adicione outros testes para dashboard, transações, cartões, etc.
