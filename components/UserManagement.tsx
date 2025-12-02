import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUser, faShield, faWarning } from '@fortawesome/free-solid-svg-icons';
import * as ApiService from '../services/api';

interface UserManagementProps {
  currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await ApiService.listAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser.id) {
      alert('Você não pode excluir seu próprio usuário!');
      return;
    }

    try {
      await ApiService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setDeleteConfirm(null);
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário. Verifique as permissões.');
    }
  };

  if (!currentUser.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="glass-card p-8 rounded-2xl text-center">
          <FontAwesomeIcon icon={faWarning} className="text-red-500 text-4xl mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h2>
          <p className="text-gray-500">Administração de usuários do sistema</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-xl">
          <FontAwesomeIcon icon={faShield} />
          <span className="font-medium text-sm">Admin</span>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 rounded-2xl text-center">
          <p className="text-gray-500">Carregando usuários...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-gray-500 font-medium uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Tipo</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                              <FontAwesomeIcon icon={faUser} />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            {user.id === currentUser.id && (
                              <span className="text-xs text-violet-600">(Você)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.isAdmin ? (
                          <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium inline-flex items-center gap-1">
                            <FontAwesomeIcon icon={faShield} />
                            Admin
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                            Usuário
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.id === currentUser.id || user.isAdmin ? (
                          <span className="text-gray-400 text-xs">-</span>
                        ) : deleteConfirm === user.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-400 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir usuário"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="glass-card p-4 rounded-xl bg-orange-50 border border-orange-200">
        <div className="flex items-start gap-3">
          <FontAwesomeIcon icon={faWarning} className="text-orange-600 mt-1" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-1">Atenção</h3>
            <p className="text-sm text-orange-800">
              Excluir um usuário removerá permanentemente todos os seus dados: transações, cartões, categorias e orçamentos. 
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
