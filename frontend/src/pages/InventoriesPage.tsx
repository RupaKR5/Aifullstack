import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Tag, Calendar, Loader2 } from 'lucide-react';
import { Inventory } from '../types';
import { getInventories, createInventory, updateInventory, deleteInventory } from '../api';

export function InventoriesPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getInventories()
      .then(setInventories)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    const name = window.prompt('Inventory name');
    if (!name) return;
    const description = window.prompt('Description (optional)') || undefined;
    try {
      setIsLoading(true);
      await createInventory(name, description);
      const list = await getInventories();
      setInventories(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (inv: Inventory) => {
    const name = window.prompt('Inventory name', inv.name);
    if (!name) return;
    const description = window.prompt('Description (optional)', inv.description ?? '') || undefined;
    try {
      setIsLoading(true);
      await updateInventory(inv.id, name, description);
      const list = await getInventories();
      setInventories(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (inv: Inventory) => {
    if (!window.confirm(`Delete inventory "${inv.name}"? This cannot be undone.`)) return;
    try {
      setIsLoading(true);
      await deleteInventory(inv.id);
      const list = await getInventories();
      setInventories(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Your Inventories</h2>
          <p className="text-sm text-slate-400 mt-1">Manage and organize your inventory collections</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            New Inventory
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventories.map((inventory) => (
          <div key={inventory.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:shadow-lg hover:shadow-slate-900/50 hover:border-indigo-500/50 transition-all duration-200 group">
            <div className="flex justify-end">
              <button onClick={() => handleEdit(inventory)} className="text-sm text-slate-400 hover:text-white mr-3">Edit</button>
              <button onClick={() => handleDelete(inventory)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
            </div>
            <Link to={`/inventories/${inventory.id}`} className="block -mt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                <Package className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1 truncate">{inventory.name}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{inventory.description ?? ''}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Tag className="w-4 h-4" />
                    <span>{inventory.category_count} categories</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Package className="w-4 h-4" />
                    <span>{inventory.item_count} items</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {formatDate(inventory.created_at)}
                </div>
              </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
