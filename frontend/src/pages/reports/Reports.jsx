import { useState, useEffect } from 'react';
import { reportAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#6271f3', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const tabs = [
  { id: 'sales', label: 'Sales Report' },
  { id: 'inventory', label: 'Inventory Report' },
  { id: 'employees', label: 'Employee Report' },
];

function SummaryCard({ label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'text-brand-400',
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-display font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchReport = async () => {
    setLoading(true);
    setData(null);
    try {
      let res;
      if (activeTab === 'sales') res = await reportAPI.getSales(dateRange);
      else if (activeTab === 'inventory') res = await reportAPI.getInventory();
      else res = await reportAPI.getEmployees();
      setData(res.data);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const statusBadge = {
    pending: 'badge-yellow',
    paid: 'badge-green',
    failed: 'badge-red',
    refunded: 'badge-gray',
    processing: 'badge-blue',
    shipped: 'badge-purple',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Business intelligence across all modules</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800/60 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sales Date Filter */}
      {activeTab === 'sales' && (
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="form-label">From</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
              className="form-input w-40"
            />
          </div>
          <div>
            <label className="form-label">To</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((p) => ({ ...p, endDate: e.target.value }))}
              className="form-input w-40"
            />
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <button onClick={fetchReport} className="btn-primary">Apply Filter</button>
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={() => {
                  setDateRange({ startDate: '', endDate: '' });
                  fetchReport();
                }}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm">Generating report...</p>
          </div>
        </div>
      )}

      {/* ─── SALES REPORT ─── */}
      {!loading && data && activeTab === 'sales' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Orders" value={data.summary?.totalOrders} />
            <SummaryCard label="Total Revenue" value={`$${data.summary?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="green" />
            <SummaryCard label="Pending Payments" value={data.summary?.pendingPayments} color="amber" />
            <SummaryCard label="Delivered Orders" value={data.summary?.deliveredOrders} color="brand" />
          </div>

          <div className="table-container">
            <div className="px-4 py-3 border-b border-slate-800/60">
              <h3 className="font-display font-bold text-white text-sm">All Orders</h3>
            </div>
            <div className="table-wrapper">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Order</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sales?.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-slate-500">No sales in this period</td></tr>
                  ) : (
                    data.sales?.map((s) => (
                      <tr key={s._id}>
                        <td className="font-medium text-slate-200">{s.customerName}</td>
                        <td className="text-slate-400">{s.product?.name}</td>
                        <td className="text-center">{s.quantity}</td>
                        <td className="font-mono text-slate-200">${s.totalAmount?.toFixed(2)}</td>
                        <td><span className={statusBadge[s.paymentStatus]}>{s.paymentStatus}</span></td>
                        <td><span className={statusBadge[s.orderStatus]}>{s.orderStatus}</span></td>
                        <td className="text-slate-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── INVENTORY REPORT ─── */}
      {!loading && data && activeTab === 'inventory' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Products" value={data.summary?.totalProducts} />
            <SummaryCard label="Low Stock Items" value={data.summary?.lowStockCount} color="amber" />
            <SummaryCard label="Out of Stock" value={data.summary?.outOfStockCount} color="red" />
            <SummaryCard label="Inventory Value" value={`$${data.summary?.totalInventoryValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Category Distribution Chart */}
            <div className="glass-card p-5">
              <h3 className="font-display font-bold text-white text-sm mb-4">Stock by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.categoryStats} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,113,243,0.3)', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }} />
                  <Bar dataKey="totalStock" fill="#6271f3" radius={[4, 4, 0, 0]} name="Total Stock" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Value by Category Pie */}
            <div className="glass-card p-5">
              <h3 className="font-display font-bold text-white text-sm mb-4">Value Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.categoryStats}
                    dataKey="totalValue"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.categoryStats?.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`$${v.toLocaleString()}`, 'Value']}
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,113,243,0.3)', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock Table */}
          {data.lowStockProducts?.length > 0 && (
            <div className="table-container">
              <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-sm">⚠ Low Stock Items (≤10 units)</h3>
                <span className="badge badge-red">{data.lowStockProducts.length} items</span>
              </div>
              <div className="table-wrapper">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStockProducts.map((p) => (
                      <tr key={p._id}>
                        <td className="font-medium text-slate-200">{p.name}</td>
                        <td className="font-mono text-xs text-slate-400">{p.sku}</td>
                        <td>{p.category}</td>
                        <td>
                          <span className={p.stock === 0 ? 'badge-red badge' : 'badge-yellow badge'}>
                            {p.stock} left
                          </span>
                        </td>
                        <td className="font-mono text-slate-300">${p.price}</td>
                        <td className="text-slate-400">{p.supplier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── EMPLOYEE REPORT ─── */}
      {!loading && data && activeTab === 'employees' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Employees" value={data.summary?.totalEmployees} />
            <SummaryCard label="Active" value={data.summary?.activeEmployees} color="green" />
            <SummaryCard label="On Leave" value={data.summary?.onLeave} color="amber" />
            <SummaryCard label="Monthly Budget" value={`$${data.summary?.totalSalaryBudget?.toLocaleString()}`} color="brand" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Dept Distribution Bar */}
            <div className="glass-card p-5">
              <h3 className="font-display font-bold text-white text-sm mb-4">Headcount by Department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.departmentStats} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="_id" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,113,243,0.3)', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Headcount" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Avg Salary by Dept */}
            <div className="glass-card p-5">
              <h3 className="font-display font-bold text-white text-sm mb-4">Avg Salary by Department</h3>
              <div className="space-y-2 overflow-y-auto max-h-52">
                {data.departmentStats?.map((d, i) => (
                  <div key={d._id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-slate-300">{d._id}</span>
                      <span className="badge badge-gray">{d.count}</span>
                    </div>
                    <span className="font-mono text-sm text-slate-200">${Math.round(d.avgSalary).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Employee Full Table */}
          <div className="table-container">
            <div className="px-4 py-3 border-b border-slate-800/60">
              <h3 className="font-display font-bold text-white text-sm">All Employees</h3>
            </div>
            <div className="table-wrapper">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Salary</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.allEmployees?.map((e) => (
                    <tr key={e._id}>
                      <td>
                        <div className="font-medium text-slate-200">{e.name}</div>
                        <div className="text-xs text-slate-500">{e.email}</div>
                      </td>
                      <td>{e.department}</td>
                      <td className="text-slate-400">{e.designation}</td>
                      <td className="font-mono text-slate-300">${e.salary?.toLocaleString()}</td>
                      <td className="text-slate-500 text-xs">{new Date(e.joiningDate).toLocaleDateString()}</td>
                      <td>
                        <span className={e.status === 'active' ? 'badge badge-green' : e.status === 'on-leave' ? 'badge badge-yellow' : 'badge badge-red'}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
