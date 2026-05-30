import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Package, Tag, Calendar, Home, Loader2 } from 'lucide-react';
import { Category, Inventory } from '../types';
import { getCategories, getInventory, createCategory, updateCategory, deleteCategory } from '../api';

export function CategoriesPage() {
  const { invId } = useParams<{ invId: string }>();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invId) {
      setError('Inventory not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all([getInventory(invId), getCategories(invId)])
      .then(([inventoryData, categoryData]) => {
        setInventory(inventoryData);
        setCategories(categoryData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, [invId]);

  const handleCreate = async () => {
    if (!invId) return;
    const name = window.prompt('Category name');
    if (!name) return;
    const description = window.prompt('Description (optional)') || undefined;
    try {
      setIsLoading(true);
      await createCategory(invId, name, description);
      const cats = await getCategories(invId);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (cat: Category) => {
    if (!invId) return;
    const name = window.prompt('Category name', cat.name);
    if (!name) return;
    const description = window.prompt('Description (optional)', cat.description ?? '') || undefined;
    try {
      setIsLoading(true);
      await updateCategory(invId, cat.id, name, description);
      const cats = await getCategories(invId);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!invId) return;
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    try {
      setIsLoading(true);
      await deleteCategory(invId, cat.id);
      const cats = await getCategories(invId);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/inventories" className="hover:text-white transition-colors">
          Inventories
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white font-medium">{inventory?.name ?? 'Inventory'}</span>
      </nav>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-1">{inventory?.name}</h2>
        <p className="text-sm text-slate-400 mb-4">{inventory?.description ?? ''}</p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4" />
            {inventory?.category_count ?? 0} categories
          </div>
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4" />
            {inventory?.item_count ?? 0} items
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Created {inventory ? formatDate(inventory.created_at) : '—'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Categories</h3>
        <button onClick={handleCreate} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">New Category</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/inventories/${invId}/${category.id}`}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:shadow-lg hover:shadow-slate-900/50 hover:border-indigo-500/50 transition-all duration-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Tag className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-white mb-1">{category.name}</h4>
                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{category.description ?? ''}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {category.item_count} items
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(category.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
