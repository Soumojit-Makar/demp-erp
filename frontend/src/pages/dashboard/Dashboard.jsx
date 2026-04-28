import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../api';
import StatCard from '../../components/common/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const statusBadge = {
  pending: 'badge-yellow',
  paid: 'badge-green',
  failed: 'badge-red',
  refunded: 'badge-gray',
};

const orderBadge = {
  pending: 'badge-yellow',
  processing: 'badge-blue',
  shipped: 'badge-purple',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dashboardAPI.getStats();
        setData(res.data);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const chartData = data?.monthlyRevenue?.map((m) => ({
    name: monthNames[m._id.month - 1],
    revenue: m.revenue,
    orders: m.count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Active Employees"
          value={data?.stats?.totalEmployees?.toLocaleString() || '0'}
          subtitle="Across all departments"
          icon="◉"
          color="brand"
        />
        <StatCard
          title="Total Products"
          value={data?.stats?.totalProducts?.toLocaleString() || '0'}
          subtitle="In active inventory"
          icon="⬡"
          color="purple"
        />
        <StatCard
          title="Total Orders"
          value={data?.stats?.totalSales?.toLocaleString() || '0'}
          subtitle="All time sales orders"
          icon="◈"
          color="amber"
        />
        <StatCard
          title="Total Revenue"
          value={`$${(data?.stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="From paid orders"
          icon="◆"
          color="green"
        />
      </div>

      {/* Chart + Recent Sales */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-white text-sm">Revenue Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months performance</p>
            </div>
            <span className="badge badge-green">Live</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6271f3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6271f3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,113,243,0.3)', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }}
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6271f3" strokeWidth={2} fill="url(#colorRevenue)" dot={{ fill: '#6271f3', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white text-sm">Low Stock Alert</h3>
            <span className="badge badge-red">{data?.lowStockProducts?.length || 0} items</span>
          </div>
          <div className="space-y-2">
            {data?.lowStockProducts?.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-sm">
                <div className="text-2xl mb-2 opacity-30">✓</div>
                All items well stocked
              </div>
            ) : (
              data?.lowStockProducts?.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
                  <div>
                    <p className="text-sm text-slate-200 font-medium truncate max-w-[140px]">{p.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{p.sku}</p>
                  </div>
                  <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-yellow'}`}>
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white text-sm">Recent Orders</h3>
          <span className="text-xs text-slate-500">Last 5 orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentSales?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">No orders yet</td>
                </tr>
              ) : (
                data?.recentSales?.map((sale) => (
                  <tr key={sale._id}>
                    <td className="font-medium text-slate-200">{sale.customerName}</td>
                    <td className="text-slate-400">{sale.product?.name}</td>
                    <td className="font-mono text-slate-200">${sale.totalAmount?.toFixed(2)}</td>
                    <td><span className={statusBadge[sale.paymentStatus]}>{sale.paymentStatus}</span></td>
                    <td><span className={orderBadge[sale.orderStatus]}>{sale.orderStatus}</span></td>
                    <td className="text-slate-500">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
