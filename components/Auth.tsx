
import React, { useState } from 'react';
import { APP_LOGO } from '../constants';

interface AuthProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  error?: string;
  onClearError?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, onGoogleLogin, error, onClearError }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        if (!name || !email || !password) return;
        await onRegister(name, email, password);
      } else {
        if (!email || !password) return;
        await onLogin(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-indigo-50 to-blue-100 p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-scale-up">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-10 -mb-10"></div>

        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <img src={APP_LOGO} alt="Logo" className="w-20 h-20 mb-4 object-contain drop-shadow-md" />
          <h1 className="text-3xl font-bold bg-clip-text text-green-600 mb-2">
            Finanças<span className="font-light text-gray-600">$imples</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {isRegistering ? 'Crie sua conta e controle seu dinheiro.' : 'Bem-vindo de volta!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {isRegistering && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/50 focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm text-gray-800"
                placeholder="Seu nome"
                required={isRegistering}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/50 focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm text-gray-800"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/60 border border-white/50 focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm text-gray-800"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-[0.98] mt-4 flex justify-center items-center"
          >
            {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : (isRegistering ? 'Cadastrar' : 'Entrar')}
          </button>
        </form>

        <div className="relative my-6 z-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/40 backdrop-blur-sm rounded-md text-gray-500">ou continue com</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoogleLogin}
          className="relative z-10 w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>

        <div className="mt-6 text-center relative z-10">
          <p className="text-sm text-gray-500">
            {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                if (onClearError) onClearError();
              }}
              className="ml-2 font-bold text-violet-600 hover:text-violet-800 transition-colors"
            >
              {isRegistering ? 'Fazer Login' : 'Criar Agora'}
            </button>
          </p>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-8">
          © 2024 Finanças$imples. Created by Robson Svicero.
        </p>
      </div>
    </div>
  );
};

export default Auth;