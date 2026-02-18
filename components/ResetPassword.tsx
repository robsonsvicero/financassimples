import React, { useState } from 'react';
import * as ApiService from '../services/api.mongo';

const ResetPassword: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setStatus('');
    try {
      await ApiService.resetPassword(token, password);
      setStatus('Senha redefinida com sucesso! Faça login com sua nova senha.');
    } catch {
      setStatus('Token inválido ou expirado. Solicite um novo link.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center"><div className="bg-white p-8 rounded-xl shadow">Token não informado.</div></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-indigo-50 to-blue-100 p-4">
      <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-violet-700">Redefinir senha</h2>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3"
          placeholder="Nova senha"
        />
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-3"
          placeholder="Confirme a nova senha"
        />
        <button
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl mt-2"
          disabled={loading || !password || password !== confirm}
          onClick={handleReset}
        >
          {loading ? 'Enviando...' : 'Redefinir senha'}
        </button>
        {status && <p className="mt-3 text-sm text-gray-600 text-center">{status}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
