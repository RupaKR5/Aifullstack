import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Home, Package, Loader2 } from 'lucide-react';
import { Item, Category, Inventory } from '../types';
import { getCategories, getItems, getInventory, createItem, updateItem, deleteItem } from '../api';

export function ItemsPage() {
  const { invId, catId } = useParams<{ invId: string; catId: string }>();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!invId || !catId) {
      setError('Inventory or category not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    Promise.all([getInventory(invId), getCategories(invId), getItems({ cat_id: catId })])
      .then(([inventoryData, categoriesData, itemsData]) => {
        setInventory(inventoryData);
        setCategories(categoriesData);
        setItems(itemsData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, [invId, catId]);

  const handleCreate = async () => {
    if (!catId) return;
    const name = window.prompt('Item name');
    if (!name) return;
    const sku = window.prompt('SKU') || '';
    try {
      setIsLoading(true);
      await createItem({ name, sku, category_id: catId, quantity: 0, min_stock: 0, price: 0, cost: 0, unit: 'pieces', status: 'in-stock' });
      const newItems = await getItems({ cat_id: catId });
      setItems(newItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (it: Item) => {
    const name = window.prompt('Item name', it.name);
    if (!name) return;
    const sku = window.prompt('SKU', it.sku) || it.sku;
    try {
      setIsLoading(true);
      await updateItem(it.id, { name, sku, category_id: it.category_id, quantity: it.quantity, min_stock: it.min_stock, price: it.price, cost: it.cost, unit: it.unit, status: it.status });
      const newItems = await getItems({ cat_id: catId });
      setItems(newItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (it: Item) => {
    if (!window.confirm(`Delete item "${it.name}"? This cannot be undone.`)) return;
    try {
      setIsLoading(true);
      await deleteItem(it.id);
      const newItems = await getItems({ cat_id: catId });
      setItems(newItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const category = categories.find((cat) => cat.id === catId);

  const getStatusBadge = (status: Item['status']) => {
    const styles = {
      'in-stock': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'low-stock': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'out-of-stock': 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    const labels = {
      'in-stock': 'In Stock',
      'low-stock': 'Low Stock',
      'out-of-stock': 'Out of Stock',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

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

      <nav className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
        <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/inventories" className="hover:text-white transition-colors">
          Inventories
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/inventories/${invId}`} className="hover:text-white transition-colors">
          {inventory?.name ?? 'Inventory'}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white font-medium">{category?.name ?? 'Category'}</span>
      </nav>

          <div className="flex items-center justify-between">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-1">{category?.name ?? 'Category'}</h2>
            <p className="text-sm text-slate-400 mb-4">{category?.description ?? ''}</p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Package className="w-4 h-4" />
              {category?.item_count ?? 0} items
            </div>
          </div>
          <div className="ml-4">
            <button onClick={handleCreate} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">New Item</button>
          </div>
          </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">SKU</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Quantity</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Min Stock</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Price</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Cost</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Supplier</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Unit</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-white">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 font-mono">{item.sku}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.min_stock}</td>
                  <td className="px-6 py-4 text-sm text-emerald-400 font-medium">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{formatCurrency(item.cost)}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.supplier}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{item.unit}</td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{new Date(item.last_updated).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleEdit(item)} className="text-sm text-slate-400 hover:text-white mr-3">Edit</button>
                    <button onClick={() => handleDelete(item)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
