import React, { useState } from 'react';
import { Category } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import { ICON_MAP } from '../constants';

interface CategoriesManagerProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  categories,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Tag',
    color: 'text-gray-500',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE' | 'BOTH',
  });

  const iconOptions = Object.keys(ICON_MAP);
  const colorOptions = [
    { value: 'text-red-500', label: 'Vermelho' },
    { value: 'text-orange-500', label: 'Laranja' },
    { value: 'text-yellow-500', label: 'Amarelo' },
    { value: 'text-green-500', label: 'Verde' },
    { value: 'text-blue-500', label: 'Azul' },
    { value: 'text-indigo-500', label: 'Índigo' },
    { value: 'text-purple-500', label: 'Roxo' },
    { value: 'text-pink-500', label: 'Rosa' },
    { value: 'text-gray-500', label: 'Cinza' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      const category = categories.find(c => c.id === editingId);
      if (category) {
        onEdit({ ...category, ...formData });
      }
      setEditingId(null);
    } else {
      onAdd(formData);
    }

    setFormData({
      name: '',
      icon: 'Tag',
      color: 'text-gray-500',
      type: 'EXPENSE',
    });
    setIsAdding(false);
  };

  const startEdit = (category: Category) => {
    setFormData({
      name: category.name,
      icon: category.icon || 'Tag',
      color: category.color || 'text-gray-500',
      type: category.type,
    });
    setEditingId(category.id);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      icon: 'Tag',
      color: 'text-gray-500',
      type: 'EXPENSE',
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return <FontAwesomeIcon icon={faTag} />;
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <FontAwesomeIcon icon={IconComponent} /> : <FontAwesomeIcon icon={faTag} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Categorias</h2>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categoria(s)</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            Nova Categoria
          </button>
        )}
      </div>

      {/* Formulário de Adição/Edição */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-lg text-gray-800">
            {editingId ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="Ex: Alimentação"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
              >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
                <option value="BOTH">Ambos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
              >
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
              >
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
            >
              {editingId ? 'Salvar' : 'Adicionar'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="glass-card p-4 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`${category.color}`}>
                  {getCategoryIcon(category.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{category.name}</p>
                  <p className="text-xs text-gray-500">
                    {category.type === 'INCOME'
                      ? 'Receita'
                      : category.type === 'EXPENSE'
                      ? 'Despesa'
                      : 'Ambos'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <FontAwesomeIcon icon={faPencil} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
                      onDelete(category.id);
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesManager;
