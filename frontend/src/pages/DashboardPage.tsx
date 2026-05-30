import React, { useEffect, useState } from 'react';
import { Package, TrendingUp, AlertTriangle, XCircle, DollarSign, Coins, Archive, Tag, Loader2 } from 'lucide-react';
import { getDashboardStats } from '../api';
import { DashboardStats } from '../types';

const recentActivity = [
  { item: 'Wireless Mouse', action: 'Updated quantity', time: '2 hours ago' },
  { item: 'USB-C Cable', action: 'Added new item', time: '5 hours ago' },
  { item: 'Monitor Stand', action: 'Status changed', time: '1 day ago' },
  { item: 'Keyboard', action: 'Low stock alert', time: '2 days ago' },
];

const topSuppliers = [
  { name: 'TechCorp Inc.', items: 245, value: '$45,800' },
  { name: 'Global Supplies', items: 189, value: '$32,100' },
  { name: 'ElectroParts', items: 156, value: '$28,400' },
  { name: 'OfficeMax Pro', items: 124, value: '$19,200' },
];

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, []);

  const statsData = stats
    ? [
        { label: 'Total Items', value: stats.total_items.toString(), icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'In Stock', value: stats.in_stock.toString(), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Low Stock', value: stats.low_stock.toString(), icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Out of Stock', value: stats.out_of_stock.toString(), icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
        { label: 'Total Value', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.total_value), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Total Cost', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.total_cost), icon: Coins, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Inventories', value: stats.inventory_count.toString(), icon: Archive, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Categories', value: stats.category_count.toString(), icon: Tag, color: 'text-purple-400', bg: 'bg-purple-500/10' },
      ]
    : [];

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:shadow-lg hover:shadow-slate-900/50 transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <div className="text-sm font-medium text-white">{activity.item}</div>
                  <div className="text-xs text-slate-500">{activity.action}</div>
                </div>
                <div className="text-xs text-slate-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Top Suppliers</h2>
          <div className="space-y-3">
            {topSuppliers.map((supplier, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <div className="text-sm font-medium text-white">{supplier.name}</div>
                  <div className="text-xs text-slate-500">{supplier.items} items</div>
                </div>
                <div className="text-sm text-emerald-400">{supplier.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
